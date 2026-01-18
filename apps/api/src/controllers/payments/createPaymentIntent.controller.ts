import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { createRazorpayOrder } from "../../services/razorpay.service";
import { HttpError } from "../../utils/httpError";
import { env } from "../../config/env";

/**
 * Create Payment Intent
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function createPaymentIntent(req: Request, res: Response) {
  const userId = (req.user as any).id; // Using non-null assertion as it's a protected route
  const { bookingId } = req.body;

  if (!bookingId) {
    throw new HttpError(400, "INVALID_REQUEST", "bookingId is required");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { trip: true },
  });

  if (!booking) {
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.BOOKING_NOT_FOUND);
  }

  if (booking.userId !== userId) {
    throw new HttpError(403, "FORBIDDEN", "Not your booking");
  }

  // Support both CONFIRMED (if prepay is required after manual review)
  // and REQUESTED (if payment is allowed immediately)
  const allowedStatuses = ["REQUESTED", "CONFIRMED"];
  if (!allowedStatuses.includes(booking.status)) {
    throw new HttpError(
      403,
      "INVALID_STATE",
      `Booking status must be one of [${allowedStatuses.join(", ")}] to pay`,
    );
  }

  // Amount in DB is in INR, Razorpay expects paise
  const amount = booking.trip.price * 100;

  if (!amount || amount <= 0) {
    throw new HttpError(500, "INVALID_AMOUNT", "Trip price misconfigured");
  }

  const razorpayConfigured =
    env.RAZORPAY_KEY_ID !== "rzp_test_placeholder" &&
    env.RAZORPAY_KEY_SECRET !== "placeholder_secret";

  let finalOrder: any = null;
  try {
    if (!razorpayConfigured) throw new Error("RazorpayNotConfigured");

    const order = await createRazorpayOrder({
      amount,
      currency: "INR",
      receipt: booking.id,
    });
    finalOrder = order;
  } catch {
    if (!razorpayConfigured) {
      if (env.NODE_ENV === "production") {
        throw new HttpError(
          500,
          "PAYMENT_PROVIDER_NOT_CONFIGURED",
          "Payment service is temporarily unavailable",
        );
      }

      // DEV / TEST fallback
      console.warn("[Payments] Using dev fallback Razorpay order", { bookingId });
      finalOrder = {
        id: `order_test_${Date.now()}`,
        amount: amount,
        currency: "INR",
        receipt: booking.id,
      } as any;
    } else {
      throw new HttpError(500, "INTERNAL_ERROR", "Failed to create provider order");
    }
  }

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      provider: "razorpay",
      providerOrderId: finalOrder.id,
      amount,
      status: "CREATED",
    },
  });

  res.status(201).json({
    paymentId: payment.id,
    orderId: finalOrder.id,
    amount,
    currency: "INR",
    key: env.RAZORPAY_KEY_ID,
  });
}
