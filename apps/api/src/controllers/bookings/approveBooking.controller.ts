import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { assertBookingTransition } from "../../domain/booking/bookingTransitions";

const prisma = new PrismaClient();

export async function approveBooking(req: Request, res: Response) {
  const admin = (req as any).user;
  const { id } = req.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id } });
      if (!booking)
        return { status: 404, body: { error: "Booking not found" } };

      try {
        assertBookingTransition(booking.status as any, "approve");
      } catch (err: any) {
        return { status: 403, body: { error: "Invalid booking state" } };
      }

      const confirmedCount = await tx.booking.count({
        where: { tripId: booking.tripId, status: "CONFIRMED" },
      });

      const trip = await tx.trip.findUnique({ where: { id: booking.tripId } });
      if (!trip) return { status: 404, body: { error: "Trip not found" } };

      if (confirmedCount >= trip.capacity) {
        return { status: 409, body: { error: "Trip capacity full" } };
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

      return { status: 200, body: updated };
    });

    return res.status(result.status).json(result.body);
  } catch (err) {
    return res.status(500).json({ error: "Internal error" });
  }
}
