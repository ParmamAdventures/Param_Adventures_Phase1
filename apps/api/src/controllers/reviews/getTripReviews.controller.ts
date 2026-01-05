import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const getTripReviews = catchAsync(async (req: Request, res: Response) => {
  const { tripId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { tripId },
    include: {
      user: {
        select: {
          name: true,
          avatarImage: {
            select: { thumbUrl: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(reviews); // Directly returning array as frontend expects plain array
});
