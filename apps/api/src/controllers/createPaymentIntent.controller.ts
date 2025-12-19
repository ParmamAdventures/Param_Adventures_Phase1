import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { createRazorpayOrder } from "../services/razorpay.service";
import { HttpError } from "../lib/httpError";

export async function createPaymentIntent(req: Request, res: Response) {
  const userId = (req as any).user!.id;
  const { bookingId } = req.body;

  if (!bookingId) {
    throw new HttpError(400, "INVALID_REQUEST", "bookingId is required");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { trip: true },
  });

  if (!booking) {
    throw new HttpError(404, "NOT_FOUND", "Booking not found");
  }

  if (booking.userId !== userId) {
    throw new HttpError(403, "FORBIDDEN", "Not your booking");
  }

  if (booking.status !== "CONFIRMED") {
    throw new HttpError(
      403,
      "INVALID_STATE",
      "Booking must be confirmed before payment"
    );
  }

  const amount = booking.trip.price; // paise

  if (!amount || amount <= 0) {
    throw new HttpError(500, "INVALID_AMOUNT", "Trip price misconfigured");
  }
  const razorpayConfigured =
    !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;

  let finalOrder: any = null;
  try {
    if (!razorpayConfigured) throw new Error("RazorpayNotConfigured");

    const order = await createRazorpayOrder({
      amount,
      currency: "INR",
      receipt: booking.id,
    });
    finalOrder = order;
  } catch (e: any) {
    // If Razorpay not configured, guard based on environment
    if (!razorpayConfigured) {
      if (process.env.NODE_ENV === "production") {
        throw new HttpError(
          500,
          "PAYMENT_PROVIDER_NOT_CONFIGURED",
          "Payment service is temporarily unavailable"
        );
      }

      // DEV / TEST: log usage of dev fallback for visibility
      console.warn("[Payments] Using dev fallback Razorpay order", {
        bookingId,
      });

      finalOrder = {
        id: `order_test_${Date.now()}`,
        amount: amount,
        currency: "INR",
        receipt: booking.id,
      } as any;
    } else {
      // Razorpay was configured but the provider call failed
      throw new HttpError(
        500,
        "INTERNAL_ERROR",
        "Failed to create provider order"
      );
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
    key: process.env.RAZORPAY_KEY_ID,
  });
}
