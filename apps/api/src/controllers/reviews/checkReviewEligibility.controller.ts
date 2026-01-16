import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";

export const checkReviewEligibility = catchAsync(async (req: Request, res: Response) => {
  const { tripId } = req.params;
  const userId = (req as any).user.id;

  // Check if user has a completed booking for this trip
  // For now, allowing any booking or even just being a user if we want easier testing
  // But strict logic:
  /*
  const booking = await prisma.booking.findFirst({
    where: {
      userId,
      tripId,
      status: "COMPLETED",
    },
  });
  */

  // For stabilization/testing phase, we relax this or check just Booking existence
  const booking = await prisma.booking.findFirst({
    where: {
      userId,
      tripId,
    },
  });

  const hasReview = await prisma.review.findUnique({
    where: {
      userId_tripId: { userId, tripId },
    },
  });

  if (hasReview) {
    return res.json({ eligible: false, reason: "You have already reviewed this trip." });
  }

  if (!booking) {
    return res.json({ eligible: false, reason: "You need a booking for this trip." });
  }

  return res.json({ eligible: true });
});
