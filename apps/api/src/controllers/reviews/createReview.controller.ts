import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { reviewService } from "../../services/review.service";

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const { tripId, rating, comment } = req.body;
  const userId = (req as any).user.id;

  const review = await reviewService.createReview({ tripId, rating, comment } as any, userId);

  return ApiResponse.success(res, review, "Review created successfully", 201);
});
