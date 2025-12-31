import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function uploadDocument(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: "NO_FILE_UPLOADED" });
  }

  try {
    // Ensure documents directory exists
    const docDir = path.join(UPLOAD_DIR, "documents");
    await fs.mkdir(docDir, { recursive: true });

    // Generate unique filename
    const id = crypto.randomUUID();
    const originalName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_"); // Sanitize
    const filename = `${id}_${originalName}`;
    const filePath = path.join(docDir, filename);

    // Save file
    await fs.writeFile(filePath, req.file.buffer);

    // Construct public URL
    // Assuming 'uploads' is served statically via /uploads
    const url = `/uploads/documents/${filename}`;

    res.status(201).json({
      url,
      filename,
      size: req.file.size,
    });
  } catch (err: any) {
    console.error("Document Upload Error:", err);
    res.status(500).json({
      error: "UPLOAD_FAILED",
      details: err.message,
    });
  }
}
