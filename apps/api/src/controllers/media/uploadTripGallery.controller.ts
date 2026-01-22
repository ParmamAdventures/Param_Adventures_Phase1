import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import {
  buildImageUrls,
  buildVideoUrls,
  inferResourceType,
  resolvePublicId,
} from "../../utils/cloudinary.utils";

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

    const version = (file as any).version;
    const resourceType = inferResourceType(file.mimetype);
    const urls =
      resourceType === "video"
        ? buildVideoUrls(publicId, version, file.path)
        : buildImageUrls(publicId, version, file.path);

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
        type: resourceType === "video" ? "VIDEO" : "IMAGE",
        duration: resourceType === "video" ? file.duration || 0 : 0,
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
