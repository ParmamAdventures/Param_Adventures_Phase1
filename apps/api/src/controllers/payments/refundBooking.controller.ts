import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { razorpayService } from "../../services/razorpay.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { notificationQueue } from "../../lib/queue";
import { HttpError } from "../../utils/httpError";

export const refundBooking = async (req: Request, res: Response) => {
  const { id } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { payments: true, trip: true }, // Include trip for email details
  });

  if (!booking) {
    throw new HttpError(404, "NOT_FOUND", "Booking not found");
  }

  // Find a captured payment to refund (Assuming single payment for now)
  const paymentToRefund = booking.payments.find(
    (p) => p.status === "CAPTURED" || p.status === "AUTHORIZED",
  );

  if (!paymentToRefund || !paymentToRefund.providerPaymentId) {
    throw new HttpError(400, "BAD_REQUEST", "No refundable payment found for this booking");
  }

  if (booking.status === "CANCELLED" && paymentToRefund.status === "REFUNDED") {
    throw new HttpError(400, "BAD_REQUEST", "Booking is already cancelled and refunded");
  }

  try {
    const existingRefund = paymentToRefund.refundedAmount || 0;
    const amountToRefund = req.body.amount || paymentToRefund.amount - existingRefund;
    const shouldCancel = req.body.cancelBooking !== false; // Default to true unless explicitly false

    // Validation
    if (amountToRefund <= 0) throw new HttpError(400, "BAD_REQUEST", "Invalid refund amount");
    if (existingRefund + amountToRefund > paymentToRefund.amount) {
      throw new HttpError(400, "BAD_REQUEST", "Refund amount exceeds refundable balance");
    }

    // 1. Process Refund with Razorpay
    const refund = await razorpayService.refundPayment(paymentToRefund.providerPaymentId, {
      amount: amountToRefund,
      notes: {
        reason: req.body.reason || "Admin initiated refund",
        bookingId: booking.id,
      },
    });

    // 2. Update Database
    const newTotalRefunded = existingRefund + parseInt(String(refund.amount || amountToRefund)); // Razorpay returns amount
    const isFullRefund = newTotalRefunded >= paymentToRefund.amount;
    const newStatus = isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED";

    // Update Payment record
    await prisma.payment.update({
      where: { id: paymentToRefund.id },
      data: {
        razorpayRefundId: refund.id,
        refundedAmount: newTotalRefunded,
        status: newStatus,
      },
    });

    // Update Booking Status
    let bookingStatus = booking.status;
    if (shouldCancel || isFullRefund) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" },
      });
      bookingStatus = "CANCELLED";
    }

    // 3. Send Notification
    await notificationQueue.add("SEND_REFUND_EMAIL", {
      userId: booking.userId,
      details: {
        tripTitle: booking.trip.title,
        amount: refund.amount,
        bookingId: booking.id,
        refundId: refund.id,
      },
    });

    return ApiResponse.success(res, {
      refund,
      booking: {
        id: booking.id,
        status: bookingStatus,
        paymentStatus: booking.paymentStatus,
      },
    }, "Refund processed successfully");
  } catch (error: any) {
    console.error("Refund Controller Error:", error);
    throw new HttpError(
      502,
      "GATEWAY_ERROR",
      error.error?.description || "Refund processing failed",
    );
  }
};

