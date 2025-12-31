import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const getInternalTrips = catchAsync(async (req: Request, res: Response) => {
  const { status, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const where: any = {};
  if (status) {
    where.status = status;
  }

  const sortOptions: any = {};
  if (sortBy && sortOrder) {
    sortOptions[String(sortBy)] = sortOrder;
  }

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      orderBy: sortOptions,
      skip,
      take: limitNumber,
      include: {
        coverImage: true,
      },
    }),
    prisma.trip.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limitNumber);

  return ApiResponse.success(res, "Internal trips fetched", {
    data: trips,
    metadata: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
    },
  });
});
