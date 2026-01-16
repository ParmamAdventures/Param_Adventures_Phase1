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
    // 1. Process Refund with Razorpay
    const refund = await razorpayService.refundPayment(paymentToRefund.providerPaymentId, {
      bookingId: booking.id,
      reason: "Admin initiated refund",
    });

    // 2. Update Database
    // Update Payment record
    await prisma.payment.update({
      where: { id: paymentToRefund.id },
      data: {
        razorpayRefundId: refund.id,
      },
    });

    // Update Booking Status to CANCELLED (since we refunded it)
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });

    // 3. Send Notification
    await notificationQueue.add("SEND_REFUND_EMAIL", {
      userId: booking.userId,
      details: {
        tripTitle: booking.trip.title,
        amount: refund.amount,
        bookingId: booking.id,
        refundId: refund.id
      }
    });

    return ApiResponse.success(res, "Refund processed successfully", {
      refund,
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error("Refund Controller Error:", error);
    throw new HttpError(
      502,
      "GATEWAY_ERROR",
      error.error?.description || "Refund processing failed",
    );
  }
};
