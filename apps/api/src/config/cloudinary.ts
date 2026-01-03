import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error("CLOUDINARY_CLOUD_NAME is missing in env");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: isVideo ? "param_adventures_uploads/videos" : "param_adventures_uploads/images",
      allowed_formats: ["jpg", "png", "jpeg", "webp", "mp4", "webm"],
      public_id: file.fieldname + "-" + Date.now(),
      resource_type: isVideo ? "video" : "image",
      transformation: [
        { quality: "auto:good", fetch_format: "auto" }, // Compress!
        ...(isVideo ? [{ width: 1280, crop: "limit" }] : []), // Resize videos to HD max
      ],
    };
  },
});

export { cloudinary, storage };
