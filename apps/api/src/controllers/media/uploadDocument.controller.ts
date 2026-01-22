import { Request, Response } from "express";

/**
 * Upload Document
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function uploadDocument(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: "NO_FILE_UPLOADED" });
  }

  // The 'uploadDocument' middleware now uses Cloudinary.
  // The req.file object contains the response from Cloudinary.
  // The `path` property is the URL to the uploaded file.
  const file = req.file as any;

  res.status(201).json({
    url: file.path,
    filename: file.originalname,
    size: file.size,
  });
}
