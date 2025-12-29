import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { processMedia } from "../utils/mediaProcessor";

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({
      error: "NO_FILE_UPLOADED",
    });
  }

  try {
    const mediaData = await processMedia(
      req.file.buffer,
      req.file.mimetype
    );

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

    res.status(201).json({
      image,
    });
  } catch (err: any) {
    console.error("Upload Error Details:", err);
    res.status(500).json({ // Changed to 500 to match symptom if we want to be explicit, but mostly to log
      error: err.message || "IMAGE_PROCESSING_FAILED",
      details: err.toString()
    });
  }
}
