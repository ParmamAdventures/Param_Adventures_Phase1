import multer from "multer";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error("INVALID_FILE_TYPE"));
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
