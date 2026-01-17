import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";

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
  async createImage(file: UploadedFile, uploadedById: string, mediaType: string = "IMAGE") {
    if (!file) {
      throw new HttpError(400, "NO_FILE", "No file uploaded");
    }

    const originalUrl = file.path;
    // Apply Cloudinary transformations for display versions
    const mediumUrl = file.path.replace("/upload/", "/upload/c_limit,w_1200/");
    const thumbUrl = file.path.replace("/upload/", "/upload/c_fill,w_800,h_500/");

    return prisma.image.create({
      data: {
        originalUrl,
        mediumUrl,
        thumbUrl,
        mimeType: file.mimetype,
        size: file.size,
        width: file.width || 0,
        height: file.height || 0,
        uploadedById,
        type: mediaType,
        duration: 0,
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

    const where: any = {};
    if (type && type !== "ALL") {
      where.type = type;
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
    try {
      await prisma.image.delete({
        where: { id },
      });
      return { success: true };
    } catch (error: any) {
      if (error.code === "P2003") {
        throw new HttpError(
          400,
          "IN_USE",
          "Cannot delete media because it is being used by other records (Trips/Blogs/Users).",
        );
      }
      if (error.code === "P2025") {
        throw new HttpError(404, "NOT_FOUND", "Media not found.");
      }
      throw error;
    }
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
