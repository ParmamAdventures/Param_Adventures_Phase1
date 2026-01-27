import { cloudinary } from "../config/cloudinary";
import { logger } from "../lib/logger";
import { prisma } from "../lib/prisma";
import { Prisma, MediaType } from "@prisma/client";
import { HttpError } from "../utils/httpError";
import {
  buildImageUrls,
  buildVideoUrls,
  inferResourceType,
  extractPublicIdFromUrl,
  resolvePublicId,
} from "../utils/cloudinary.utils";

interface UploadedFile {
  path: string;
  mimetype: string;
  size: number;
  width?: number;
  height?: number;
}

interface MediaListOptions {
  type?: string;
  page?: number;
  limit?: number;
}

export class MediaService {
  /**
   * Creates an image record from an uploaded file.
   * @param file The uploaded file object (from multer/cloudinary).
   * @param uploadedById The ID of the user uploading the file.
   * @param mediaType The type of media (IMAGE, VIDEO, DOCUMENT).
   * @returns The created image record.
   */
  async createImage(
    file: UploadedFile,
    uploadedById: string,
    mediaType: "IMAGE" | "VIDEO" = "IMAGE",
  ) {
    if (!file) {
      throw new HttpError(400, "NO_FILE", "No file uploaded");
    }

    const publicId = resolvePublicId(file);
    if (!publicId) {
      throw new HttpError(500, "UPLOAD_FAILED", "Unable to resolve Cloudinary public ID");
    }

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const version = (file as any).version;
    const resourceType = inferResourceType(file.mimetype);
    const urls =
      resourceType === "video"
        ? buildVideoUrls(publicId, version, file.path)
        : buildImageUrls(publicId, version, file.path);

    const resolvedType = mediaType === "VIDEO" || resourceType === "video" ? "VIDEO" : "IMAGE";
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const duration = resolvedType === "VIDEO" ? (file as any).duration || 0 : 0;

    return prisma.image.create({
      data: {
        originalUrl: urls.originalUrl,
        mediumUrl: urls.mediumUrl,
        thumbUrl: urls.thumbUrl,
        mimeType: file.mimetype,
        size: file.size,
        width: file.width || 0,
        height: file.height || 0,
        uploadedById,
        type: resolvedType,
        duration,
      },
    });
  }

  /**
   * Updates a trip's cover image.
   * @param tripId The trip ID.
   * @param imageId The image ID to set as cover.
   * @returns The updated trip.
   */
  async setTripCoverImage(tripId: string, imageId: string) {
    return prisma.trip.update({
      where: { id: tripId },
      data: {
        coverImageId: imageId,
      },
    });
  }

  /**
   * Lists media with pagination and filtering.
   * @param options Filtering and pagination options.
   * @returns Paginated media list with usage statistics.
   */
  async listMedia(options: MediaListOptions = {}) {
    const { type, page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ImageWhereInput = {};
    if (type && type !== "ALL") {
      where.type = type as MediaType;
    }

    const [mediaItems, total] = await Promise.all([
      prisma.image.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              tripsCover: true,
              blogsCover: true,
              userAvatar: true,
              tripsGallery: true,
            },
          },
        },
      }),
      prisma.image.count({ where }),
    ]);

    const media = mediaItems.map((item) => ({
      ...item,
      usage: {
        trips: item._count.tripsCover + item._count.tripsGallery,
        blogs: item._count.blogsCover,
        users: item._count.userAvatar,
      },
    }));

    return {
      media,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Deletes a media item.
   * @param id The media ID to delete.
   * @returns Success status.
   */
  async deleteMedia(id: string) {
    const image = await prisma.image.findUnique({ where: { id } });

    if (!image) {
      throw new HttpError(404, "NOT_FOUND", "Media not found.");
    }

    try {
      await prisma.image.delete({
        where: { id },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new HttpError(
          400,
          "IN_USE",
          "Cannot delete media because it is being used by other records (Trips/Blogs/Users).",
        );
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new HttpError(404, "NOT_FOUND", "Media not found.");
      }
      throw error;
    }

    const publicId = extractPublicIdFromUrl(image.originalUrl);
    const resourceType = image.type === "VIDEO" ? "video" : "image";

    if (!publicId) {
      logger.warn(`Deleted media record without Cloudinary public ID derivation: ${id}`);
      return { success: true };
    }

    try {
      await cloudinary.api.delete_resources([publicId], {
        resource_type: resourceType,
        invalidate: true,
      });
    } catch (error) {
      logger.warn(
        `Cloudinary cleanup failed for media ${id} (publicId=${publicId}): ${
          (error as Error).message
        }`,
      );
    }

    return { success: true };
  }

  /**
   * Gets a specific media item by ID.
   * @param id The media ID.
   * @returns The media item with usage statistics.
   */
  async getMediaById(id: string) {
    const media = await prisma.image.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tripsCover: true,
            blogsCover: true,
            userAvatar: true,
            tripsGallery: true,
          },
        },
      },
    });

    if (!media) {
      throw new HttpError(404, "NOT_FOUND", "Media not found");
    }

    return {
      ...media,
      usage: {
        trips: media._count.tripsCover + media._count.tripsGallery,
        blogs: media._count.blogsCover,
        users: media._count.userAvatar,
      },
    };
  }
}

export const mediaService = new MediaService();
