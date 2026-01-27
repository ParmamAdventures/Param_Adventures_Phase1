/**
 * Cloudinary File interface for Multer
 * Extends the default Multer file with Cloudinary-specific properties
 */
export interface CloudinaryFile extends Express.Multer.File {
  public_id: string;
  version?: number;
  width?: number;
  height?: number;
  duration?: number;
  secure_url?: string;
  format?: string;
  resource_type?: "image" | "video";
}
