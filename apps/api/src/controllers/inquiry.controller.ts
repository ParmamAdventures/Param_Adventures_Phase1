import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiResponse } from "../utils/ApiResponse";
import { catchAsync } from "../utils/catchAsync";

/**
 * Create a new trip inquiry from potential customers.
 * Stores inquiry details for admin review and follow-up.
 * @param {Request} req - Request with name, email, destination (required), phoneNumber, dates, budget, details (optional)
 * @param {Response} res - Response with created inquiry
 * @returns {Promise<void>} - Sends created inquiry or validation error
 */
export const createInquiry = catchAsync(async (req: Request, res: Response) => {
  const { name, email, phoneNumber, destination, dates, budget, details } = req.body;

  // Validation handled by middleware

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

  return ApiResponse.success(res, inquiry, "Inquiry received successfully", 201);
});
