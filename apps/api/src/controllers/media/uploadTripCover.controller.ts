import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { processImage } from "../../utils/imageProcessor";
import { HttpError } from "../../utils/httpError";

const prisma = new PrismaClient();

export async function uploadTripCover(req: Request, res: Response) {
  if (!req.file) {
    throw new HttpError(400, "NO_FILE", "No image uploaded");
  }

  const { tripId } = req.params;

  // Process image using production-grade sharp pipeline
  const result = await processImage(req.file.buffer, req.file.mimetype);

  // Create Media record
  const media = await prisma.media.create({
    data: {
      ownerType: "trip",
      ownerId: tripId,
      type: "image",
      purpose: "cover",
      originalUrl: result.originalUrl,
      mediumUrl: result.mediumUrl,
      thumbUrl: result.thumbUrl,
      mimeType: result.mimeType,
      size: result.size,
      width: result.width,
      height: result.height,
    },
  });

  // Update Trip
  await prisma.trip.update({
    where: { id: tripId },
    data: { 
      coverImage: result.originalUrl, // Legacy
      coverMediaId: media.id 
    },
  });

  res.status(201).json({
    image: result.originalUrl,
    mediaId: media.id,
    urls: {
      original: result.originalUrl,
      medium: result.mediumUrl,
      thumb: result.thumbUrl,
    },
  });
}
