import multer from "multer";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("ONLY_IMAGES_ALLOWED"));
      return;
    }
    cb(null, true);
  },
});
