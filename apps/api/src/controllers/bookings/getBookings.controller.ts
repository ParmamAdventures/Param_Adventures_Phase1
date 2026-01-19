import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const getBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { page, limit, skip } = req.pagination || { page: 1, limit: 10, skip: 0 };

  const where = { userId };

  const [total, bookings] = await prisma.$transaction([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      include: {
        trip: {
          select: {
            title: true,
            slug: true,
            location: true,

            coverImage: {
              select: {
                mediumUrl: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return ApiResponse.success(
    res,
    {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    "Bookings fetched successfully",
  );
});
