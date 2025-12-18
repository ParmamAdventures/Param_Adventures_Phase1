import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { assertBookingTransition } from "../../domain/booking/bookingTransitions";

const prisma = new PrismaClient();

export async function rejectBooking(req: Request, res: Response) {
  const admin = (req as any).user;
  const { id } = req.params;

  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    try {
      assertBookingTransition(booking.status as any, "reject");
    } catch (err: any) {
      return res.status(403).json({ error: "Invalid booking state" });
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
  } catch (err) {
    return res.status(500).json({ error: "Internal error" });
  }
}
