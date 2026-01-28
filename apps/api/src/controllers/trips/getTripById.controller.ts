import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync"; // Assuming this utility exists or similar
import { ErrorMessages } from "../../constants/errorMessages";

export const getTripById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!; // requireAuth middleware ensures this
  const permissions = req.permissions || [];

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      manager: { select: { id: true, name: true, email: true } },
      guides: { include: { guide: { select: { id: true, name: true, email: true } } } },
      coverImage: true,
      gallery: { include: { image: true }, orderBy: { order: "asc" } },
    },
  });

  if (!trip) {
    return res.status(404).json({ error: ErrorMessages.TRIP_NOT_FOUND });
  }

  // Allow if Internal, Owner, or User has a booking
  const userBooking = await prisma.booking.findFirst({
    where: { tripId: id, userId: user.id },
  });

  if (permissions.includes("trip:view:internal") || trip.createdById === user.id || userBooking) {
    return res.json(trip);
  }

  return res.status(403).json({ error: "Insufficient permissions" });
};
