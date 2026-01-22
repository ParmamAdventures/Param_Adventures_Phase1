import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { buildImageUrls, resolvePublicId } from "../../utils/cloudinary.utils";

/**
 * Upload Trip Cover
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function uploadTripCover(req: Request, res: Response) {
  if (!req.file) {
    throw new HttpError(400, "NO_FILE", "No image uploaded");
  }

  const { tripId } = req.params;
  const file = req.file as any; // Cloudinary File

  const publicId = resolvePublicId(file);
  if (!publicId) {
    throw new HttpError(500, "UPLOAD_FAILED", "Unable to resolve Cloudinary public ID");
  }

  const version = (file as any).version;
  const urls = buildImageUrls(publicId, version, file.path);

  // Create Image record
  const image = await prisma.image.create({
    data: {
      originalUrl: urls.originalUrl,
      mediumUrl: urls.mediumUrl,
      thumbUrl: urls.thumbUrl,
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
    image: urls.originalUrl,
    imageId: image.id,
    urls: {
      original: urls.originalUrl,
      medium: urls.mediumUrl,
      thumb: urls.thumbUrl,
    },
  });
}
