import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { assertBookingTransition } from "../../domain/booking/bookingTransitions";
import { HttpError } from "../../utils/httpError";
import { createAuditLog, AuditActions, AuditTargetTypes } from "../../utils/auditLog";

/**
 * Approve Booking
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function approveBooking(req: Request, res: Response) {
  const admin = (req as any).user;
  const { id } = req.params;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id } });
      if (!booking) throw new HttpError(404, "NOT_FOUND", ErrorMessages.BOOKING_NOT_FOUND);

      if (booking.status === "CONFIRMED" || booking.status === "REJECTED") {
        throw new HttpError(403, "INVALID_STATE", "Booking already processed");
      }

      try {
        assertBookingTransition(booking.status as any, "approve");
      } catch {
        throw new HttpError(
          403,
          "INVALID_BOOKING_TRANSITION",
          "Booking cannot be approved in its current state",
        );
      }

      const confirmedCount = await tx.booking.count({
        where: { tripId: booking.tripId, status: "CONFIRMED" },
      });

      const trip = await tx.trip.findUnique({ where: { id: booking.tripId } });
      if (!trip) throw new HttpError(404, "NOT_FOUND", ErrorMessages.TRIP_NOT_FOUND);

      if (confirmedCount >= trip.capacity) {
        // Use new utility for capacity rejection audit
        await createAuditLog({
          actorId: admin.id,
          action: AuditActions.BOOKING_REJECTED,
          targetType: AuditTargetTypes.BOOKING,
          targetId: booking.id,
          metadata: { tripId: booking.tripId, reason: "capacity_full" },
        });
        throw new HttpError(409, "CAPACITY_FULL", "Trip capacity is full");
      }

      const updated = await tx.booking.update({
        where: { id },
        data: { status: "CONFIRMED" },
      });

      // Use new utility for successful confirmation
      await createAuditLog({
        actorId: admin.id,
        action: AuditActions.BOOKING_CONFIRMED,
        targetType: AuditTargetTypes.BOOKING,
        targetId: booking.id,
        metadata: { tripId: booking.tripId },
      });

      return updated;
    });

    return res.json(updated);
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(500, "INTERNAL_ERROR", "Internal Server Error");
  }
}
