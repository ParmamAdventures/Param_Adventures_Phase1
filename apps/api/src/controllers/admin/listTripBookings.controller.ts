import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";

export async function listTripBookings(req: Request, res: Response) {
  const { tripId } = req.params;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new HttpError(404, "NOT_FOUND", "Trip not found");

  const bookings = await prisma.booking.findMany({
    where: { tripId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;

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
      user: b.user ? { id: b.user.id, name: b.user.name, email: b.user.email } : null,
    })),
  });
}

export default listTripBookings;
