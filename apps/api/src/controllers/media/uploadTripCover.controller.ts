import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { processMedia } from "../../utils/mediaProcessor";
import { HttpError } from "../../utils/httpError";

export async function uploadTripCover(req: Request, res: Response) {
  if (!req.file) {
    throw new HttpError(400, "NO_FILE", "No image uploaded");
  }

  const { tripId } = req.params;
  const file = req.file as any; // Cloudinary File

  // Construct URLs
  const originalUrl = file.path;
  // Apply Cloudinary transformations for display versions
  const mediumUrl = file.path.replace("/upload/", "/upload/c_limit,w_1200/");
  const thumbUrl = file.path.replace("/upload/", "/upload/c_fill,w_800,h_500/"); // 16:10 aspect roughly

  // Create Image record
  const image = await prisma.image.create({
    data: {
      originalUrl: originalUrl,
      mediumUrl: mediumUrl,
      thumbUrl: thumbUrl,
      mimeType: file.mimetype,
      size: file.size,
      width: file.width || 0,
      height: file.height || 0,
      uploadedById: (req as any).user.id,
      type: "IMAGE",
      duration: 0,
    },
  });

  // Update Trip
  await prisma.trip.update({
    where: { id: tripId },
    data: {
      coverImageId: image.id,
    },
  });

  res.status(201).json({
    image: originalUrl,
    imageId: image.id,
    urls: {
      original: originalUrl,
      medium: mediumUrl,
      thumb: thumbUrl,
    },
  });
}
