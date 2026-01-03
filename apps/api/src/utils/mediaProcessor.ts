import { cloudinary } from "../config/cloudinary";
import stream from "stream";

export type ProcessedMedia = {
  originalUrl: string;
  mediumUrl: string;
  thumbUrl: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
  type: "IMAGE" | "VIDEO";
  duration: number; // in seconds, 0 if unknown
};

// Helper: Upload Buffer to Cloudinary
function uploadBuffer(buffer: Buffer, folder: string, resourceType: "image" | "video" = "image"): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
}

export async function processMedia(buffer: Buffer, mimeType: string): Promise<ProcessedMedia> {
  if (mimeType.startsWith("image/")) {
    return processImage(buffer, mimeType);
  } else if (mimeType.startsWith("video/")) {
    return processVideo(buffer, mimeType);
  } else {
    throw new Error("UNSUPPORTED_MEDIA_TYPE");
  }
}

async function processImage(buffer: Buffer, mimeType: string): Promise<ProcessedMedia> {
  // Upload Original File to Cloudinary
  // Cloudinary automatically detects dimensions and size
  const result = await uploadBuffer(buffer, "param_adventures_uploads/images", "image");

  // Generate Transformed URLs using Public ID
  // Medium: Max 1200px width
  const mediumUrl = cloudinary.url(result.public_id, {
    width: 1200,
    crop: "limit",
    secure: true,
  });

  // Thumb: 400x400 fill (good for avatars/grids)
  const thumbUrl = cloudinary.url(result.public_id, {
    width: 400,
    height: 400,
    crop: "fill",
    gravity: "auto", // Focus on interesting part (face/object)
    secure: true,
  });

  return {
    originalUrl: result.secure_url,
    mediumUrl: mediumUrl,
    thumbUrl: thumbUrl,
    width: result.width,
    height: result.height,
    size: result.bytes,
    mimeType: result.format ? `image/${result.format}` : mimeType,
    type: "IMAGE",
    duration: 0,
  };
}

async function processVideo(buffer: Buffer, mimeType: string): Promise<ProcessedMedia> {
  // Upload Video
  const result = await uploadBuffer(buffer, "param_adventures_uploads/videos", "video");

  return {
    originalUrl: result.secure_url,
    mediumUrl: result.secure_url, // Cloudinary can also resize videos if needed
    thumbUrl: result.secure_url, // Or use result.public_id + ".jpg" for poster
    width: result.width,
    height: result.height,
    size: result.bytes,
    mimeType: mimeType,
    type: "VIDEO",
    duration: result.duration || 0,
  };
}
  originalUrl: string;
  mediumUrl: string;
  thumbUrl: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
  type: "IMAGE" | "VIDEO";
  duration: number; // in seconds, 0 if unknown
};

export async function processMedia(buffer: Buffer, mimeType: string): Promise<ProcessedMedia> {
  // Ensure directories exist
  await fs.mkdir(path.join(UPLOAD_DIR, "original"), { recursive: true });
  await fs.mkdir(path.join(UPLOAD_DIR, "medium"), { recursive: true });
  await fs.mkdir(path.join(UPLOAD_DIR, "thumb"), { recursive: true });

  if (mimeType.startsWith("image/")) {
    return processImage(buffer, mimeType);
  } else if (mimeType.startsWith("video/")) {
    return processVideo(buffer, mimeType);
  } else {
    throw new Error("UNSUPPORTED_MEDIA_TYPE");
  }
}

async function processImage(buffer: Buffer, mimeType: string): Promise<ProcessedMedia> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("INVALID_IMAGE");
  }

  const id = crypto.randomUUID();
  const originalPath = path.join(UPLOAD_DIR, "original", `${id}.webp`);
  const mediumPath = path.join(UPLOAD_DIR, "medium", `${id}.webp`);
  const thumbPath = path.join(UPLOAD_DIR, "thumb", `${id}.webp`);

  // Original (max 2400px)
  await image
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(originalPath);

  // Medium (1200px)
  await image
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(mediumPath);

  // Thumbnail (400px)
  await image
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 70 })
    .toFile(thumbPath);

  const stats = await fs.stat(originalPath);

  return {
    originalUrl: `/uploads/original/${id}.webp`,
    mediumUrl: `/uploads/medium/${id}.webp`,
    thumbUrl: `/uploads/thumb/${id}.webp`,
    width: metadata.width,
    height: metadata.height,
    size: stats.size,
    mimeType: "image/webp",
    type: "IMAGE",
    duration: 0,
  };
}

async function processVideo(buffer: Buffer, mimeType: string): Promise<ProcessedMedia> {
  const id = crypto.randomUUID();
  // Keep original extension or default to .mp4/.webm based on mimetype
  const ext = mimeType === "video/webm" ? ".webm" : ".mp4";

  const filename = `${id}${ext}`;
  const originalPath = path.join(UPLOAD_DIR, "original", filename);

  // For video, we just save the original file for now
  await fs.writeFile(originalPath, buffer);

  const stats = await fs.stat(originalPath);

  // TODO: Extract duration/dimensions if possible without ffmpeg,
  // or rely on client sending metadata. For now, use placeholders.

  return {
    originalUrl: `/uploads/original/${filename}`,
    mediumUrl: `/uploads/original/${filename}`, // Reuse original for now
    thumbUrl: `/uploads/original/${filename}`, // Reuse original (frontend can use video poster)
    width: 0,
    height: 0,
    size: stats.size,
    mimeType: mimeType,
    type: "VIDEO",
    duration: 0,
  };
}
