import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { reviewService } from "../../services/review.service";

export const checkReviewEligibility = catchAsync(async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const userId = req.user!.id;

  const result = await reviewService.checkEligibility(tripId, userId);

  return res.json(result);
});
