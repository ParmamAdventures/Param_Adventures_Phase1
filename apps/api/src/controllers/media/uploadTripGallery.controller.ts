import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { processImage } from "../../utils/imageProcessor";
import { HttpError } from "../../utils/httpError";

const prisma = new PrismaClient();

export async function uploadTripGallery(req: Request, res: Response) {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new HttpError(400, "NO_FILES", "No images uploaded");
  }

  const { tripId } = req.params;
  const processedResults: any[] = [];
  const mediaRecords: any[] = [];

  // Parallel processing using production-grade sharp pipeline
  await Promise.all(
    (req.files as Express.Multer.File[]).map(async (file) => {
      const result = await processImage(file.buffer, file.mimetype);
      processedResults.push(result);
    })
  );

  // Database operations
  const uploadedPaths = processedResults.map(r => r.originalUrl);

  // 1. Create Media records for each gallery item
  await Promise.all(processedResults.map(async (result) => {
    const media = await prisma.media.create({
      data: {
        ownerType: "trip",
        ownerId: tripId,
        type: "image",
        purpose: "gallery",
        originalUrl: result.originalUrl,
        mediumUrl: result.mediumUrl,
        thumbUrl: result.thumbUrl,
        mimeType: result.mimeType,
        size: result.size,
        width: result.width,
        height: result.height,
      },
    });
    mediaRecords.push(media);
  }));

  // 2. Update Trip (legacy gallery array)
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { gallery: true } });
  if (!trip) throw new HttpError(404, "TRIP_NOT_FOUND", "Trip not found");

  const newGallery = [...trip.gallery, ...uploadedPaths];

  await prisma.trip.update({
    where: { id: tripId },
    data: { gallery: newGallery },
  });

  res.status(201).json({
    images: uploadedPaths,
    media: mediaRecords,
  });
}
