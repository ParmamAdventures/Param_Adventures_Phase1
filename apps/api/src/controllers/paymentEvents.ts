import { prisma } from "../lib/prisma";
import { logWebhookReplay } from "../utils/webhookLogger";
import { notificationQueue } from "../lib/queue";

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
    } catch {
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

  // Send Notification (Async, non-blocking)
  const booking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
      include: { trip: true }
  });

  if (booking) {
      try {
        await notificationQueue.add("SEND_PAYMENT_EMAIL", {
            userId: booking.userId,
            details: {
                tripTitle: booking.trip.title,
                amount: payment.amount,
                bookingId: booking.id,
                paymentId: payment.id
            }
        });
      } catch (err) {
        console.error("Failed to queue notification:", err);
      }
  }
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
    } catch {
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

  // Send Notification (Async)
  const booking = await prisma.booking.findUnique({
    where: { id: payment.bookingId },
    include: { trip: true }
  });

  if (booking) {
    const payload = event.payload?.payment?.entity;
    const reason = payload?.error_description || payload?.error_code || "Transaction failed";
    
    try {
      await notificationQueue.add("SEND_PAYMENT_FAILED", {
          userId: booking.userId,
          details: {
              tripTitle: booking.trip.title,
              amount: payment.amount,
              reason: reason
          }
      });
    } catch (err) {
      console.error("Failed to queue failure notification:", err);
    }
  }
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

  // Send Notification (Async, non-blocking)
  const booking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
      include: { trip: true }
  });

  if (booking) {
      try {
        await notificationQueue.add("SEND_REFUND_EMAIL", {
            userId: booking.userId,
            details: {
                tripTitle: booking.trip.title,
                amount: refundEntity?.amount || 0,
                bookingId: booking.id,
                refundId: refundEntity?.id
            }
        });
      } catch (err) {
        console.error("Failed to queue refund notification:", err);
      }
  }
}
