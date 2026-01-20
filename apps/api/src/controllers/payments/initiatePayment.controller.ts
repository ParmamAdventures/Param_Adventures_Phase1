import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { razorpayService } from "../../services/razorpay.service";
import { HttpError } from "../../utils/httpError";
import { ErrorMessages } from "../../constants/errorMessages";
import { logger } from "../../lib/logger";
import { env } from "../../config/env";
import { notificationQueue } from "../../lib/queue";

/**
 * Initiate Payment
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function initiatePayment(req: Request, res: Response) {
  const userId = (req.user as any).id;
  const { id: bookingId } = req.params;
  console.log("HIT INITIATE PAYMENT", bookingId);

  if (!bookingId) {
    throw new HttpError(400, "INVALID_REQUEST", "Booking ID is required");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { trip: true }, // Need trip details for amount validation if needed, or just trusting DB
  });

  if (!booking) {
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.BOOKING_NOT_FOUND);
  }

  // Security check: ensure user owns the booking
  if (booking.userId !== userId) {
    throw new HttpError(403, "FORBIDDEN", "You are not authorized to pay for this booking");
  }

  // Validation: Check if booking is in a valid state for payment
  // Allowing REQUESTED (initial state) or PENDING_PAYMENT if that was a state (schema says REQUESTED/CONFIRMED)
  // And paymentStatus should not be PAID
  if (booking.paymentStatus === "PAID") {
    throw new HttpError(400, "INVALID_STATE", "Booking is already paid");
  }

  if (booking.status === "CANCELLED" || booking.status === "REJECTED") {
    throw new HttpError(
      400,
      "INVALID_STATE",
      `Cannot pay for a ${booking.status.toLowerCase()} booking`,
    );
  }

  // Calculate amount in paise (100 paise = 1 INR)
  // booking.totalPrice is presumed to be in INR based on typical usage,
  // BUT schema says `amount` in Payment is in paise.
  // Let's verify usage. `createPaymentIntent` used `booking.trip.price * 100`.
  // `booking.totalPrice` is likely in INR.
  const amountInPaise = booking.totalPrice * 100;

  if (amountInPaise <= 0) {
    throw new HttpError(400, "INVALID_AMOUNT", "Invalid booking amount");
  }

  try {
    // Check if we already have a PENDING/CREATED payment for this booking?
    // User might retry. We can either return existing or create new.
    // Let's create a new one to be safe with Razorpay orders (they expire).

    // Create Razorpay Order
    const order = await razorpayService.createOrder(amountInPaise, booking.id);

    // Save Payment Record
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: "RAZORPAY",
        providerOrderId: order.id,
        amount: amountInPaise,
        currency: order.currency,
        status: "CREATED",
        rawPayload: order as any,
      },
    });

    // Send Payment Initiated Notification (Async)
    try {
      await notificationQueue.add("SEND_PAYMENT_INITIATED", {
        userId: booking.userId,
        details: {
          tripTitle: booking.trip.title,
          amount: amountInPaise,
          orderId: order.id,
        },
      });
    } catch (err) {
      logger.error("Failed to queue initiation email", { error: err });
      // Non-blocking, continue
    }

    res.status(200).json({
      success: true,
      data: {
        paymentId: payment.id,
        orderId: order.id,
        amount: amountInPaise,
        currency: order.currency,
        key: env.RAZORPAY_KEY_ID,
        bookingId: booking.id,
      },
    });
  } catch (error) {
    logger.error("Failed to initiate payment", { error, bookingId });
    throw new HttpError(500, "PAYMENT_INIT_FAILED", "Failed to initiate payment with provider");
  }
}
