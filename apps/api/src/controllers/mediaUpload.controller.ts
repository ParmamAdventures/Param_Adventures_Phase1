import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { processMedia } from "../utils/mediaProcessor";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";

export const uploadImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    return ApiResponse.error(res, "NO_FILE_UPLOADED", 400);
  }

  const mediaData = await processMedia(req.file.buffer, req.file.mimetype);

  const image = await prisma.image.create({
    data: {
      originalUrl: mediaData.originalUrl,
      mediumUrl: mediaData.mediumUrl,
      thumbUrl: mediaData.thumbUrl,
      width: mediaData.width,
      height: mediaData.height,
      size: mediaData.size,
      mimeType: mediaData.mimeType,
      type: mediaData.type as any, // Cast to avoid build error until client regeneration
      duration: mediaData.duration,
      uploadedById: req.user!.id,
    },
  });

  return ApiResponse.success(res, "Image uploaded successfully", { image }, 201);
});
