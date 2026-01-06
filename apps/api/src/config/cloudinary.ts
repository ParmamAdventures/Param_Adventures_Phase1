import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import fs from "fs";
import path from "path";

const isTestMode = process.env.CLOUDINARY_API_KEY === "123456789" || !process.env.CLOUDINARY_CLOUD_NAME;

// Ensure upload directories exist
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const imagesDir = path.join(uploadDir, "images");
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
const videosDir = path.join(uploadDir, "videos");
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir);

let storage: any;

if (isTestMode) {
  console.log("--> using LOCAL STORAGE for uploads <--");
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const isVideo = file.mimetype.startsWith("video/");
      cb(null, isVideo ? videosDir : imagesDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
  });
} else {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("CLOUDINARY_CLOUD_NAME is missing in env");
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const isVideo = file.mimetype.startsWith("video/");
      return {
        folder: isVideo ? "param_adventures_uploads/videos" : "param_adventures_uploads/images",
        allowed_formats: ["jpg", "png", "jpeg", "webp", "mp4", "webm"],
        public_id: file.fieldname + "-" + Date.now(),
        resource_type: isVideo ? "video" : "image",
        // Simplify to rule out Timeout/Processing errors
        ...(isVideo ? {} : {
           transformation: [{ quality: "auto:good", fetch_format: "auto" }]
        }),
      };
    },
  });
}

export { cloudinary, storage };
