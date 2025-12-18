import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createBooking(req: Request, res: Response) {
  const user = (req as any).user;
  const { tripId, notes } = req.body || {};

  if (!tripId) return res.status(400).json({ error: "tripId is required" });

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return res.status(404).json({ error: "Trip not found" });

  if (trip.status !== "PUBLISHED") {
    return res.status(403).json({ error: "Trip is not open for booking" });
  }

  const existing = await prisma.booking.findUnique({
    where: {
      userId_tripId: {
        userId: user.id,
        tripId,
      },
    },
  });

  if (existing) {
    return res.status(409).json({ error: "You have already booked this trip" });
  }

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      tripId,
      notes,
      status: "REQUESTED",
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "BOOKING_REQUESTED",
      targetType: "BOOKING",
      targetId: booking.id,
      metadata: { tripId },
    },
  });

  return res.status(201).json(booking);
}
