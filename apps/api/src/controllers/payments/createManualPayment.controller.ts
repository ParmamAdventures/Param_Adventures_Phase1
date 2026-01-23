import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { ErrorMessages } from "../../constants/errorMessages";
import { logger } from "../../lib/logger";
import { notificationQueue } from "../../lib/queue";

/**
 * Create Manual Payment
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function createManualPayment(req: Request, res: Response) {
  const { bookingId, amount, method, transactionId, proofUrl } = req.body;
  const adminId = (req.user as any).id;

  if (!bookingId || !amount || !method) {
    throw new HttpError(400, "INVALID_REQUEST", "Missing required fields");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { trip: true },
  });

  if (!booking) {
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.BOOKING_NOT_FOUND);
  }

  // Verify Admin/Manager permissions (handled by middleware, but good to be safe)
  // Assume route is protected by `requirePermission('trip:view:internal')` or similar

  // Create Payment Record
  const payment = await prisma.payment.create({
    data: {
      bookingId,
      method: "OTHER",
      provider: "MANUAL", // Was method, but provider needs to be enum. We store method in rawPayload or dedicated method field if exists
      providerOrderId: `MANUAL_${Date.now()}`, // Fake order ID
      providerPaymentId: transactionId || `MANUAL_${Date.now()}`,
      amount: Number(amount),
      status: "CAPTURED",
      proofUrl,
      rawPayload: { adminId, recordedAt: new Date().toISOString(), method },
    },
  });

  // Update Booking Status
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CONFIRMED",
      paymentStatus: "PAID",
    },
  });

  logger.info("Manual payment recorded", { bookingId, adminId, amount });

  // Send Notification
  await notificationQueue.add("SEND_PAYMENT_EMAIL", {
    userId: booking.userId,
    details: {
      tripTitle: booking.trip.title,
      amount: Number(amount),
      bookingId,
      method,
    },
  });

  res.status(201).json(payment);
}
