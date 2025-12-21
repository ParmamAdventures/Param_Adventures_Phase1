import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/httpError";

export async function getTripBySlug(req: Request, res: Response) {
  const { slug } = req.params;

  const trip = await prisma.trip.findUnique({
    where: { slug },
    include: {
      coverImage: true,
      gallery: {
        include: {
          image: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!trip) {
    throw new HttpError(404, "Trip not found");
  }

  if (trip.status !== "PUBLISHED") {
    // If not published, throw 404 (hide existence)
    throw new HttpError(404, "Trip not found");
  }

  // Transform gallery to simpler array if needed, or send as is.
  // Frontend might expect `gallery` to be string[] (legacy) or object array.
  // Current frontend TripCard uses legacy logic or new logic?
  // TripDetailPage usually needs robust data.
  // Sending full object is safest.

  res.json(trip);
}
