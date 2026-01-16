import { Request, Response } from "express";
import { userService } from "../services/user.service";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { name, nickname, bio, avatarImageId, age, gender, phoneNumber, address, preferences } =
    req.body;

  const user = await userService.updateProfile(userId, req.body);

  return ApiResponse.success(res, "Profile updated successfully", {
    user,
  });
});
