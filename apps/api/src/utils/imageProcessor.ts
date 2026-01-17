import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * Processed image metadata and URLs.
 * @typedef {Object} ProcessedImage
 * @property {string} originalUrl - URL to original image
 * @property {string} mediumUrl - URL to medium-sized image
 * @property {string} thumbUrl - URL to thumbnail image
 * @property {number} width - Image width in pixels
 * @property {number} height - Image height in pixels
 * @property {number} size - File size in bytes
 * @property {string} mimeType - Image MIME type
 */
export type ProcessedImage = {
  originalUrl: string;
  mediumUrl: string;
  thumbUrl: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
};

/**
 * Process image buffer to create multiple sizes (original, medium, thumb).
 * Generates unique file IDs and stores locally or via Cloudinary.
 * @param {Buffer} buffer - Image file buffer
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<ProcessedImage>} - Processed image metadata and URLs
 * @throws {Error} - If image is invalid or not an image file
 */
export async function processImage(buffer: Buffer, mimeType: string): Promise<ProcessedImage> {
  if (!mimeType.startsWith("image/")) {
    throw new Error("INVALID_IMAGE_TYPE");
  }

  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("INVALID_IMAGE");
  }

  const id = crypto.randomUUID();

  const originalPath = path.join(UPLOAD_DIR, "original", `${id}.webp`);
  const mediumPath = path.join(UPLOAD_DIR, "medium", `${id}.webp`);
  const thumbPath = path.join(UPLOAD_DIR, "thumb", `${id}.webp`);

  // Ensure directories exist
  await fs.mkdir(path.join(UPLOAD_DIR, "original"), { recursive: true });
  await fs.mkdir(path.join(UPLOAD_DIR, "medium"), { recursive: true });
  await fs.mkdir(path.join(UPLOAD_DIR, "thumb"), { recursive: true });

  // Original (max 2400px)
  await image
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(originalPath);

  // Medium (1200px)
  await image
    .resize({ width: 1200, withoutEnlargement: true }) // Added withoutEnlargement for safety
    .webp({ quality: 80 })
    .toFile(mediumPath);

  // Thumbnail (400px)
  await image
    .resize({ width: 400, withoutEnlargement: true }) // Added withoutEnlargement for safety
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
  };
}
