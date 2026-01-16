import { prisma } from "../lib/prisma";
import { notificationQueue } from "../lib/queue";
import { HttpError } from "../utils/httpError";

import type { Prisma } from "@prisma/client";

export class BookingService {
  async createBooking(data: { userId: string; tripId: string; startDate: string; guests: number; guestDetails?: Prisma.InputJsonValue }) {
    const { userId, tripId, startDate, guests, guestDetails } = data;

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new HttpError(404, "NOT_FOUND", "Trip not found");
    }

    if (trip.status !== "PUBLISHED") {
      throw new HttpError(400, "BAD_REQUEST", "Trip is not available for booking");
    }

    const totalPrice = trip.price * guests;

    const booking = await prisma.booking.create({
      data: {
        userId,
        tripId,
        startDate: new Date(startDate),
        guests,
        guestDetails, // Save JSON to DB
        totalPrice,
        status: "REQUESTED",
        paymentStatus: "PENDING",
      },
      include: {
        trip: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    // Send Notification (Fire-and-forget to avoid blocking UI)
    // Send Notification (Fire-and-forget safe wrapper)
    (async () => {
      try {
        await notificationQueue.add("SEND_BOOKING_EMAIL", {
          userId,
          details: {
            tripTitle: booking.trip.title,
            bookingId: booking.id,
            startDate: booking.startDate,
            status: booking.status,
            guestDetails,
          },
        });
      } catch (err) {
        console.error("Failed to enqueue notification:", err);
      }
    })();

    return booking;
  }

  async cancelBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      throw new HttpError(404, "NOT_FOUND", "Booking not found");
    }

    if (booking.userId !== userId) {
      throw new HttpError(403, "FORBIDDEN", "Unauthorized");
    }

    if (["CANCELLED", "COMPLETED", "REJECTED"].includes(booking.status)) {
      throw new HttpError(400, "BAD_REQUEST", "Booking cannot be cancelled in its current state");
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    return updatedBooking;
  }

  async getMyBookings(userId: string) {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            coverImage: { select: { mediumUrl: true } },
            publishedAt: true,
            durationDays: true,
            difficulty: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Formatting for UI consistency if needed, but usually returning raw is fine for REST
    // Legacy controller had a payload map, but it's better to keep it clean in service
    return bookings;
  }

  async getBookingById(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        trip: {
          select: {
            title: true,
            slug: true,
            price: true,
            location: true,
            durationDays: true,
            difficulty: true,
            coverImage: { select: { mediumUrl: true } },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payments: true,
      },
    });

    if (!booking) {
      throw new HttpError(404, "NOT_FOUND", "Booking not found");
    }

    if (booking.userId !== userId) {
      throw new HttpError(403, "FORBIDDEN", "Unauthorized");
    }

    return booking;
  }
}

export const bookingService = new BookingService();
