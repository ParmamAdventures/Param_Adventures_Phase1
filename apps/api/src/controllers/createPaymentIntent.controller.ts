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

  const order = await createRazorpayOrder({
    amount,
    currency: "INR",
    receipt: booking.id,
  });

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      provider: "razorpay",
      providerOrderId: order.id,
      amount,
      status: "CREATED",
    },
  });

  res.status(201).json({
    paymentId: payment.id,
    razorpayOrderId: order.id,
    amount,
    currency: "INR",
    key: process.env.RAZORPAY_KEY_ID,
  });
}
