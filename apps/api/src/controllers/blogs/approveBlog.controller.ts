import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { createAuditLog } from "../../utils/auditLog";
import { ApiResponse } from "../../utils/ApiResponse";
import { ErrorMessages } from "../../constants/errorMessages";
import { blogService } from "../../services/blog.service";
import { catchAsync } from "../../utils/catchAsync";

/**
 * Approve Blog
 */
export const approveBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const updated = await blogService.approveBlog(id, user.id);

  return ApiResponse.success(res, updated, "Blog approved successfully");
});
