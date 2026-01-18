import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const getBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      trip: {
        select: {
          title: true,
          slug: true,
          location: true,
          coverImageLegacy: true,
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
  });

  return ApiResponse.success(res, bookings, "Bookings fetched successfully");
});

