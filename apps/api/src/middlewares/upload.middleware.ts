import multer from "multer";
import CloudinaryStorage from "multer-storage-cloudinary";
import { cloudinary, storage } from "../config/cloudinary"; // Cloudinary Storage

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB ceiling to avoid oversized uploads

/**
 * Multer middleware for file uploads to Cloudinary.
 * Supports images (JPEG, PNG, WebP) and videos (MP4, WebM, MOV).
 * Maximum file size: 100MB.
 * @type {multer.Multer}
 */
export const upload = multer({
  storage: storage, // Use Cloudinary Storage for EVERYTHING (Images + Video)
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error("INVALID_FILE_TYPE"));
      return;
    }
    cb(null, true);
  },
});

const documentStorage = CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "param_adventures_uploads/documents",
    allowed_formats: ["pdf"],
    public_id: (req: any, file: any) => file.fieldname + "-" + Date.now(),
    resource_type: "raw",
  } as any,
});

export const uploadDocument = multer({
  storage: documentStorage,
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
