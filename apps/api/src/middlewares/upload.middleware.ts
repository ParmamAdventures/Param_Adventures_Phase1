import multer from "multer";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

import { storage } from "../config/cloudinary"; // Cloudinary Storage

export const upload = multer({
  storage: multer.memoryStorage(), // Keep memory for Images (Sharp processing)
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error("INVALID_FILE_TYPE_IMAGE_ONLY"));
      return;
    }
    cb(null, true);
  },
});

// Dedicated Video Upload (Direct to Cloudinary)
export const uploadVideo = multer({
  storage: storage, // Streams directly to Cloudinary
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["video/mp4", "video/webm"];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error("INVALID_FILE_TYPE_VIDEO_ONLY"));
      return;
    }
    cb(null, true);
  },
});

export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("INVALID_FILE_TYPE_PDF_ONLY"));
      return;
    }
    cb(null, true);
  },
});
