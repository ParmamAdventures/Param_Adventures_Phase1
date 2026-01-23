import { Prisma } from "@prisma/client";
import {
  buildImageUrls,
  buildVideoUrls,
  inferResourceType,
  resolvePublicId,
} from "./cloudinary.utils";

/**
 * Creates a Prisma Image Create Input from a Cloudinary file object.
 * Handles both Image and Video resource types.
 */
export function createImageInput(
  file: any, // Cloudinary File Object (Express.Multer.File)
  userId: string,
  extraData: {
    tripId?: string;
    coverForTripId?: string; // Used if we want to associate directly (though usually done separately)
    galleryOrder?: number;
  } = {},
): Prisma.ImageCreateInput {
  const publicId = resolvePublicId(file);
  if (!publicId) {
    throw new Error("Unable to resolve Cloudinary public ID");
  }

  const version = file.version;
  const resourceType = inferResourceType(file.mimetype);

  const urls =
    resourceType === "video"
      ? buildVideoUrls(publicId, version, file.path)
      : buildImageUrls(publicId, version, file.path);

  const baseData: Prisma.ImageCreateInput = {
    originalUrl: urls.originalUrl,
    mediumUrl: urls.mediumUrl,
    thumbUrl: urls.thumbUrl,
    mimeType: file.mimetype,
    size: file.size,
    width: file.width || 0,
    height: file.height || 0,
    uploadedBy: { connect: { id: userId } },
    type: resourceType === "video" ? "VIDEO" : "IMAGE",
    duration: resourceType === "video" ? file.duration || 0 : 0,
  };

  // If it's a gallery image/video
  if (extraData.tripId && extraData.galleryOrder !== undefined) {
    baseData.tripsGallery = {
      create: {
        trip: { connect: { id: extraData.tripId } },
        order: extraData.galleryOrder,
      },
    };
  }

  return baseData;
}
