import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { auditService } from "../../services/audit.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { ErrorMessages } from "../../constants/errorMessages";
import { blogService } from "../../services/blog.service";
import { catchAsync } from "../../utils/catchAsync";

/**
 * Submit Blog
 */
export const submitBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const updated = await blogService.submitForReview(id, user.id);

  return ApiResponse.success(res, updated, "Blog submitted for review successfully");
});
