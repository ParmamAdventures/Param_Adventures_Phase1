jest.mock("../../src/lib/prisma", () => ({
  __esModule: true,
  prisma: {
    trip: { findUnique: jest.fn() },
    booking: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn() },
    payment: { update: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

import { DeepMockProxy } from "jest-mock-extended";
import { PrismaClient, Trip, Booking } from "@prisma/client";

jest.mock("../../src/lib/queue", () => ({
  notificationQueue: {
    add: jest.fn().mockResolvedValue({}),
  },
}));

import { bookingService } from "../../src/services/booking.service";
import { prisma } from "../../src/lib/prisma";
// import { notificationQueue } from "../../src/lib/queue";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("BookingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBooking", () => {
    it("should create a booking successfully", async () => {
      const bookingData = {
        userId: "user-1",
        tripId: "trip-1",
        startDate: "2024-01-01",
        guests: 2,
      };
      const mockTrip = {
        id: "trip-1",
        price: 100,
        status: "PUBLISHED",
        title: "Test Trip",
        slug: "test-trip",
        capacity: 10,
      } as unknown as Trip; // Using rough cast for mock data

      prismaMock.trip.findUnique.mockResolvedValue(mockTrip);
      prismaMock.booking.create.mockResolvedValue({
        id: "booking-1",
        ...bookingData,
        startDate: new Date(bookingData.startDate), // Fix date type
        totalPrice: 200,
        status: "REQUESTED",
        paymentStatus: "PENDING",
        guestDetails: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: null,
      } as unknown as Booking);

      const result = await bookingService.createBooking(bookingData);

      expect(result.id).toBe("booking-1");
      expect(result.totalPrice).toBe(200);
      expect(prismaMock.booking.create).toHaveBeenCalled();

      // Allow async IIFE to run
      // await new Promise((resolve) => setTimeout(resolve, 500));
      // expect(notificationQueue.add).toHaveBeenCalled();
    });

    it("should throw error if trip not found", async () => {
      prismaMock.trip.findUnique.mockResolvedValue(null);
      await expect(
        bookingService.createBooking({ userId: "u1", tripId: "t1", startDate: "2024", guests: 1 }),
      ).rejects.toThrow("Trip not found");
    });

    it("should throw error if trip is not published", async () => {
      prismaMock.trip.findUnique.mockResolvedValue({ status: "DRAFT" } as unknown as Trip);
      await expect(
        bookingService.createBooking({ userId: "u1", tripId: "t1", startDate: "2024", guests: 1 }),
      ).rejects.toThrow("Trip is not available for booking");
    });
  });

  describe("cancelBooking", () => {
    it("should cancel a booking successfully", async () => {
      const mockBooking = { id: "b1", userId: "u1", status: "REQUESTED", payments: [] };
      prismaMock.booking.findUnique.mockResolvedValue(mockBooking as unknown as Booking);
      prismaMock.booking.update.mockResolvedValue({
        ...mockBooking,
        status: "CANCELLED",
      } as unknown as Booking);

      const result = await bookingService.cancelBooking("b1", "u1");

      expect(result.status).toBe("CANCELLED");
      expect(prismaMock.booking.update).toHaveBeenCalledWith({
        where: { id: "b1" },
        data: {
          status: "CANCELLED",
          paymentStatus: "PENDING",
        },
      });
    });

    it("should throw error if unauthorized", async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: "b1",
        userId: "other",
      } as unknown as Booking);
      await expect(bookingService.cancelBooking("b1", "u1")).rejects.toThrow("Unauthorized");
    });
  });
});
