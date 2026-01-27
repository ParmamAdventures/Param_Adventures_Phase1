import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const getInternalTrips = catchAsync(async (req: Request, res: Response) => {
  const { status, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const where: Prisma.TripWhereInput = {};
  if (status) {
    where.status = status as Prisma.EnumTripStatusFilter<"Trip">;
  }

  const sortOptions: Record<string, "asc" | "desc"> = {};
  if (sortBy && sortOrder) {
    sortOptions[String(sortBy)] = sortOrder === "asc" ? "asc" : "desc";
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

  return ApiResponse.success(
    res,
    {
      data: trips,
      metadata: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
      },
    },
    "Internal trips fetched",
  );
});
