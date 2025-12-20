import multer from "multer";

export const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter(req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("INVALID_FILE_TYPE"));
    } else {
      cb(null, true);
    }
  },
});
