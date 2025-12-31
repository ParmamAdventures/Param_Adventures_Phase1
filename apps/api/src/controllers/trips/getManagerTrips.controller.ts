import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const getManagerTrips = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return ApiResponse.error(res, "Unauthenticated", 401);
  }

  // Optional status filter
  const { status } = req.query;
  const where: any = {
    managerId: userId,
  };

  if (status) {
    where.status = status;
  }

  const trips = await prisma.trip.findMany({
    where,
    orderBy: { startDate: "asc" },
    include: {
      coverImage: true,
      guides: {
        include: {
          guide: { select: { id: true, name: true, email: true, avatarImage: true } },
        },
      },
      _count: {
        select: { bookings: true },
      },
    },
  });

  return ApiResponse.success(res, "Manager trips fetched", trips);
});
