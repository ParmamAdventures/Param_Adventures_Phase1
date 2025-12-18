import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { HttpError } from "../../lib/httpError";

const prisma = new PrismaClient();

export async function getTripBookings(req: Request, res: Response) {
  const { tripId } = req.params;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new HttpError(404, "NOT_FOUND", "Trip not found");

  const confirmedCount = await prisma.booking.count({
    where: { tripId, status: "CONFIRMED" },
  });

  const bookings = await prisma.booking.findMany({
    where: { tripId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return res.json({
    trip: {
      id: trip.id,
      title: trip.title,
      capacity: trip.capacity,
      confirmedCount,
    },
    bookings: bookings.map((b) => ({
      id: b.id,
      status: b.status,
      createdAt: b.createdAt,
      user: b.user
        ? { id: b.user.id, name: b.user.name, email: b.user.email }
        : null,
    })),
  });
}
