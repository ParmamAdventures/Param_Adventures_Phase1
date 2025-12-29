import { prisma } from "../lib/prisma";
import { logWebhookReplay } from "../utils/webhookLogger";

export async function handlePaymentCaptured(event: any) {
  const paymentEntity = event.payload?.payment?.entity;
  const razorpayPaymentId = paymentEntity?.id;
  const razorpayOrderId = paymentEntity?.order_id;

  if (!razorpayOrderId) return;

  const payment = await prisma.payment.findUnique({
    where: { providerOrderId: razorpayOrderId },
  });

  if (!payment) return;

  if (payment.status === "CAPTURED") {
    // Log replayed capture event for observability
    logWebhookReplay({
      provider: "razorpay",
      event: "payment.captured",
      paymentId: payment.id,
      providerPaymentId: razorpayPaymentId,
    });
    // increment replay metric
    try {
      const { incReplay } = await import("../metrics/webhookMetrics");
      incReplay();
    } catch (e) {
      // non-fatal
    }
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: razorpayPaymentId,
        status: "CAPTURED",
        rawPayload: event,
      },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
    }),
  ]);
}

export async function handlePaymentFailed(event: any) {
  const paymentEntity = event.payload?.payment?.entity;
  const razorpayPaymentId = paymentEntity?.id;
  const razorpayOrderId = paymentEntity?.order_id;

  if (!razorpayOrderId) return;

  const payment = await prisma.payment.findUnique({
    where: { providerOrderId: razorpayOrderId },
  });

  if (!payment) return;

  if (payment.status === "FAILED") {
    // Log replayed failed event for observability
    logWebhookReplay({
      provider: "razorpay",
      event: "payment.failed",
      paymentId: payment.id,
      providerPaymentId: razorpayPaymentId,
    });
    // increment replay metric
    try {
      const { incReplay } = await import("../metrics/webhookMetrics");
      incReplay();
    } catch (e) {
      // non-fatal
    }
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: razorpayPaymentId,
        status: "FAILED",
        rawPayload: event,
      },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: "FAILED",
      },
    }),
  ]);
}

export async function handleRefundProcessed(event: any) {
  const refundEntity = event.payload?.refund?.entity;
  const razorpayPaymentId = refundEntity?.payment_id;

  if (!razorpayPaymentId) return;

  const payment = await prisma.payment.findUnique({
    where: { providerPaymentId: razorpayPaymentId },
  });

  if (!payment) return;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "REFUNDED",
        rawPayload: event,
      },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: "CANCELLED",
      },
    }),
  ]);
}
