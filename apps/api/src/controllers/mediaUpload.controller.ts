import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { processImage } from "../utils/imageProcessor";

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({
      error: "NO_FILE_UPLOADED",
    });
  }

  try {
    const imageData = await processImage(
      req.file.buffer,
      req.file.mimetype
    );

    const image = await prisma.image.create({
      data: {
        originalUrl: imageData.originalUrl,
        mediumUrl: imageData.mediumUrl,
        thumbUrl: imageData.thumbUrl,
        width: imageData.width,
        height: imageData.height,
        size: imageData.size,
        mimeType: imageData.mimeType,
        uploadedById: req.user!.id,
      },
    });

    res.status(201).json({
      image,
    });
  } catch (err: any) {
    res.status(400).json({
      error: err.message || "IMAGE_PROCESSING_FAILED",
    });
  }
}
