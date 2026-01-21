jest.mock("../../src/lib/prisma");
jest.mock("../../src/services/audit.service");

import { prisma } from "../../src/lib/prisma";
import { auditService } from "../../src/services/audit.service";
import { TripService } from "../../src/services/trip.service";

describe("TripService", () => {
  let tripService: TripService;

  beforeEach(() => {
    jest.clearAllMocks();
    tripService = new TripService();
    (auditService.logAudit as jest.Mock).mockResolvedValue({ id: "audit_123" });
  });

  describe("createTrip", () => {
    it("creates a trip with valid data", async () => {
      const userId = "user_123";
      const tripData = {
        title: "Mountain Trek",
        slug: "mountain-trek",
        description: "A great mountain trek",
        category: "TREK",
        durationDays: 5,
        difficulty: "Moderate",
        price: 15000,
        capacity: 20,
        startDate: "2024-05-01",
        endDate: "2024-05-06",
      };

      const mockTrip = {
        id: "trip_123",
        ...tripData,
        startDate: new Date(tripData.startDate),
        endDate: new Date(tripData.endDate),
        createdById: userId,
        coverImage: null,
        gallery: [],
        status: "DRAFT",
      };

      (prisma.trip.create as jest.Mock).mockResolvedValue(mockTrip);

      const result = await tripService.createTrip(tripData, userId);

      expect(prisma.trip.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: tripData.title,
            createdById: userId,
          }),
        }),
      );
      expect(result.id).toBe("trip_123");
      expect(auditService.logAudit as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: userId,
          action: "TRIP_CREATED",
          targetType: "TRIP",
          targetId: "trip_123",
        }),
      );
    });

    it("handles gallery creation when provided", async () => {
      const userId = "user_123";
      const tripData = {
        title: "Trek with Gallery",
        slug: "trek-gallery",
        description: "Trek with images",
        category: "TREK",
        durationDays: 3,
        difficulty: "EASY",
        price: 10000,
        gallery: [
          { id: "img_1", order: 0 },
          { id: "img_2", order: 1 },
        ],
      };

      (prisma.trip.create as jest.Mock).mockResolvedValue({ id: "trip_456", ...tripData });

      await tripService.createTrip(tripData, userId);

      expect(prisma.trip.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            gallery: {
              create: expect.arrayContaining([
                expect.objectContaining({ imageId: "img_1", order: 0 }),
                expect.objectContaining({ imageId: "img_2", order: 1 }),
              ]),
            },
          }),
        }),
      );
    });

    it("handles missing dates gracefully", async () => {
      const userId = "user_123";
      const tripData = {
        title: "Trek without dates",
        slug: "trek-no-dates",
        description: "Simple trek",
        category: "TREK",
        durationDays: 2,
      };

      (prisma.trip.create as jest.Mock).mockResolvedValue({
        id: "trip_789",
        ...tripData,
        startDate: null,
      });

      const result = await tripService.createTrip(tripData, userId);

      expect(prisma.trip.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            startDate: null,
            endDate: null,
          }),
        }),
      );
      expect(result).toBeDefined();
    });

    it("logs audit event after successful creation", async () => {
      const userId = "user_audit";
      const tripData = { title: "Audit Trek", slug: "audit-trek", category: "TREK" };

      (prisma.trip.create as jest.Mock).mockResolvedValue({
        id: "trip_audit",
        status: "DRAFT",
        ...tripData,
      });

      await tripService.createTrip(tripData, userId);

      expect(auditService.logAudit as jest.Mock).toHaveBeenCalledWith({
        actorId: userId,
        action: "TRIP_CREATED",
        targetType: "TRIP",
        targetId: "trip_audit",
        metadata: { status: "DRAFT" },
      });
    });

    it("propagates creation errors", async () => {
      const userId = "user_123";
      const tripData = { title: "Bad Trek" };
      const error = new Error("Database constraint violation");

      (prisma.trip.create as jest.Mock).mockRejectedValue(error);

      await expect(tripService.createTrip(tripData, userId)).rejects.toThrow(
        "Database constraint violation",
      );
    });
  });

  describe("getTripBySlug", () => {
    it("retrieves trip by slug with all relations", async () => {
      const slug = "mountain-trek";
      const mockTrip = {
        id: "trip_slug_1",
        title: "Mountain Trek",
        slug,
        coverImage: { id: "img_cover", url: "cover.jpg" },
        heroImage: { id: "img_hero", url: "hero.jpg" },
        gallery: [
          { id: "gal_1", image: { id: "img_1", url: "img1.jpg" }, order: 0 },
          { id: "gal_2", image: { id: "img_2", url: "img2.jpg" }, order: 1 },
        ],
      };

      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip);

      const result = await tripService.getTripBySlug(slug);

      expect(prisma.trip.findUnique as jest.Mock).toHaveBeenCalledWith({
        where: { slug },
        include: {
          coverImage: true,
          heroImage: true,
          gallery: {
            include: { image: true },
            orderBy: { order: "asc" },
          },
        },
      });
      expect(result!.id).toBe("trip_slug_1");
      expect(result!.gallery).toHaveLength(2);
      expect(result!.gallery[0].order).toBe(0);
    });

    it("returns null when trip not found", async () => {
      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await tripService.getTripBySlug("nonexistent-trek");

      expect(result).toBeNull();
    });

    it("includes ordered gallery items", async () => {
      const mockTrip = {
        id: "trip_123",
        slug: "trek",
        gallery: [
          { order: 0, image: { url: "first.jpg" } },
          { order: 1, image: { url: "second.jpg" } },
          { order: 2, image: { url: "third.jpg" } },
        ],
      };

      (prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip);

      const result = await tripService.getTripBySlug("trek");

      expect(result!.gallery).toHaveLength(3);
      expect(result!.gallery.map((g) => g.order)).toEqual([0, 1, 2]);
    });

    it("propagates database errors", async () => {
      const error = new Error("Database connection failed");
      (prisma.trip.findUnique as jest.Mock).mockRejectedValue(error);

      await expect(tripService.getTripBySlug("trek")).rejects.toThrow("Database connection failed");
    });
  });

  describe("updateTrip", () => {
    it("updates trip with new data", async () => {
      const tripId = "trip_update_1";
      const userId = "user_update";
      const updateData = {
        title: "Updated Trek Title",
        description: "New description",
        price: 20000,
      };

      const mockUpdatedTrip = {
        id: tripId,
        ...updateData,
        status: "DRAFT",
      };

      (prisma.trip.update as jest.Mock).mockResolvedValue(mockUpdatedTrip);

      const result = await tripService.updateTrip(tripId, updateData, userId);

      expect(prisma.trip.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: tripId },
        data: expect.objectContaining({
          title: updateData.title,
          description: updateData.description,
          price: updateData.price,
        }),
      });
      expect(result.id).toBe(tripId);
      expect(result.title).toBe("Updated Trek Title");
      expect(auditService.logAudit as jest.Mock).toHaveBeenCalledWith({
        actorId: userId,
        action: "TRIP_UPDATED",
        targetType: "TRIP",
        targetId: tripId,
      });
    });

    it("updates trip dates", async () => {
      const tripId = "trip_dates";
      const userId = "user_123";
      const updateData = {
        startDate: "2024-06-01",
        endDate: "2024-06-07",
      };

      (prisma.trip.update as jest.Mock).mockResolvedValue({ id: tripId });

      await tripService.updateTrip(tripId, updateData, userId);

      expect(prisma.trip.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: tripId },
        data: expect.objectContaining({
          startDate: new Date("2024-06-01"),
          endDate: new Date("2024-06-07"),
        }),
      });
    });

    it("replaces gallery when provided", async () => {
      const tripId = "trip_gallery_update";
      const userId = "user_123";
      const updateData = {
        gallery: [
          { id: "new_img_1", order: 0 },
          { id: "new_img_2", order: 1 },
        ],
      };

      (prisma.trip.update as jest.Mock).mockResolvedValue({ id: tripId });

      await tripService.updateTrip(tripId, updateData, userId);

      expect(prisma.trip.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: tripId },
        data: expect.objectContaining({
          gallery: {
            deleteMany: {},
            create: [
              { imageId: "new_img_1", order: 0 },
              { imageId: "new_img_2", order: 1 },
            ],
          },
        }),
      });
    });

    it("handles partial updates without dates", async () => {
      const tripId = "trip_partial";
      const userId = "user_123";
      const updateData = { title: "New Title" };

      (prisma.trip.update as jest.Mock).mockResolvedValue({ id: tripId });

      await tripService.updateTrip(tripId, updateData, userId);

      expect(prisma.trip.update as jest.Mock).toHaveBeenCalledWith({
        where: { id: tripId },
        data: expect.objectContaining({
          title: "New Title",
          startDate: undefined,
          endDate: undefined,
        }),
      });
    });

    it("propagates update errors", async () => {
      const tripId = "trip_error";
      const userId = "user_123";
      const error = new Error("Trip not found");

      (prisma.trip.update as jest.Mock).mockRejectedValue(error);

      await expect(tripService.updateTrip(tripId, { title: "Test" }, userId)).rejects.toThrow(
        "Trip not found",
      );
    });
  });
});
