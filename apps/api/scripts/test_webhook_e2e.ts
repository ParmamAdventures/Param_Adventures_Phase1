import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

(async function main() {
  process.env.RAZORPAY_WEBHOOK_SECRET = "testsecret";
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.create({
      data: {
        email: `test.pay+${Date.now()}@local.test`,
        password: "x",
        name: "Test Pay",
      },
    });
    const trip = await prisma.trip.create({
      data: {
        title: "T",
        slug: `t-${Date.now()}`,
        description: "d",
        itinerary: [],
        durationDays: 1,
        difficulty: "easy",
        location: "here",
        price: 1000,
        status: "PUBLISHED",
        createdById: user.id,
      },
    });
    const booking = await prisma.booking.create({
      data: { userId: user.id, tripId: trip.id, status: "CONFIRMED" },
    });
    const orderId = `order_test_${Date.now()}`;
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: "razorpay",
        providerOrderId: orderId,
        amount: trip.price,
        status: "CREATED",
      },
    });

    console.log("Created:", { bookingId: booking.id, paymentId: payment.id });

    const razorpayPaymentId = `pay_test_${Date.now()}`;
    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: { entity: { id: razorpayPaymentId, order_id: orderId } },
      },
    });
    const sig = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");

    const mod = await import("../src/controllers/razorpayWebhook.controller");
    const req: any = {
      headers: { "x-razorpay-signature": sig },
      body: Buffer.from(payload, "utf8"),
    };
    const res: any = {
      status: (s: number) => ({
        json: (o: any) => {
          console.log("RESPONSE", s, o);
        },
      }),
    };

    await (mod as any).razorpayWebhookHandler(req, res);

    const afterPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
    });
    const afterBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
    });

    console.log("After:", { payment: afterPayment, booking: afterBooking });
  } catch (err) {
    console.error("ERR", err);
  } finally {
    await prisma.$disconnect();
  }
})();
