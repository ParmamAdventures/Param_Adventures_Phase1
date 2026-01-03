import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { razorpayService } from "../services/razorpay.service";
import { HttpError } from "../utils/httpError";
import { logger } from "../lib/logger";
import { notificationQueue } from "../lib/queue";

export async function verifyPayment(req: Request, res: Response) {
  const { orderId, paymentId, signature } = req.body;

  if (!orderId || !paymentId || !signature) {
    // Check if it's a dev simulation
    if (orderId?.startsWith("order_test_") && process.env.NODE_ENV !== "production") {
      return await handleDevSimulation(orderId, res);
    }
    throw new HttpError(400, "INVALID_REQUEST", "Missing required payment fields");
  }

  const isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, signature);

  if (!isValid) {
    throw new HttpError(400, "INVALID_SIGNATURE", "Payment verification failed");
  }

  const payment = await prisma.payment.findUnique({
    where: { providerOrderId: orderId },
    include: {
      booking: {
        include: { trip: true },
      },
    },
  });

  if (!payment) {
    throw new HttpError(404, "NOT_FOUND", "Payment record not found");
  }

  // Update payment and booking
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "CAPTURED",
        providerPaymentId: paymentId,
      },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
      },
    }),
  ]);

  logger.info("Payment verified successfully", { orderId, bookingId: payment.bookingId });

  // Send Notification (Async)
  await notificationQueue.add("SEND_PAYMENT_EMAIL", {
    userId: payment.booking.userId,
    details: {
      tripTitle: payment.booking.trip.title,
      amount: payment.amount,
      bookingId: payment.bookingId,
    },
  });

  res.json({ success: true, message: "Payment verified and booking confirmed" });
}

async function handleDevSimulation(orderId: string, res: Response) {
  logger.info("[Dev] Handling payment simulation", { orderId });

  const payment = await prisma.payment.findUnique({
    where: { providerOrderId: orderId },
    include: {
      booking: {
        include: { trip: true },
      },
    },
  });

  if (!payment) {
    throw new HttpError(404, "NOT_FOUND", "Payment record not found for simulation");
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "CAPTURED",
        providerPaymentId: `pay_sim_${Date.now()}`,
      },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
      },
    }),
  ]);

  // Send Notification (Async)
  await notificationQueue.add("SEND_PAYMENT_EMAIL", {
    userId: payment.booking.userId,
    details: {
      tripTitle: payment.booking.trip.title,
      amount: payment.amount,
      bookingId: payment.bookingId,
    },
  });

  return res.json({ success: true, message: "Dev simulation successful" });
}
