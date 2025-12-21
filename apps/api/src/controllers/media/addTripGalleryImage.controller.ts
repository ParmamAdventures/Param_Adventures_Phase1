import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";

export async function addTripGalleryImage(req: Request, res: Response) {
  const { tripId } = req.params;
  const { imageId } = req.body;

  if (!imageId) {
    throw new HttpError(400, "MISSING_IMAGE_ID", "Image ID is required");
  }

  // Verify image exists
  const image = await prisma.image.findUnique({ where: { id: imageId } });
  if (!image) {
    throw new HttpError(404, "IMAGE_NOT_FOUND", "Image not found");
  }

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: {
      galleryImages: {
        connect: { id: imageId },
      },
    },
    include: {
      galleryImages: true,
    },
  });

  res.json(trip);
}
