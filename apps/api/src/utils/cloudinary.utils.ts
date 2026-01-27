import { cloudinary } from "../config/cloudinary";
import { CloudinaryFile } from "../types/cloudinary";

export type CloudinaryResourceType = "image" | "video";

export function inferResourceType(mimeType?: string): CloudinaryResourceType {
  return mimeType && mimeType.startsWith("video/") ? "video" : "image";
}

export function extractPublicIdFromUrl(url?: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/");
    const uploadIndex = segments.findIndex((segment) => segment === "upload");
    if (uploadIndex === -1 || uploadIndex + 1 >= segments.length) return null;

    const publicIdSegments = segments.slice(uploadIndex + 1);
    const nextSegment = publicIdSegments[0];
    if (nextSegment && /^v\d+$/.test(nextSegment)) {
      publicIdSegments.shift();
    }

    if (publicIdSegments.length === 0) return null;

    const lastIndex = publicIdSegments.length - 1;
    publicIdSegments[lastIndex] = publicIdSegments[lastIndex].replace(/\.[^.]+$/, "");

    return publicIdSegments.join("/");
  } catch (error) {
    return null;
  }
}

export function resolvePublicId(file: Partial<CloudinaryFile>): string | null {
  return (
    file?.public_id || file?.filename || extractPublicIdFromUrl(file?.path || file?.secure_url)
  );
}

export function buildImageUrls(publicId: string, version?: number, originalUrl?: string) {
  const baseOptions = { secure: true, version } as const;

  const mediumUrl = cloudinary.url(publicId, {
    ...baseOptions,
    resource_type: "image",
    transformation: [{ width: 1200, crop: "limit" }],
  });

  const thumbUrl = cloudinary.url(publicId, {
    ...baseOptions,
    resource_type: "image",
    transformation: [{ width: 800, height: 500, crop: "fill", gravity: "auto" }],
  });

  const original =
    originalUrl ||
    cloudinary.url(publicId, {
      ...baseOptions,
      resource_type: "image",
    });

  return {
    originalUrl: original,
    mediumUrl,
    thumbUrl,
  };
}

export function buildVideoUrls(publicId: string, version?: number, originalUrl?: string) {
  const baseOptions = { secure: true, version } as const;

  const mediumUrl = cloudinary.url(publicId, {
    ...baseOptions,
    resource_type: "video",
    transformation: [{ width: 1280, crop: "limit", quality: "auto", fetch_format: "auto" }],
  });

  const thumbUrl = cloudinary.url(publicId, {
    ...baseOptions,
    resource_type: "video",
    format: "jpg",
    transformation: [{ width: 800, height: 500, crop: "fill", gravity: "auto" }],
  });

  const original =
    originalUrl ||
    cloudinary.url(publicId, {
      ...baseOptions,
      resource_type: "video",
    });

  return {
    originalUrl: original,
    mediumUrl,
    thumbUrl,
  };
}
