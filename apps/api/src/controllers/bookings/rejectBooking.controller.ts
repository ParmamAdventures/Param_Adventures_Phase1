import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { BookingStatus } from "@prisma/client";
import { assertBookingTransition } from "../../domain/booking/bookingTransitions";
import { HttpError } from "../../utils/httpError";
import { ErrorMessages } from "../../constants/errorMessages";
import { auditService, AuditActions, AuditTargetTypes } from "../../services/audit.service";

/**
 * Reject Booking
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function rejectBooking(req: Request, res: Response) {
  const admin = req.user!;
  const { id } = req.params;

  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new HttpError(404, "NOT_FOUND", ErrorMessages.BOOKING_NOT_FOUND);

    if (booking.status === "CONFIRMED" || booking.status === "REJECTED") {
      throw new HttpError(403, "INVALID_STATE", "Booking already processed");
    }

    try {
      assertBookingTransition(booking.status as BookingStatus, "reject");
    } catch {
      throw new HttpError(
        403,
        "INVALID_BOOKING_TRANSITION",
        "Booking cannot be rejected in its current state",
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    await auditService.logAudit({
      actorId: admin.id,
      action: AuditActions.BOOKING_REJECTED,
      targetType: AuditTargetTypes.BOOKING,
      targetId: booking.id,
      metadata: { tripId: booking.tripId },
    });

    return res.json(updated);
  } catch (err: unknown) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(500, "INTERNAL_ERROR", "Internal Server Error");
  }
}
