import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

(async function main() {
  process.env.RAZORPAY_WEBHOOK_SECRET =
    process.env.RAZORPAY_WEBHOOK_SECRET || "testsecret";
  const prisma = new PrismaClient();
  try {
    // Find an existing payment that is already CAPTURED (so replay makes sense)
    const payment = await prisma.payment.findFirst({
      where: { status: "CAPTURED", provider: "razorpay" },
      orderBy: { updatedAt: "desc" },
    });

    if (!payment) {
      console.error(
        "No captured razorpay payment found to replay. Run test_webhook_e2e.ts first."
      );
      process.exit(2);
    }

    const booking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
    });

    console.log("Replaying webhook for:", {
      paymentId: payment.id,
      providerOrderId: payment.providerOrderId,
      providerPaymentId: payment.providerPaymentId,
    });

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: payment.providerPaymentId,
            order_id: payment.providerOrderId,
          },
        },
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

    // Snapshot before
    const beforePayment = await prisma.payment.findUnique({
      where: { id: payment.id },
    });
    const beforeBooking = booking;

    await (mod as any).razorpayWebhookHandler(req, res);

    const afterPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
    });
    const afterBooking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
    });

    console.log("Before:", { payment: beforePayment, booking: beforeBooking });
    console.log("After:", { payment: afterPayment, booking: afterBooking });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
})();
