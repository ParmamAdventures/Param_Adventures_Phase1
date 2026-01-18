import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const { tripId, rating, comment } = req.body;
  const userId = (req as any).user.id;

  if (!tripId || !rating) {
    throw new HttpError(400, "BAD_REQUEST", "Trip ID and Rating are required");
  }

  // Check if user already reviewed
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_tripId: {
        userId,
        tripId,
      },
    },
  });

  if (existingReview) {
    throw new HttpError(409, "CONFLICT", "You have already reviewed this trip");
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      userId,
      tripId,
      rating,
      comment,
    },
  });

  return ApiResponse.success(res, review, 201, "Review created successfully");
});

