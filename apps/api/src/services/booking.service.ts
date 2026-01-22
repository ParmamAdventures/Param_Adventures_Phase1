import { prisma } from "../lib/prisma";
import { notificationQueue } from "../lib/queue";
import { HttpError } from "../utils/httpError";
import { assertBookingTransition } from "../domain/booking/bookingTransitions";
import { ErrorMessages } from "../constants/errorMessages";
import { auditService, AuditActions, AuditTargetTypes } from "./audit.service";

import type { Prisma } from "../generated/client";

export class BookingService {
  async createBooking(data: {
    userId: string;
    tripId: string;
    startDate: string;
    guests: number;
    guestDetails?: Prisma.InputJsonValue;
  }) {
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
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
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

    // Auto-refund if payment was captured
    const capturedPayment = booking.payments.find((p) => p.status === "CAPTURED");
    if (capturedPayment && capturedPayment.providerPaymentId) {
      try {
        const { razorpayService } = await import("./razorpay.service");
        const refund = await razorpayService.refundPayment(capturedPayment.providerPaymentId);

        await prisma.payment.update({
          where: { id: capturedPayment.id },
          data: {
            status: "REFUNDED",
            razorpayRefundId: refund.id as string,
            refundedAmount: (refund as any).amount || capturedPayment.amount,
          },
        });
      } catch (err) {
        console.error("Auto-refund failed during cancellation:", err);
        // We still cancel the booking but note the refund error
        // In production, we might want to flag this for manual review
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        paymentStatus: capturedPayment ? "PAID" : "PENDING", // Keep PAID if it was paid, or FAILED if refund failed?
        // Actually, schema has PAID/FAILED/PENDING. Maybe add REFUNDED to BookingPaymentStatus?
        // For now, keeping it as is.
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

  async approveBooking(id: string, adminId: string) {
    return prisma.$transaction(
      async (tx) => {
        const booking = await tx.booking.findUnique({ where: { id } });
        if (!booking) throw new HttpError(404, "NOT_FOUND", ErrorMessages.BOOKING_NOT_FOUND);

        if (booking.status === "CONFIRMED" || booking.status === "REJECTED") {
          throw new HttpError(403, "INVALID_STATE", "Booking already processed");
        }

        try {
          assertBookingTransition(booking.status as any, "approve");
        } catch {
          throw new HttpError(
            403,
            "INVALID_BOOKING_TRANSITION",
            "Booking cannot be approved in its current state",
          );
        }

        const confirmedCount = await tx.booking.count({
          where: { tripId: booking.tripId, status: "CONFIRMED" },
        });

        const trip = await tx.trip.findUnique({ where: { id: booking.tripId } });
        if (!trip) throw new HttpError(404, "NOT_FOUND", ErrorMessages.TRIP_NOT_FOUND);

        if (confirmedCount >= trip.capacity) {
          await auditService.logAudit({
            actorId: adminId,
            action: AuditActions.BOOKING_REJECTED,
            targetType: AuditTargetTypes.BOOKING,
            targetId: booking.id,
            metadata: { tripId: booking.tripId, reason: "capacity_full" },
          });
          throw new HttpError(409, "CAPACITY_FULL", "Trip capacity is full");
        }

        const updated = await tx.booking.update({
          where: { id },
          data: { status: "CONFIRMED" },
        });

        await auditService.logAudit({
          actorId: adminId,
          action: AuditActions.BOOKING_CONFIRMED,
          targetType: AuditTargetTypes.BOOKING,
          targetId: booking.id,
          metadata: { tripId: booking.tripId },
        });

        return updated;
      },
      {
        isolationLevel: "Serializable",
      },
    );
  }
}

export const bookingService = new BookingService();
