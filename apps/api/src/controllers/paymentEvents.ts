import { Prisma } from "@prisma/client";
import {
  PaymentCapturedEvent,
  PaymentFailedEvent,
  RefundProcessedEvent,
  DisputeCreatedEvent,
  DisputeClosedEvent,
} from "../types/razorpay.types";
import { prisma } from "../lib/prisma";
import { logWebhookReplay } from "../utils/webhookLogger";
import { notificationQueue } from "../lib/queue";

/**
 * Handle Payment Captured
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function handlePaymentCaptured(event: PaymentCapturedEvent) {
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

  try {
    await prisma.$transaction(
      async (tx) => {
        // 1. Check current capacity
        const bookingInProgress = await tx.booking.findUnique({
          where: { id: payment.bookingId },
          include: { trip: true },
        });

        if (!bookingInProgress) return;

        const confirmedCount = await tx.booking.count({
          where: {
            tripId: bookingInProgress.tripId,
            status: "CONFIRMED",
            NOT: { id: bookingInProgress.id },
          },
        });

        if (confirmedCount >= bookingInProgress.trip.capacity) {
          // OVERBOOKED CASE: Fail payment and reject booking
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              providerPaymentId: razorpayPaymentId,
              status: "FAILED",
              rawPayload: { ...event, overbooked: true } as unknown as Prisma.InputJsonValue,
            },
          });
          await tx.booking.update({
            where: { id: payment.bookingId },
            data: {
              paymentStatus: "FAILED",
              status: "REJECTED",
              notes: "Trip capacity reached before payment capture. Contact support for refund.",
            },
          });
          return;
        }

        // 2. Proceed with capture
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            providerPaymentId: razorpayPaymentId,
            status: "CAPTURED",
            rawPayload: event as unknown as Prisma.InputJsonValue,
            method:
              (paymentEntity?.method?.toUpperCase() as import("@prisma/client").PaymentMethod) ||
              "OTHER",
          },
        });

        await tx.booking.update({
          where: { id: payment.bookingId },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
          },
        });
      },
      {
        isolationLevel: "Serializable",
      },
    );
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    // Handle uniqueness error (P2002) as an idempotent success if providerPaymentId already exists
    if (err.code === "P2002") {
      logWebhookReplay({
        provider: "razorpay",
        event: "payment.captured",
        paymentId: payment.id,
        providerPaymentId: razorpayPaymentId,
        metadata: { info: "Caught P2002 unique constraint" },
      });
      return;
    }
    throw error;
  }

  // Send Notification (Async, non-blocking)
  const booking = await prisma.booking.findUnique({
    where: { id: payment.bookingId },
    include: { trip: true },
  });

  if (booking && booking.status === "CONFIRMED") {
    try {
      await notificationQueue.add("SEND_PAYMENT_EMAIL", {
        userId: booking.userId,
        details: {
          tripTitle: booking.trip.title,
          amount: payment.amount,
          bookingId: booking.id,
          paymentId: payment.id,
        },
      });
    } catch (err) {
      console.error("Failed to queue notification:", err);
    }
  }
}

/**
 * Handle Payment Failed
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function handlePaymentFailed(event: PaymentFailedEvent) {
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
        rawPayload: event as unknown as Prisma.InputJsonValue,
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
    include: { trip: true },
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
          reason: reason,
        },
      });
    } catch (err) {
      console.error("Failed to queue failure notification:", err);
    }
  }
}

/**
 * Handle Refund Processed
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function handleRefundProcessed(event: RefundProcessedEvent) {
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
        rawPayload: event as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: "PAID", // Refunded payment is still originally PAID? No, let's keep status
        status: "CANCELLED",
      },
    }),
  ]);

  // Send Notification (Async, non-blocking)
  const booking = await prisma.booking.findUnique({
    where: { id: payment.bookingId },
    include: { trip: true },
  });

  if (booking) {
    try {
      await notificationQueue.add("SEND_REFUND_EMAIL", {
        userId: booking.userId,
        details: {
          tripTitle: booking.trip.title,
          amount: refundEntity?.amount || 0,
          bookingId: booking.id,
          refundId: refundEntity?.id,
        },
      });
    } catch (err) {
      console.error("Failed to queue refund notification:", err);
    }
  }
}

/**
 * Handle Dispute Created
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function handleDisputeCreated(event: DisputeCreatedEvent) {
  const dispute = event.payload?.dispute?.entity;
  const paymentId = dispute?.payment_id;

  if (!paymentId) return;

  await prisma.payment.updateMany({
    where: { providerPaymentId: paymentId },
    data: {
      status: "DISPUTED",
      disputeId: dispute.id,
      rawPayload: event as unknown as Prisma.InputJsonValue,
    },
  });
}

/**
 * Handle Dispute Lost
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function handleDisputeLost(event: DisputeClosedEvent) {
  const dispute = event.payload?.dispute?.entity;
  const paymentId = dispute?.payment_id;

  if (!paymentId) return;

  await prisma.payment.updateMany({
    where: { providerPaymentId: paymentId },
    data: {
      status: "REFUNDED",
      rawPayload: event as unknown as Prisma.InputJsonValue,
    },
  });

  const payment = await prisma.payment.findFirst({ where: { providerPaymentId: paymentId } });
  if (payment) {
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CANCELLED" },
    });
  }
}

/**
 * Handle Dispute Won
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function handleDisputeWon(event: DisputeClosedEvent) {
  const dispute = event.payload?.dispute?.entity;
  const paymentId = dispute?.payment_id;

  if (!paymentId) return;

  await prisma.payment.updateMany({
    where: { providerPaymentId: paymentId },
    data: {
      status: "CAPTURED",
      rawPayload: event as unknown as Prisma.InputJsonValue,
    },
  });
}
