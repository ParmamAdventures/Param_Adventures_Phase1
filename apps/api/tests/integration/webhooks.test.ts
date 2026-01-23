import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";

jest.mock("../../src/services/razorpay.service", () => ({
  verifyRazorpaySignature: jest.fn(() => true),
}));

jest.mock("../../src/lib/queue", () => ({
  notificationQueue: {
    add: jest.fn(),
    close: jest.fn(),
    quit: jest.fn(),
  },
  notificationWorker: {
    close: jest.fn(),
    stop: jest.fn(),
  },
}));

import { verifyRazorpaySignature } from "../../src/services/razorpay.service";
import { notificationQueue } from "../../src/lib/queue";

const buildPaymentCapturedEvent = (orderId: string, paymentId: string) => ({
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: paymentId,
        order_id: orderId,
        method: "UPI",
      },
    },
  },
});

const buildPaymentFailedEvent = (orderId: string, paymentId: string) => ({
  event: "payment.failed",
  payload: {
    payment: {
      entity: {
        id: paymentId,
        order_id: orderId,
        error_code: "BAD_FUNDS",
        error_description: "Insufficient funds",
      },
    },
  },
});

const buildRefundProcessedEvent = (paymentId: string, amount: number) => ({
  event: "refund.processed",
  payload: {
    refund: {
      entity: {
        id: "rfnd_test",
        payment_id: paymentId,
        amount,
      },
    },
  },
});

describe("Razorpay Webhooks", () => {
  let userId: string;
  let tripId: string;

  beforeAll(async () => {
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.blog.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        email: "webhook@test.com",
        password: "hashed",
        name: "Webhook User",
      },
    });
    userId = user.id;

    const trip = await prisma.trip.create({
      data: {
        title: "Webhook Trip",
        slug: "webhook-trip",
        description: "Trip for webhook tests",
        itinerary: {},
        price: 5000,
        status: "PUBLISHED",
        location: "Test",
        durationDays: 3,
        difficulty: "EASY",
        capacity: 10,
        startDate: new Date("2024-12-01"),
        endDate: new Date("2024-12-04"),
        createdById: userId,
      },
    });
    tripId = trip.id;
  });

  beforeEach(() => {
    (verifyRazorpaySignature as jest.Mock).mockReturnValue(true);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
  });

  afterAll(async () => {
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.blog.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.user.deleteMany();
  });

  const postWebhook = (payload: any, signature = "valid") =>
    request(app)
      .post("/webhooks/razorpay")
      .set("x-razorpay-signature", signature)
      .set("Content-Type", "application/json")
      .send(JSON.stringify(payload));

  it("returns 400 when signature header is missing", async () => {
    const res = await request(app)
      .post("/webhooks/razorpay")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ event: "payment.captured" }));

    expect(res.status).toBe(400);
  });

  it("rejects invalid signature", async () => {
    (verifyRazorpaySignature as jest.Mock).mockReturnValueOnce(false);

    const res = await postWebhook(buildPaymentCapturedEvent("order_bad", "pay_bad"), "invalid");

    expect(res.status).toBe(400);
  });

  it("processes payment.captured and updates booking/payment", async () => {
    const booking = await prisma.booking.create({
      data: {
        userId,
        tripId,
        guests: 1,
        totalPrice: 5000,
        status: "REQUESTED",
        startDate: new Date("2024-12-01"),
      },
    });

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: "RAZORPAY",
        providerOrderId: "order_captured",
        amount: 500000,
        status: "CREATED",
        method: "UPI",
      },
    });

    const res = await postWebhook(buildPaymentCapturedEvent("order_captured", "pay_captured"));

    expect(res.status).toBe(200);

    const updatedPayment = await prisma.payment.findUnique({ where: { id: payment.id } });
    expect(updatedPayment?.status).toBe("CAPTURED");
    expect(updatedPayment?.providerPaymentId).toBe("pay_captured");
    expect(updatedPayment?.method).toBe("UPI");

    const updatedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(updatedBooking?.status).toBe("CONFIRMED");
    expect(updatedBooking?.paymentStatus).toBe("PAID");

    expect(notificationQueue.add).toHaveBeenCalledWith(
      "SEND_PAYMENT_EMAIL",
      expect.objectContaining({
        userId: booking.userId,
        details: expect.objectContaining({ bookingId: booking.id, paymentId: payment.id }),
      }),
    );
  });

  it("processes payment.failed and marks failed", async () => {
    const booking = await prisma.booking.create({
      data: {
        userId,
        tripId,
        guests: 1,
        totalPrice: 5000,
        status: "REQUESTED",
        startDate: new Date("2024-12-01"),
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: "RAZORPAY",
        providerOrderId: "order_failed",
        amount: 500000,
        status: "CREATED",
        method: "CARD",
      },
    });

    const res = await postWebhook(buildPaymentFailedEvent("order_failed", "pay_failed"));

    expect(res.status).toBe(200);

    const updatedPayment = await prisma.payment.findFirst({
      where: { providerOrderId: "order_failed" },
    });
    expect(updatedPayment?.status).toBe("FAILED");

    const updatedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(updatedBooking?.paymentStatus).toBe("FAILED");

    expect(notificationQueue.add).toHaveBeenCalledWith(
      "SEND_PAYMENT_FAILED",
      expect.objectContaining({ userId: booking.userId }),
    );
  });

  it("processes refund.processed and cancels booking", async () => {
    const booking = await prisma.booking.create({
      data: {
        userId,
        tripId,
        guests: 1,
        totalPrice: 5000,
        status: "CONFIRMED",
        startDate: new Date("2024-12-01"),
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: "RAZORPAY",
        providerOrderId: "order_refund",
        providerPaymentId: "pay_refund",
        amount: 500000,
        status: "CAPTURED",
        method: "CARD",
      },
    });

    const res = await postWebhook(buildRefundProcessedEvent("pay_refund", 500000));

    expect(res.status).toBe(200);

    const updatedPayment = await prisma.payment.findFirst({
      where: { providerPaymentId: "pay_refund" },
    });
    expect(updatedPayment?.status).toBe("REFUNDED");

    const updatedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(updatedBooking?.status).toBe("CANCELLED");

    expect(notificationQueue.add).toHaveBeenCalledWith(
      "SEND_REFUND_EMAIL",
      expect.objectContaining({ userId: booking.userId }),
    );
  });
});
