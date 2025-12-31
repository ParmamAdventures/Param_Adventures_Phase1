import { prisma } from "../lib/prisma";
import { notificationQueue } from "../lib/queue";

export class BookingService {
  async createBooking(data: { userId: string; tripId: string; startDate: string; guests: number }) {
    const { userId, tripId, startDate, guests } = data;

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new Error("Trip not found");
    }

    if (trip.status !== "PUBLISHED") {
      throw new Error("Trip is not available for booking");
    }

    const totalPrice = trip.price * guests;

    const booking = await prisma.booking.create({
      data: {
        userId,
        tripId,
        startDate: new Date(startDate),
        guests,
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

    // Send Notification (Async)
    await notificationQueue.add("SEND_BOOKING_EMAIL", {
      userId,
      details: {
        tripTitle: booking.trip.title,
        bookingId: booking.id,
        startDate: booking.startDate,
        status: booking.status,
      },
    });

    return booking;
  }

  async cancelBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (["CANCELLED", "COMPLETED", "REJECTED"].includes(booking.status)) {
      throw new Error("Booking cannot be cancelled in its current state");
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
      throw new Error("Booking not found");
    }

    if (booking.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return booking;
  }
}

export const bookingService = new BookingService();
