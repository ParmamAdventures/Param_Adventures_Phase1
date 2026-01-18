import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { ApiResponse } from "../../utils/ApiResponse";
import { HttpError } from "../../utils/httpError";

export const getPaymentStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
      },
      trip: {
        select: { title: true, price: true },
      },
    },
  });

  if (!booking) {
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.BOOKING_NOT_FOUND);
  }

  // Security check: User can only see their own booking (Admin can see all)
  const isOwner = booking.userId === userId;
  const permissions = req.permissions as unknown as Set<string>; // Force cast to Set as per auth middleware
  const isAdmin = permissions?.has?.("bookings:read");

  if (!isOwner && !isAdmin) {
    throw new HttpError(403, "FORBIDDEN", "You do not have permission to view this booking");
  }

  return ApiResponse.success(
    res,
    {
      bookingId: booking.id,
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.totalPrice,
      tripTitle: booking.trip.title,
      payments: booking.payments.map((p) => ({
        id: p.id,
        status: p.status,
        amount: p.amount,
        providerOrderId: p.providerOrderId,
        createdAt: p.createdAt,
      })),
    },
    "Payment status retrieved",
  );
};
