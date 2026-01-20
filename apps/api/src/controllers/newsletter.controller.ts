import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiResponse } from "../utils/ApiResponse";
import { catchAsync } from "../utils/catchAsync";

/**
 * Subscribe email to newsletter or reactivate existing subscription.
 * @param {Request} req - Request with email in body
 * @param {Response} res - Response with subscription status
 * @returns {Promise<void>} - Sends success or error response
 */
export const subscribe = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return ApiResponse.error(res, "NEWSLETTER_EMAIL_REQUIRED", "Email is required", 400);
  }

  // Check if already subscribed
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  });

  if (existing) {
    if (!existing.isSubscribed) {
      // Reactivate
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { isSubscribed: true },
      });
      return ApiResponse.success(res, {}, "Welcome back! Subscription reactivated.");
    }
    return ApiResponse.success(res, {}, "You are already subscribed!");
  }

  await prisma.newsletterSubscriber.create({
    data: { email },
  });

  return ApiResponse.success(res, {}, "Subscribed successfully! Stay tuned for updates.", 201);
});
