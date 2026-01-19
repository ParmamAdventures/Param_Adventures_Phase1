import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { ErrorMessages } from "../../constants/errorMessages";

/**
 * Get Trip Bookings
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function getTripBookings(req: Request, res: Response) {
  const { tripId } = req.params;

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new HttpError(404, "NOT_FOUND", ErrorMessages.TRIP_NOT_FOUND);

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
      user: b.user ? { id: b.user.id, name: b.user.name, email: b.user.email } : null,
    })),
  });
}
