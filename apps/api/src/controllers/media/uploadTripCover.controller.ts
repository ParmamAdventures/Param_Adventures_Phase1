import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { resolvePublicId } from "../../utils/cloudinary.utils";
import { createImageInput } from "../../utils/mediaFactory";
import { CloudinaryFile } from "../../types/cloudinary";

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
  const file = req.file as unknown as CloudinaryFile; // Cloudinary File

  const publicId = resolvePublicId(file);
  if (!publicId) {
    throw new HttpError(500, "UPLOAD_FAILED", "Unable to resolve Cloudinary public ID");
  }

  const imageInput = createImageInput(file, req.user!.id);
  const image = await prisma.image.create({ data: imageInput });

  // Update Trip
  await prisma.trip.update({
    where: { id: tripId },
    data: {
      coverImageId: image.id,
    },
  });

  res.status(201).json({
    image: imageInput.originalUrl,
    imageId: image.id,
    urls: {
      original: imageInput.originalUrl,
      medium: imageInput.mediumUrl,
      thumb: imageInput.thumbUrl,
    },
  });
}
