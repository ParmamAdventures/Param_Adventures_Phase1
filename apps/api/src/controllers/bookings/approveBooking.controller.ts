import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { assertBookingTransition } from "../../domain/booking/bookingTransitions";
import { HttpError } from "../../utils/httpError";

export async function approveBooking(req: Request, res: Response) {
  const admin = (req as any).user;
  const { id } = req.params;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id } });
      if (!booking) throw new HttpError(404, "NOT_FOUND", "Booking not found");

      if (booking.status === "CONFIRMED" || booking.status === "REJECTED") {
        throw new HttpError(403, "INVALID_STATE", "Booking already processed");
      }

      try {
        assertBookingTransition(booking.status as any, "approve");
      } catch (err: any) {
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
      if (!trip) throw new HttpError(404, "NOT_FOUND", "Trip not found");

      if (confirmedCount >= trip.capacity) {
        await tx.auditLog.create({
          data: {
            actorId: admin.id,
            action: "BOOKING_REJECTED_CAPACITY",
            targetType: "BOOKING",
            targetId: booking.id,
            metadata: { tripId: booking.tripId },
          },
        });
        throw new HttpError(409, "CAPACITY_FULL", "Trip capacity is full");
      }

      const updated = await tx.booking.update({
        where: { id },
        data: { status: "CONFIRMED" },
      });

      await tx.auditLog.create({
        data: {
          actorId: admin.id,
          action: "BOOKING_CONFIRMED",
          targetType: "BOOKING",
          targetId: booking.id,
          metadata: { tripId: booking.tripId },
        },
      });

      return updated;
    });

    return res.json(updated);
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(500, "INTERNAL_ERROR", "Internal Server Error");
  }
}
