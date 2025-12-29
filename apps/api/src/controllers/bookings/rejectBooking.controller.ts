import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { assertBookingTransition } from "../../domain/booking/bookingTransitions";
import { HttpError } from "../../utils/httpError";

export async function rejectBooking(req: Request, res: Response) {
  const admin = (req as any).user;
  const { id } = req.params;

  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new HttpError(404, "NOT_FOUND", "Booking not found");

    if (booking.status === "CONFIRMED" || booking.status === "REJECTED") {
      throw new HttpError(403, "INVALID_STATE", "Booking already processed");
    }

    try {
      assertBookingTransition(booking.status as any, "reject");
    } catch (err: any) {
      throw new HttpError(
        403,
        "INVALID_BOOKING_TRANSITION",
        "Booking cannot be rejected in its current state"
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: "BOOKING_REJECTED",
        targetType: "BOOKING",
        targetId: booking.id,
        metadata: { tripId: booking.tripId },
      },
    });

    return res.json(updated);
  } catch (err: any) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(500, "INTERNAL_ERROR", "Internal Server Error");
  }
}
