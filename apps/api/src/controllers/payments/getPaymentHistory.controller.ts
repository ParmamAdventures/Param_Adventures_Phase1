import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { ApiResponse } from "../../utils/ApiResponse";

export const getPaymentHistory = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    // Should be caught by auth middleware, but safety first
    return ApiResponse.error(res, "UNAUTHORIZED", "Unauthorized", 401);
  }

  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Fetch payments where the associated booking belongs to the user
  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        userId: userId,
      },
    },
    include: {
      booking: {
        select: {
          id: true,
          trip: {
            select: { title: true, slug: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: skip,
  });

  const total = await prisma.payment.count({
    where: {
      booking: {
        userId: userId,
      },
    },
  });

  return ApiResponse.success(
    res,
    {
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        currency: p.currency,
        date: p.createdAt,
        bookingId: p.bookingId,
        tripTitle: p.booking.trip.title,
        tripSlug: p.booking.trip.slug,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    "Payment history retrieved",
  );
};
