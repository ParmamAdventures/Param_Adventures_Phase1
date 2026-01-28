import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { reviewService } from "../../services/review.service";

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const { tripId, rating, comment } = req.body;
  const userId = req.user!.id;

  const review = await reviewService.createReview(
    { tripId, rating, comment } as import("@prisma/client").Prisma.ReviewUncheckedCreateInput,
    userId,
  );

  return ApiResponse.success(res, review, "Review created successfully", 201);
});
