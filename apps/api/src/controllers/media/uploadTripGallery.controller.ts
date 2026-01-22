import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { resolvePublicId } from "../../utils/cloudinary.utils";
import { createImageInput } from "../../utils/mediaFactory";

/**
 * Upload Trip Gallery
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function uploadTripGallery(req: Request, res: Response) {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new HttpError(400, "NO_FILES", "No images uploaded");
  }

  const { tripId } = req.params;
  const imageRecords: any[] = [];

  // Calculate starting order index
  const lastImage = await prisma.tripGalleryImage.findFirst({
    where: { tripId },
    orderBy: { order: "desc" },
  });
  let nextOrder = lastImage ? lastImage.order + 1 : 0;

  // The `upload` middleware has already uploaded the files to Cloudinary.
  // We just need to create the database records.
  for (const file of req.files as any[]) {
    const publicId = resolvePublicId(file);
    if (!publicId) {
      throw new HttpError(500, "UPLOAD_FAILED", "Unable to resolve Cloudinary public ID");
    }

    const imageInput = createImageInput(file, (req as any).user.id, {
      tripId,
      galleryOrder: nextOrder++,
    });

    const image = await prisma.image.create({ data: imageInput });
    imageRecords.push(image);
  }

  res.status(201).json({
    images: imageRecords,
  });
}
