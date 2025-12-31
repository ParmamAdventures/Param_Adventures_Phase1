import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiResponse } from "../utils/ApiResponse";
import { catchAsync } from "../utils/catchAsync";

export const createInquiry = catchAsync(async (req: Request, res: Response) => {
  const { name, email, phoneNumber, destination, dates, budget, details } = req.body;

  if (!name || !email || !destination) {
    return ApiResponse.error(res, "Name, Email and Destination are required", 400);
  }

  const inquiry = await prisma.tripInquiry.create({
    data: {
      name,
      email,
      phoneNumber,
      destination,
      dates,
      budget,
      details,
    },
  });

  return ApiResponse.success(res, "Inquiry received successfully", inquiry, 201);
});
