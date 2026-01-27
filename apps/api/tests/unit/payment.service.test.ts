jest.mock("../../src/lib/prisma", () => {
  const payment = {
    findUnique: jest.fn(),
    update: jest.fn(),
  };
  const booking = {
    update: jest.fn(),
  };
  return {
    prisma: {
      payment,
      booking,
      $transaction: jest.fn((actions: Array<Promise<unknown>>) => Promise.all(actions)),
    },
  };
});

jest.mock("../../src/services/razorpay.service", () => ({
  razorpayService: {
    fetchPayment: jest.fn(),
  },
}));

jest.mock("../../src/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { paymentService } from "../../src/services/payment.service";
import { prisma } from "../../src/lib/prisma";
import { razorpayService } from "../../src/services/razorpay.service";
import { logger } from "../../src/lib/logger";

describe("paymentService.reconcilePayment", () => {
  const paymentId = "pay_local_1";
  const providerPaymentId = "prov_123";
  const bookingId = "booking_1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs and returns when payment is missing", async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

    await paymentService.reconcilePayment(paymentId);

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Payment not found"));
    expect(razorpayService.fetchPayment).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("logs and returns when providerPaymentId is missing", async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
      id: paymentId,
      providerPaymentId: null,
      status: "CREATED",
      bookingId,
    });

    await paymentService.reconcilePayment(paymentId);

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("has no provider ID"));
    expect(razorpayService.fetchPayment).not.toHaveBeenCalled();
  });

  it("returns early for final statuses", async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
      id: paymentId,
      providerPaymentId,
      status: "CAPTURED",
      bookingId,
    });

    await paymentService.reconcilePayment(paymentId);

    expect(razorpayService.fetchPayment).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("updates payment and booking when remote status is captured", async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
      id: paymentId,
      providerPaymentId,
      status: "AUTHORIZED",
      bookingId,
    });
    (razorpayService.fetchPayment as jest.Mock).mockResolvedValue({ status: "captured" });

    await paymentService.reconcilePayment(paymentId);

    expect(razorpayService.fetchPayment).toHaveBeenCalledWith(providerPaymentId);
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: paymentId },
      data: { status: "CAPTURED" },
    });
    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: bookingId },
      data: { paymentStatus: "PAID", status: "CONFIRMED" },
    });
  });

  it("marks payment failed when remote status is failed", async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
      id: paymentId,
      providerPaymentId,
      status: "AUTHORIZED",
      bookingId,
    });
    (razorpayService.fetchPayment as jest.Mock).mockResolvedValue({ status: "failed" });

    await paymentService.reconcilePayment(paymentId);

    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: paymentId },
      data: { status: "FAILED" },
    });
    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: bookingId },
      data: { paymentStatus: "FAILED" },
    });
  });

  it("propagates errors from fetchPayment for retry", async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
      id: paymentId,
      providerPaymentId,
      status: "AUTHORIZED",
      bookingId,
    });
    (razorpayService.fetchPayment as jest.Mock).mockRejectedValue(new Error("network"));

    await expect(paymentService.reconcilePayment(paymentId)).rejects.toThrow("network");
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Reconciliation failed"),
      expect.objectContaining({ error: expect.any(Error) }),
    );
  });

  it("should throw error on network timeout during fetchPayment (Edge Case)", async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue({
      id: paymentId,
      providerPaymentId,
      status: "AUTHORIZED",
      bookingId,
    });

    const timeoutError = new Error("Gateway Timeout") as Error & { code: string };
    timeoutError.code = "ETIMEDOUT"; // Simulate network code if relevant, or just generic error
    (razorpayService.fetchPayment as jest.Mock).mockRejectedValue(timeoutError);

    await expect(paymentService.reconcilePayment(paymentId)).rejects.toThrow("Gateway Timeout");

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Reconciliation failed"),
      expect.objectContaining({ error: timeoutError }),
    );
  });
});
