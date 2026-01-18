import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";

/**
 * Set Trip Gallery
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function setTripGallery(req: Request, res: Response) {
  const { tripId } = req.params;
  const { imageIds } = req.body; // ordered array of image IDs

  if (!Array.isArray(imageIds)) {
    throw new HttpError(400, "INVALID_PAYLOAD", "imageIds must be an array");
  }

  // Verify trip exists
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    throw new HttpError(404, "TRIP_NOT_FOUND", ErrorMessages.TRIP_NOT_FOUND);
  }

  // Perform atomic update of gallery relations
  await prisma.$transaction([
    // 1. Clear existing gallery relations for this trip
    prisma.tripGalleryImage.deleteMany({
      where: { tripId },
    }),
    // 2. Create new relations with explicit order
    prisma.tripGalleryImage.createMany({
      data: imageIds.map((id, index) => ({
        tripId,
        imageId: id,
        order: index,
      })),
    }),
  ]);

  // Fetch updated trip with gallery images ordered
  const updatedTrip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      gallery: {
        orderBy: { order: "asc" },
        include: { image: true },
      },
    },
  });

  res.json(updatedTrip);
}
