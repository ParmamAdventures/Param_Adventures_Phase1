
jest.mock("../../src/lib/prisma", () => ({
  __esModule: true,
  prisma: {
    trip: {
      findUnique: jest.fn(),
    },
    booking: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

jest.mock("../../src/lib/queue", () => ({
  notificationQueue: {
    add: jest.fn().mockResolvedValue({}),
  },
}));

import { bookingService } from "../../src/services/booking.service";
import { prisma } from "../../src/lib/prisma";
import { notificationQueue } from "../../src/lib/queue";

const prismaMock = prisma as any;

describe("BookingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBooking", () => {
    it("should create a booking successfully", async () => {
      const bookingData = { userId: "user-1", tripId: "trip-1", startDate: "2024-01-01", guests: 2 };
      const mockTrip = { id: "trip-1", price: 100, status: "PUBLISHED", title: "Test Trip", slug: "test-trip" };
      
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip);
      prismaMock.booking.create.mockResolvedValue({
        id: "booking-1",
        ...bookingData,
        totalPrice: 200,
        status: "REQUESTED",
        trip: { title: "Test Trip", slug: "test-trip" }
      });

      const result = await bookingService.createBooking(bookingData);

      expect(result.id).toBe("booking-1");
      expect(result.totalPrice).toBe(200);
      expect(prismaMock.booking.create).toHaveBeenCalled();
      expect(notificationQueue.add).toHaveBeenCalled();
    });

    it("should throw error if trip not found", async () => {
      prismaMock.trip.findUnique.mockResolvedValue(null);
      await expect(bookingService.createBooking({ userId: "u1", tripId: "t1", startDate: "2024", guests: 1 }))
        .rejects.toThrow("Trip not found");
    });

    it("should throw error if trip is not published", async () => {
      prismaMock.trip.findUnique.mockResolvedValue({ status: "DRAFT" });
      await expect(bookingService.createBooking({ userId: "u1", tripId: "t1", startDate: "2024", guests: 1 }))
        .rejects.toThrow("Trip is not available for booking");
    });
  });

  describe("cancelBooking", () => {
    it("should cancel a booking successfully", async () => {
      const mockBooking = { id: "b1", userId: "u1", status: "REQUESTED" };
      prismaMock.booking.findUnique.mockResolvedValue(mockBooking);
      prismaMock.booking.update.mockResolvedValue({ ...mockBooking, status: "CANCELLED" });

      const result = await bookingService.cancelBooking("b1", "u1");

      expect(result.status).toBe("CANCELLED");
      expect(prismaMock.booking.update).toHaveBeenCalledWith({
        where: { id: "b1" },
        data: { status: "CANCELLED" }
      });
    });

    it("should throw error if unauthorized", async () => {
      prismaMock.booking.findUnique.mockResolvedValue({ id: "b1", userId: "other" });
      await expect(bookingService.cancelBooking("b1", "u1")).rejects.toThrow("Unauthorized");
    });
  });
});
