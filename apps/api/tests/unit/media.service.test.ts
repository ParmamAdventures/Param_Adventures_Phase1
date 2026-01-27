jest.mock("../../src/lib/prisma");
jest.mock("../../src/utils/cloudinary.utils"); // Added mock for cloudinary.utils
jest.mock("../../src/config/cloudinary"); // Explicitly mock the config file
jest.mock("../../src/lib/logger"); // Mock the logger to spy on its methods

import { prisma } from "../../src/lib/prisma";
import { MediaService } from "../../src/services/media.service";
import { HttpError } from "../../src/utils/httpError";
import * as cloudinaryUtils from "../../src/utils/cloudinary.utils"; // Import the mocked cloudinary.utils module
import * as cloudinaryConfig from "../../src/config/cloudinary";
import * as logger from "../../src/lib/logger";

// Import the mocked modules using jest.mocked
const mockedCloudinary = jest.mocked(cloudinaryConfig);
const mockedLogger = jest.mocked(logger);

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
        path: "https://cloudinary.com/upload/v12345/image123.jpg", // Changed path to include version for mock publicId
        mimetype: "image/jpeg",
        size: 102400,
        width: 1920,
        height: 1080,
      };

      const mockPublicId = "image123";
      (cloudinaryUtils.resolvePublicId as jest.Mock).mockReturnValue(mockPublicId);
      (cloudinaryUtils.buildImageUrls as jest.Mock).mockReturnValue({
        originalUrl: file.path,
        mediumUrl: "https://res.cloudinary.com/mock-cloud/image/upload/c_limit,w_1200/image123",
        thumbUrl:
          "https://res.cloudinary.com/mock-cloud/image/upload/c_fill,g_auto,h_500,w_800/image123",
      });
      (cloudinaryUtils.inferResourceType as jest.Mock).mockReturnValue("image");

      const mockImage = {
        id: "image_123",
        originalUrl: file.path,
        mediumUrl: "https://res.cloudinary.com/mock-cloud/image/upload/c_limit,w_1200/image123",
        thumbUrl:
          "https://res.cloudinary.com/mock-cloud/image/upload/c_fill,g_auto,h_500,w_800/image123",
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

      expect(cloudinaryUtils.resolvePublicId).toHaveBeenCalledWith(file);
      expect(cloudinaryUtils.buildImageUrls).toHaveBeenCalledWith(
        mockPublicId,
        undefined,
        file.path,
      ); // version is undefined in mock file
      expect(prisma.image.create as jest.Mock).toHaveBeenCalledWith({
        data: {
          originalUrl: file.path,
          mediumUrl: "https://res.cloudinary.com/mock-cloud/image/upload/c_limit,w_1200/image123",
          thumbUrl:
            "https://res.cloudinary.com/mock-cloud/image/upload/c_fill,g_auto,h_500,w_800/image123",
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

      await expect(mediaService.createImage(null as any, userId)).rejects.toThrow(
        "No file uploaded",
      );
    });

    it("creates image with custom media type", async () => {
      const userId = "user_123";
      const file = {
        path: "https://cloudinary.com/upload/v12345/document.pdf", // Updated for consistency
        mimetype: "application/pdf",
        size: 204800,
      };

      const mockPublicId = "document";
      (cloudinaryUtils.resolvePublicId as jest.Mock).mockReturnValue(mockPublicId);
      (cloudinaryUtils.buildVideoUrls as jest.Mock).mockReturnValue({
        // Assuming it might be a video based on the original test's expected type
        originalUrl: file.path,
        mediumUrl: "https://res.cloudinary.com/mock-cloud/video/upload/c_limit,w_1200/document",
        thumbUrl:
          "https://res.cloudinary.com/mock-cloud/video/upload/c_fill,g_auto,h_500,w_800/document",
      });
      (cloudinaryUtils.inferResourceType as jest.Mock).mockReturnValue("video"); // Adjusted to 'video' for consistency with buildVideoUrls

      const mockImage = {
        id: "video_123",
        type: "VIDEO",
      };

      (prisma.image.create as jest.Mock).mockResolvedValue(mockImage);

      await mediaService.createImage(file, userId, "VIDEO");

      expect(cloudinaryUtils.resolvePublicId).toHaveBeenCalledWith(file);
      expect(cloudinaryUtils.inferResourceType).toHaveBeenCalledWith(file.mimetype);
      expect(prisma.image.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: "VIDEO",
            originalUrl: file.path,
            mediumUrl: "https://res.cloudinary.com/mock-cloud/video/upload/c_limit,w_1200/document",
            thumbUrl:
              "https://res.cloudinary.com/mock-cloud/video/upload/c_fill,g_auto,h_500,w_800/document",
          }),
        }),
      );
    });

    it("handles files without width/height", async () => {
      const userId = "user_123";
      const file = {
        path: "https://cloudinary.com/upload/v12345/file.jpg", // Updated for consistency
        mimetype: "image/jpeg",
        size: 100000,
      };

      const mockPublicId = "file";
      (cloudinaryUtils.resolvePublicId as jest.Mock).mockReturnValue(mockPublicId);
      (cloudinaryUtils.buildImageUrls as jest.Mock).mockReturnValue({
        originalUrl: file.path,
        mediumUrl: "https://res.cloudinary.com/mock-cloud/image/upload/c_limit,w_1200/file",
        thumbUrl:
          "https://res.cloudinary.com/mock-cloud/image/upload/c_fill,g_auto,h_500,w_800/file",
      });
      (cloudinaryUtils.inferResourceType as jest.Mock).mockReturnValue("image");

      const mockImage = { id: "image_456", width: 0, height: 0 };

      (prisma.image.create as jest.Mock).mockResolvedValue(mockImage);

      await mediaService.createImage(file, userId);

      expect(cloudinaryUtils.resolvePublicId).toHaveBeenCalledWith(file);
      expect(cloudinaryUtils.buildImageUrls).toHaveBeenCalledWith(
        mockPublicId,
        undefined,
        file.path,
      );
      expect(prisma.image.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            width: 0,
            height: 0,
            originalUrl: file.path,
            mediumUrl: "https://res.cloudinary.com/mock-cloud/image/upload/c_limit,w_1200/file",
            thumbUrl:
              "https://res.cloudinary.com/mock-cloud/image/upload/c_fill,g_auto,h_500,w_800/file",
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
    // Mock a valid image to be returned by findUnique
    const mockFoundImage = {
      id: "media_123",
      originalUrl: "https://cloudinary.com/upload/v12345/some_image.jpg",
      type: "IMAGE",
      mimeType: "image/jpeg",
      size: 1000,
      width: 100,
      height: 100,
      uploadedById: "user_id",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("deletes media successfully", async () => {
      const mediaId = "media_123";

      (prisma.image.findUnique as jest.Mock).mockResolvedValue(mockFoundImage); // Mock findUnique to return an image
      (prisma.image.delete as jest.Mock).mockResolvedValue({ id: mediaId });
      (cloudinaryUtils.extractPublicIdFromUrl as jest.Mock).mockReturnValue("some_image");
      // Removed incorrect expectation: (cloudinaryUtils.inferResourceType as jest.Mock).mockReturnValue("image");
      (mockedCloudinary.cloudinary.api.delete_resources as jest.Mock).mockResolvedValue({}); // Explicitly mock the delete_resources call from the mocked cloudinary config

      const result = await mediaService.deleteMedia(mediaId);

      expect(prisma.image.findUnique as jest.Mock).toHaveBeenCalledWith({ where: { id: mediaId } });
      expect(prisma.image.delete as jest.Mock).toHaveBeenCalledWith({
        where: { id: mediaId },
      });
      expect(cloudinaryUtils.extractPublicIdFromUrl).toHaveBeenCalledWith(
        mockFoundImage.originalUrl,
      );
      // Removed incorrect expectation: expect(cloudinaryUtils.inferResourceType).toHaveBeenCalledWith(mockFoundImage.mimeType);

      expect(result.success).toBe(true);
    });

    it("throws error when media is in use (P2003)", async () => {
      const mediaId = "media_in_use";
      const error = new Error("Foreign key constraint failed");
      (error as any).code = "P2003";

      (prisma.image.findUnique as jest.Mock).mockResolvedValue(mockFoundImage); // Mock findUnique
      (prisma.image.delete as jest.Mock).mockRejectedValue(error);
      (cloudinaryUtils.extractPublicIdFromUrl as jest.Mock).mockReturnValue("some_image");
      // (cloudinaryUtils.inferResourceType as jest.Mock).mockReturnValue("image"); // Removed incorrect expectation

      await expect(mediaService.deleteMedia(mediaId)).rejects.toThrow(
        "Cannot delete media because it is being used by other records",
      );
      expect(prisma.image.findUnique).toHaveBeenCalledWith({ where: { id: mediaId } });
      expect(prisma.image.delete).toHaveBeenCalledWith({ where: { id: mediaId } });
    });

    it("throws error when media not found (P2025)", async () => {
      const mediaId = "non_existent";
      const error = new Error("Record not found");
      (error as any).code = "P2025";

      // For P2025, the findUnique should succeed, but the delete should fail
      (prisma.image.findUnique as jest.Mock).mockResolvedValue(mockFoundImage); // Mock findUnique
      (prisma.image.delete as jest.Mock).mockRejectedValue(error);
      (cloudinaryUtils.extractPublicIdFromUrl as jest.Mock).mockReturnValue("non_existent_image"); // Needs a publicId to attempt cloudinary delete
      // (cloudinaryUtils.inferResourceType as jest.Mock).mockReturnValue("image"); // Removed incorrect expectation

      await expect(mediaService.deleteMedia(mediaId)).rejects.toThrow("Media not found");
      expect(prisma.image.findUnique).toHaveBeenCalledWith({ where: { id: mediaId } });
      expect(prisma.image.delete).toHaveBeenCalledWith({ where: { id: mediaId } });
    });

    it("propagates other database errors", async () => {
      const mediaId = "media_error";
      const error = new Error("Database connection error");

      (prisma.image.findUnique as jest.Mock).mockResolvedValue(mockFoundImage); // Mock findUnique
      (prisma.image.delete as jest.Mock).mockRejectedValue(error);
      (cloudinaryUtils.extractPublicIdFromUrl as jest.Mock).mockReturnValue("some_image");
      // (cloudinaryUtils.inferResourceType as jest.Mock).mockReturnValue("image"); // Removed incorrect expectation

      await expect(mediaService.deleteMedia(mediaId)).rejects.toThrow("Database connection error");
      expect(prisma.image.findUnique).toHaveBeenCalledWith({ where: { id: mediaId } });
      expect(prisma.image.delete).toHaveBeenCalledWith({ where: { id: mediaId } });
    });

    it("throws HttpError when media not found by findUnique", async () => {
      // New test case
      const mediaId = "non_existent";
      (prisma.image.findUnique as jest.Mock).mockResolvedValue(null); // findUnique returns null

      await expect(mediaService.deleteMedia(mediaId)).rejects.toThrow("Media not found.");
      expect(prisma.image.findUnique).toHaveBeenCalledWith({ where: { id: mediaId } });
      expect(prisma.image.delete).not.toHaveBeenCalled(); // delete should not be called
    });

    // Add a test case for Cloudinary cleanup failure
    it("logs warning when Cloudinary cleanup fails", async () => {
      const mediaId = "media_123";
      const cloudinaryError = new Error("Cloudinary API error");

      (prisma.image.findUnique as jest.Mock).mockResolvedValue(mockFoundImage);
      (prisma.image.delete as jest.Mock).mockResolvedValue({ id: mediaId });
      (cloudinaryUtils.extractPublicIdFromUrl as jest.Mock).mockReturnValue("some_image");
      // (cloudinaryUtils.inferResourceType as jest.Mock).mockReturnValue("image"); // Removed incorrect expectation
      (mockedCloudinary.cloudinary.api.delete_resources as jest.Mock).mockRejectedValue(
        cloudinaryError,
      ); // Mock cloudinary API call through the mocked config

      const loggerWarnSpy = jest.spyOn(mockedLogger.logger, "warn"); // Spy on mocked logger.warn

      const result = await mediaService.deleteMedia(mediaId);

      // The actual logger.warn call uses a single template literal string
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Cloudinary cleanup failed for media"),
      );
      expect(result.success).toBe(true); // Still returns success as DB deletion passed

      loggerWarnSpy.mockRestore(); // Restore original console.warn
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
