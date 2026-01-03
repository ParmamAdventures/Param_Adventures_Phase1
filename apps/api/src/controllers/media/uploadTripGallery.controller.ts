import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { processMedia } from "../../utils/mediaProcessor";
import { HttpError } from "../../utils/httpError";

export async function uploadTripGallery(req: Request, res: Response) {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new HttpError(400, "NO_FILES", "No images uploaded");
  }

  const { tripId } = req.params;
  const processedResults: any[] = [];
  const imageRecords: any[] = [];

  // Parallel processing
  await Promise.all(
    (req.files as any[]).map(async (file) => {
      // Case 1: Video (Uploaded via CloudinaryStorage)
      if (file.path && file.path.includes("cloudinary")) {
        // It's already uploaded. We just need to map it to our schema.
        processedResults.push({
          originalUrl: file.path, // Secure URL
          mediumUrl: file.path, 
          thumbUrl: file.path.replace(/\.[^/.]+$/, ".jpg"), // Video -> Image thumb
          mimeType: file.mimetype,
          size: file.size,
          width: 0, // Metadata might be in file object, or skipped
          height: 0,
          type: "VIDEO",
          duration: 0,
        });
      } 
      // Case 2: Image (Buffer from MemoryStorage)
      else if (file.buffer) {
        const result = await processMedia(file.buffer, file.mimetype);
        processedResults.push(result);
      }
    }),
  );

  // Calculate starting order index
  const lastImage = await prisma.tripGalleryImage.findFirst({
    where: { tripId },
    orderBy: { order: "desc" },
  });
  let nextOrder = lastImage ? lastImage.order + 1 : 0;

  // Database operations
  for (const result of processedResults) {
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
        type: result.type,
        duration: result.duration || 0,
        tripsGallery: {
          create: {
            tripId,
            order: nextOrder++,
          },
        },
      },
    });
    imageRecords.push(image);
  }

  res.status(201).json({
    images: imageRecords,
  });
}
