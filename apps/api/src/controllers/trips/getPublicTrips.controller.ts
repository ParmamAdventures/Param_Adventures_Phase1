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

  if (!hasFilters && !category) {
    // Use cache for basic public trips request
    const trips = await TripCacheService.getPublicTrips();
    return ApiResponse.success(res, "Trips fetched", trips);
  }

  if (!hasFilters && category) {
    // Use cache for category-filtered trips
    const trips = await TripCacheService.getPublicTrips({ category: String(category) });
    return ApiResponse.success(res, "Trips fetched", trips);
  }

  // For complex filters, fetch from database directly (bypass cache)
  const where: any = { status: "PUBLISHED" };

  if (search) {
    // Upgraded to Prisma's full-text search capability
    where.OR = [
      { title: { search: String(search).split(" ").join(" & ") } },
      { description: { search: String(search).split(" ").join(" & ") } },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (difficulty) {
    where.difficulty = difficulty;
  }

  if (capacity) {
    where.capacity = { gte: Number(capacity) };
  }

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

  // Define allowed sort fields to prevent injection
  const allowedSortFields = ["price", "durationDays", "startDate", "createdAt", "title"];
  const finalSortField = allowedSortFields.includes(String(sortBy)) ? String(sortBy) : "createdAt";
  const finalSortOrder = sortOrder === "asc" ? "asc" : "desc";

  const trips = await prisma.trip.findMany({
    where,
    orderBy: { [finalSortField]: finalSortOrder },
    include: {
      coverImage: true,
    },
  });

  return ApiResponse.success(res, "Trips fetched", trips);
});
