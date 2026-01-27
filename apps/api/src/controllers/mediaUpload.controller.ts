import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";
import {
  buildImageUrls,
  buildVideoUrls,
  inferResourceType,
  resolvePublicId,
} from "../utils/cloudinary.utils";
import { CloudinaryFile } from "../types/cloudinary";

export const uploadImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    return ApiResponse.error(res, "NO_FILE_UPLOADED", "No file uploaded", 400);
  }

  const file = req.file as unknown as CloudinaryFile;
  const publicId = resolvePublicId(file);

  if (!publicId) {
    return ApiResponse.error(res, "UPLOAD_FAILED", "Unable to resolve Cloudinary public ID", 500);
  }

  const version = file.version;
  const resourceType = inferResourceType(file.mimetype);
  const urls =
    resourceType === "video"
      ? buildVideoUrls(publicId, version, file.path)
      : buildImageUrls(publicId, version, file.path);

  const type = resourceType === "video" ? "VIDEO" : "IMAGE";
  const duration = resourceType === "video" ? file.duration || 0 : 0;

  const image = await prisma.image.create({
    data: {
      originalUrl: urls.originalUrl,
      mediumUrl: urls.mediumUrl,
      thumbUrl: urls.thumbUrl,
      width: file.width || 0,
      height: file.height || 0,
      size: file.size,
      mimeType: file.mimetype,
      type,
      duration,
      uploadedById: req.user!.id,
    },
  });

  return ApiResponse.success(res, { image }, "File uploaded successfully", 201);
});
