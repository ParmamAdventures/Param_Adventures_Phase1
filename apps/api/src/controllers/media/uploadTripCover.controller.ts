import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { processImage } from "../../utils/imageProcessor";
import { HttpError } from "../../utils/httpError";

export async function uploadTripCover(req: Request, res: Response) {
  if (!req.file) {
    throw new HttpError(400, "NO_FILE", "No image uploaded");
  }

  const { tripId } = req.params;

  // Process image using production-grade sharp pipeline
  const result = await processImage(req.file.buffer, req.file.mimetype);

  // Create Image record
  const image = await prisma.image.create({
    data: {
      originalUrl: result.originalUrl,
      mediumUrl: result.mediumUrl,
      thumbUrl: result.thumbUrl,
      mimeType: result.mimeType,
      size: result.size,
      width: result.width,
      height: result.height,
      uploadedById: (req as any).user.id,
    },
  });

  // Update Trip
  await prisma.trip.update({
    where: { id: tripId },
    data: { 
      coverImageId: image.id 
    },
  });

  res.status(201).json({
    image: result.originalUrl,
    imageId: image.id,
    urls: {
      original: result.originalUrl,
      medium: result.mediumUrl,
      thumb: result.thumbUrl,
    },
  });
}
