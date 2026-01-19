import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { createAuditLog } from "../../utils/auditLog";
import { ApiResponse } from "../../utils/ApiResponse";
import { ErrorMessages } from "../../constants/errorMessages";
import { catchAsync } from "../../utils/catchAsync";

/**
 * Reject Blog
 */
export const rejectBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const { reason } = req.body || {};

  const blog = await prisma.blog.findUnique({ where: { id } });

  if (!blog) {
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.BLOG_NOT_FOUND);
  }

  if (blog.status !== "PENDING_REVIEW") {
    throw new HttpError(403, "INVALID_STATE", "Only blogs in review can be rejected");
  }

  const updated = await prisma.blog.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  await createAuditLog({
    actorId: user.id,
    action: "BLOG_REJECTED",
    targetType: "BLOG",
    targetId: blog.id,
    metadata: { reason },
  });

  return ApiResponse.success(res, updated, "Blog rejected successfully");
});
