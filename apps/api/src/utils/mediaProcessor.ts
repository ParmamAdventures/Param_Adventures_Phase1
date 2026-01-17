import { cloudinary } from "../config/cloudinary";
import stream from "stream";

/**
 * Processed media metadata and URLs for images and videos.
 * @typedef {Object} ProcessedMedia
 * @property {string} originalUrl - URL to original media
 * @property {string} mediumUrl - URL to medium-quality media
 * @property {string} thumbUrl - URL to thumbnail
 * @property {number} width - Media width in pixels
 * @property {number} height - Media height in pixels
 * @property {number} size - File size in bytes
 * @property {string} mimeType - Media MIME type
 * @property {('IMAGE'|'VIDEO')} type - Media type
 * @property {number} duration - Duration in seconds (0 if unknown)
 */
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

/**
 * Upload buffer stream to Cloudinary.
 * Handles both image and video uploads with automatic resource type detection.
 * @param {Buffer} buffer - File buffer to upload
 * @param {string} folder - Cloudinary folder path
 * @param {('image'|'video')} [resourceType='image'] - Resource type
 * @returns {Promise<any>} - Cloudinary upload response
 * @private
 */
function uploadBuffer(
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "video" = "image",
): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
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
