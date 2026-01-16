import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";

export const uploadImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    return ApiResponse.error(res, "NO_FILE_UPLOADED", 400);
  }

  const file = req.file as any; // Multer Cloudinary File

  // Construct URLs using the Cloudinary response
  let originalUrl = file.path;
  let mediumUrl = file.path;
  let thumbUrl = file.path;

  // If Image, generate variants by URL string manipulation (basic)
  // or use the ones we might want to store explicitly?
  // Ideally we store the ID or Base URL. For now, let's just use the Secure URL.
  // We can apply transformations on the fly in Frontend or here.

  // Handle Local Storage vs Cloudinary
  if (file.path && !file.path.startsWith("http")) {
    // It's local path: C:\Users\...\uploads\images\filename.jpg
    // Convert to URL: http://localhost:3001/uploads/images/filename.jpg
    const filename = file.filename;
    const folder = file.mimetype.startsWith("video/") ? "videos" : "images";
    const localUrl = `${process.env.API_URL || "http://localhost:3001"}/uploads/${folder}/${filename}`;

    originalUrl = localUrl;
    mediumUrl = localUrl;
    thumbUrl = localUrl;
  } else if (file.mimetype.startsWith("image/")) {
    // Cloudinary URL format: .../upload/{transformations}/v{version}/{id}
    // We can just store the base secure_url.
    // Or mimic old behavior:
    thumbUrl = file.path.replace("/upload/", "/upload/c_fill,w_400,h_400/");
    mediumUrl = file.path.replace("/upload/", "/upload/c_limit,w_1200/");
  } else if (file.mimetype.startsWith("video/")) {
    // Video Optimization on Delivery (q_auto, f_auto)
    // This ensures fast upload (raw) but optimized playback
    const uploadPath = "/upload/";
    const optimizedPath = "/upload/q_auto:good,f_auto,c_limit,w_1280/";

    mediumUrl = file.path.replace(uploadPath, optimizedPath);
    thumbUrl = file.path.replace(uploadPath, optimizedPath).replace(/\.[^/.]+$/, ".jpg");
  }

  const image = await prisma.image.create({
    data: {
      originalUrl,
      mediumUrl: mediumUrl,
      thumbUrl: thumbUrl,
      width: file.width || 0,
      height: file.height || 0,
      size: file.size,
      mimeType: file.mimetype,
      type: file.mimetype.startsWith("video/") ? "VIDEO" : "IMAGE",
      duration: file.duration || 0,
      uploadedById: (req.user as any).id,
    },
  });

  return ApiResponse.success(res, "File uploaded successfully", { image }, 201);
});
