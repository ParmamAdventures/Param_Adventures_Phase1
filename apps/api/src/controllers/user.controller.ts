import { Request, Response } from "express";
import { userService } from "../services/user.service";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";

/**
 * Update user profile with provided data (name, bio, preferences, etc).
 * @param {Request} req - Express request with user ID in req.user and update data in body
 * @param {Response} res - Express response with updated user details
 * @returns {Promise<void>} - Sends success response with updated user object
 * @throws {Error} - Throws if user not found or validation fails
 */
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const user = await userService.updateProfile(userId, req.body);

  return ApiResponse.success(res, "Profile updated successfully", {
    user,
  });
});
