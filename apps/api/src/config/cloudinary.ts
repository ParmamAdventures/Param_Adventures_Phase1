import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const requiredEnv = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  const message = `Missing Cloudinary environment variables: ${missingEnv.join(", ")}`;
  throw new Error(message);
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
      allowed_formats: ["jpg", "png", "jpeg", "webp", "mp4", "webm", "mov"],
      public_id: file.fieldname + "-" + Date.now(),
      resource_type: isVideo ? "video" : "image",
      // Simplify to rule out Timeout/Processing errors
      ...(isVideo
        ? {}
        : {
            transformation: [{ quality: "auto:good", fetch_format: "auto" }],
          }),
    };
  },
});

export { cloudinary, storage };
