import { prisma } from "../lib/prisma";
import { notificationQueue } from "../lib/queue";
import { HttpError } from "../utils/httpError";
import { razorpayService } from "./razorpay.service";

import type { Prisma } from "@prisma/client";

export class BookingService {
  async createBooking(data: {
    userId: string;
    tripId: string;
    startDate: string;
    guests: number;
    guestDetails?: Prisma.InputJsonValue;
  }) {
    const { userId, tripId, startDate, guests, guestDetails } = data;

    // Use interactive transaction to prevent race conditions (overbooking)
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Lock the Trip row (or at least read it fresh) and check status
      const trip = await tx.trip.findUnique({ where: { id: tripId } });
      if (!trip) {
        throw new HttpError(404, "NOT_FOUND", "Trip not found");
      }

      if (trip.status !== "PUBLISHED") {
        throw new HttpError(400, "BAD_REQUEST", "Trip is not available for booking");
      }

      // 2. Check current capacity atomically
      // Count confirmed bookings for this trip
      // Note: We might want to filter by specific date if capacity is per-date,
      // but schema suggests global trip capacity or logic implies per-trip instance.
      // Assuming 'trip' is a specific date-bound instance or capacity is total.
      // Based on schema `bookings Booking[]`, we check total active bookings.
      const confirmedBookingsCount = await tx.booking.count({
        where: {
          tripId,
          status: { in: ["CONFIRMED", "COMPLETED"] } // Only count occupied spots
        }
      });

      // We also need to sum 'guests' because one booking can have multiple guests
      // aggregate is better than count if guests > 1
      const confirmedGuestsAgg = await tx.booking.aggregate({
        where: {
            tripId,
            status: { in: ["CONFIRMED", "COMPLETED"] }
        },
        _sum: {
            guests: true
        }
      });
      const currentGuestCount = confirmedGuestsAgg._sum.guests || 0;

      if (currentGuestCount + guests > trip.capacity) {
         throw new HttpError(409, "CONFLICT", "Not enough spots available for this trip.");
      }

      const totalPrice = trip.price * guests;

      // 3. Create Booking
      return tx.booking.create({
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
    }, {
      isolationLevel: "Serializable" // Strongest isolation to prevent phantom reads/write skew
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
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true }
    });

    if (!booking) {
      throw new HttpError(404, "NOT_FOUND", "Booking not found");
    }

    if (booking.userId !== userId) {
      throw new HttpError(403, "FORBIDDEN", "Unauthorized");
    }

    if (["CANCELLED", "COMPLETED", "REJECTED"].includes(booking.status)) {
      throw new HttpError(400, "BAD_REQUEST", "Booking cannot be cancelled in its current state");
    }

    // Auto-Refund Logic
    // Check if there is a successful payment associated with this booking
    const successfulPayment = booking.payments.find(
      (p) => p.status === "CAPTURED" || p.status === "AUTHORIZED"
    );

    if (successfulPayment && successfulPayment.providerPaymentId) {
      try {
        // Initiate refund via Razorpay
        // Note: This refunds the full amount. For partial refunds based on policy,
        // we would calculate amount here based on cancellation policy.
        // Assuming full refund for now as per "Auto-Refund" request.
        const refund = await razorpayService.refundPayment(successfulPayment.providerPaymentId);

        // Update payment status
        await prisma.payment.update({
          where: { id: successfulPayment.id },
          data: {
            status: "REFUNDED",
            refundedAmount: refund.amount, // Razorpay returns amount in paise
            razorpayRefundId: refund.id,
          }
        });
      } catch (error) {
        console.error("Auto-refund failed for booking:", bookingId, error);
        // We do NOT stop cancellation, but we should probably alert admin or log this critically.
        // For now, proceeding to cancel booking so user slot is freed.
        // In a strict financial system, we might want to flag this booking as "CANCELLATION_PENDING_REFUND"
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        paymentStatus: successfulPayment ? "REFUNDED" : booking.paymentStatus // Update booking payment status if refunded
      },
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
