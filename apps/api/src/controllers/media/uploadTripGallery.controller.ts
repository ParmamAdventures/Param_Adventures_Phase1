import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { processImage } from "../../utils/imageProcessor";
import { HttpError } from "../../utils/httpError";

export async function uploadTripGallery(req: Request, res: Response) {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new HttpError(400, "NO_FILES", "No images uploaded");
  }

  const { tripId } = req.params;
  const processedResults: any[] = [];
  const imageRecords: any[] = [];

  // Parallel processing using production-grade sharp pipeline
  await Promise.all(
    (req.files as Express.Multer.File[]).map(async (file) => {
      const result = await processImage(file.buffer, file.mimetype);
      processedResults.push(result);
    })
  );

  // Database operations
  await Promise.all(processedResults.map(async (result) => {
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
        // Automatically connect to gallery
        tripsGallery: {
          connect: { id: tripId }
        }
      },
    });
    imageRecords.push(image);
  }));

  res.status(201).json({
    images: imageRecords,
  });
}
