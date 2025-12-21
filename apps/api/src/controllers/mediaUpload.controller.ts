import { Request, Response } from "express";
import { processImage } from "../utils/imageProcessor";

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({
      error: "NO_FILE_UPLOADED",
    });
  }

  try {
    const image = await processImage(
      req.file.buffer,
      req.file.mimetype
    );

    res.status(201).json({
      image,
    });
  } catch (err: any) {
    res.status(400).json({
      error: err.message || "IMAGE_PROCESSING_FAILED",
    });
  }
}
