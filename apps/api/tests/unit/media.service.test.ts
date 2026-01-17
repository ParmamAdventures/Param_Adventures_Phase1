jest.mock("../../src/lib/prisma");

import { prisma } from "../../src/lib/prisma";
import { MediaService } from "../../src/services/media.service";
import { HttpError } from "../../src/utils/httpError";

describe("MediaService", () => {
  let mediaService: MediaService;

  beforeEach(() => {
    jest.clearAllMocks();
    mediaService = new MediaService();
  });

  describe("createImage", () => {
    it("creates an image record with valid file", async () => {
      const userId = "user_123";
      const file = {
        path: "https://cloudinary.com/upload/image123.jpg",
        mimetype: "image/jpeg",
        size: 102400,
        width: 1920,
        height: 1080,
      };

      const mockImage = {
        id: "image_123",
        originalUrl: file.path,
        mediumUrl: "https://cloudinary.com/upload/c_limit,w_1200/image123.jpg",
        thumbUrl: "https://cloudinary.com/upload/c_fill,w_800,h_500/image123.jpg",
        mimeType: file.mimetype,
        size: file.size,
        width: file.width,
        height: file.height,
        uploadedById: userId,
        type: "IMAGE",
        duration: 0,
        createdAt: new Date(),
      };

      (prisma.image.create as jest.Mock).mockResolvedValue(mockImage);

      const result = await mediaService.createImage(file, userId);

      expect(prisma.image.create as jest.Mock).toHaveBeenCalledWith({
        data: {
          originalUrl: file.path,
          mediumUrl: "https://cloudinary.com/upload/c_limit,w_1200/image123.jpg",
          thumbUrl: "https://cloudinary.com/upload/c_fill,w_800,h_500/image123.jpg",
          mimeType: file.mimetype,
          size: file.size,
          width: 1920,
          height: 1080,
          uploadedById: userId,
          type: "IMAGE",
          duration: 0,
        },
      });

      expect(result.id).toBe("image_123");
      expect(result.originalUrl).toBe(file.path);
    });

    it("throws error when no file is provided", async () => {
      const userId = "user_123";

      await expect(mediaService.createImage(null as any, userId)).rejects.toThrow("No file uploaded");
    });

    it("creates image with custom media type", async () => {
      const userId = "user_123";
      const file = {
        path: "https://cloudinary.com/upload/document.pdf",
        mimetype: "application/pdf",
        size: 204800,
      };

      const mockImage = {
        id: "doc_123",
        type: "DOCUMENT",
      };

      (prisma.image.create as jest.Mock).mockResolvedValue(mockImage);

      await mediaService.createImage(file, userId, "DOCUMENT");

      expect(prisma.image.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: "DOCUMENT",
          }),
        }),
      );
    });

    it("handles files without width/height", async () => {
      const userId = "user_123";
      const file = {
        path: "https://cloudinary.com/upload/file.jpg",
        mimetype: "image/jpeg",
        size: 100000,
      };

      const mockImage = { id: "image_456", width: 0, height: 0 };

      (prisma.image.create as jest.Mock).mockResolvedValue(mockImage);

      await mediaService.createImage(file, userId);

      expect(prisma.image.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            width: 0,
            height: 0,
          }),
        }),
      );
    });
  });

  describe("setTripCoverImage", () => {
    it("updates trip cover image", async () => {
      const tripId = "trip_123";
      const imageId = "image_456";

      const mockTrip = {
        id: tripId,
        coverImageId: imageId,
      };

      (prisma.trip.update as jest.Mock).mockResolvedValue(mockTrip);

      const result = await mediaService.setTripCoverImage(tripId, imageId);

      expect(prisma.trip.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: tripId },
        data: {
          coverImageId: imageId,
        },
      });

      expect(result.id).toBe(tripId);
      expect(result.coverImageId).toBe(imageId);
    });
  });

  describe("listMedia", () => {
    it("returns paginated media list", async () => {
      const mockMediaItems = [
        {
          id: "img_1",
          type: "IMAGE",
          createdAt: new Date(),
          _count: {
            tripsCover: 2,
            blogsCover: 1,
            userAvatar: 0,
            tripsGallery: 3,
          },
        },
        {
          id: "img_2",
          type: "IMAGE",
          createdAt: new Date(),
          _count: {
            tripsCover: 0,
            blogsCover: 0,
            userAvatar: 1,
            tripsGallery: 0,
          },
        },
      ];

      (prisma.image.findMany as jest.Mock).mockResolvedValue(mockMediaItems);
      (prisma.image.count as jest.Mock).mockResolvedValue(10);

      const result = await mediaService.listMedia({ page: 1, limit: 50 });

      expect(prisma.image.findMany as jest.Mock).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 50,
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

      expect(result.media).toHaveLength(2);
      expect(result.media[0].usage.trips).toBe(5); // 2 + 3
      expect(result.media[0].usage.blogs).toBe(1);
      expect(result.media[1].usage.users).toBe(1);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it("filters media by type", async () => {
      (prisma.image.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.image.count as jest.Mock).mockResolvedValue(0);

      await mediaService.listMedia({ type: "VIDEO", page: 1, limit: 50 });

      expect(prisma.image.findMany as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: "VIDEO" },
        }),
      );
    });

    it("ignores filter when type is ALL", async () => {
      (prisma.image.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.image.count as jest.Mock).mockResolvedValue(0);

      await mediaService.listMedia({ type: "ALL" });

      expect(prisma.image.findMany as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it("calculates pagination correctly", async () => {
      (prisma.image.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.image.count as jest.Mock).mockResolvedValue(75);

      const result = await mediaService.listMedia({ page: 2, limit: 20 });

      expect(prisma.image.findMany as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
        }),
      );

      expect(result.pagination.totalPages).toBe(4); // 75 / 20 = 3.75 -> 4
    });

    it("uses default pagination values", async () => {
      (prisma.image.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.image.count as jest.Mock).mockResolvedValue(0);

      await mediaService.listMedia();

      expect(prisma.image.findMany as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 50,
        }),
      );
    });
  });

  describe("deleteMedia", () => {
    it("deletes media successfully", async () => {
      const mediaId = "media_123";

      (prisma.image.delete as jest.Mock).mockResolvedValue({ id: mediaId });

      const result = await mediaService.deleteMedia(mediaId);

      expect(prisma.image.delete as jest.Mock).toHaveBeenCalledWith({
        where: { id: mediaId },
      });

      expect(result.success).toBe(true);
    });

    it("throws error when media is in use (P2003)", async () => {
      const mediaId = "media_in_use";
      const error = new Error("Foreign key constraint failed");
      (error as any).code = "P2003";

      (prisma.image.delete as jest.Mock).mockRejectedValue(error);

      await expect(mediaService.deleteMedia(mediaId)).rejects.toThrow(
        "Cannot delete media because it is being used by other records",
      );
    });

    it("throws error when media not found (P2025)", async () => {
      const mediaId = "non_existent";
      const error = new Error("Record not found");
      (error as any).code = "P2025";

      (prisma.image.delete as jest.Mock).mockRejectedValue(error);

      await expect(mediaService.deleteMedia(mediaId)).rejects.toThrow("Media not found");
    });

    it("propagates other database errors", async () => {
      const mediaId = "media_error";
      const error = new Error("Database connection error");

      (prisma.image.delete as jest.Mock).mockRejectedValue(error);

      await expect(mediaService.deleteMedia(mediaId)).rejects.toThrow("Database connection error");
    });
  });

  describe("getMediaById", () => {
    it("retrieves media item with usage statistics", async () => {
      const mediaId = "media_123";

      const mockMedia = {
        id: mediaId,
        originalUrl: "https://cloudinary.com/image.jpg",
        type: "IMAGE",
        _count: {
          tripsCover: 1,
          blogsCover: 2,
          userAvatar: 0,
          tripsGallery: 1,
        },
      };

      (prisma.image.findUnique as jest.Mock).mockResolvedValue(mockMedia);

      const result = await mediaService.getMediaById(mediaId);

      expect(prisma.image.findUnique as jest.Mock).toHaveBeenCalledWith({
        where: { id: mediaId },
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

      expect(result.id).toBe(mediaId);
      expect(result.usage.trips).toBe(2); // 1 + 1
      expect(result.usage.blogs).toBe(2);
      expect(result.usage.users).toBe(0);
    });

    it("throws error when media not found", async () => {
      const mediaId = "non_existent";

      (prisma.image.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(mediaService.getMediaById(mediaId)).rejects.toThrow("Media not found");
    });
  });
});
