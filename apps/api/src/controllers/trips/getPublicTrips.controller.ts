import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { TripCacheService } from "../../services/trip-cache.service";

export const getPublicTrips = catchAsync(async (req: Request, res: Response) => {
  const {
    search,
    category,
    difficulty,
    maxPrice,
    minPrice,
    minDays,
    maxDays,
    startDate,
    endDate,
    capacity,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Pagination parameters (injected by middleware or defaults)
  const { page, limit, skip } = req.pagination || { page: 1, limit: 10, skip: 0 };

  // If filtering is applied (not just basic category), skip cache
  const hasFilters =
    search ||
    difficulty ||
    maxPrice ||
    minPrice ||
    minDays ||
    maxDays ||
    startDate ||
    endDate ||
    capacity;

  if (!hasFilters && !category && page === 1) {
    // Use cache for basic public trips request (first page only to keep cache simple)
    const trips = await TripCacheService.getPublicTrips();
    // Cache service returns array, so wrap it.
    // Note: Cached version doesn't support pagination metadata yet.
    // For now, we return cached for pure speed on home page.
    return ApiResponse.success(res, trips, "Trips fetched");
  }

  // Build query
  const where: any = { status: "PUBLISHED" };

  if (search) {
    where.OR = [
      { title: { search: String(search).split(" ").join(" & ") } },
      { description: { search: String(search).split(" ").join(" & ") } },
    ];
  }

  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;
  if (capacity) where.capacity = { gte: Number(capacity) };

  if (maxPrice || minPrice) {
    where.price = {};
    if (maxPrice) where.price.lte = Number(maxPrice);
    if (minPrice) where.price.gte = Number(minPrice);
  }

  if (minDays || maxDays) {
    where.durationDays = {};
    if (minDays) where.durationDays.gte = Number(minDays);
    if (maxDays) where.durationDays.lte = Number(maxDays);
  }

  if (startDate || endDate) {
    where.startDate = {};
    if (startDate) where.startDate.gte = new Date(String(startDate));
    if (endDate) where.startDate.lte = new Date(String(endDate));
  }

  if (Boolean(req.query.isFeatured) === true) {
    where.isFeatured = true;
  }

  const allowedSortFields = ["price", "durationDays", "startDate", "createdAt", "title"];
  const finalSortField = allowedSortFields.includes(String(sortBy)) ? String(sortBy) : "createdAt";
  const finalSortOrder = sortOrder === "asc" ? "asc" : "desc";

  // Execute query with pagination
  const [total, trips] = await prisma.$transaction([
    prisma.trip.count({ where }),
    prisma.trip.findMany({
      where,
      orderBy: { [finalSortField]: finalSortOrder },
      include: {
        coverImage: true,
      },
      skip,
      take: limit,
    }),
  ]);

  return ApiResponse.success(
    res,
    {
      trips,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    "Trips fetched successfully",
  );
});
