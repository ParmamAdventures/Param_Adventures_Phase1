import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { createAuditLog } from "../../utils/auditLog";
import { ApiResponse } from "../../utils/ApiResponse";
import { ErrorMessages } from "../../constants/errorMessages";
import { catchAsync } from "../../utils/catchAsync";

/**
 * Submit Blog
 */
export const submitBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const blog = await prisma.blog.findUnique({ where: { id } });

  if (!blog || blog.authorId !== user.id) {
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.BLOG_NOT_FOUND);
  }

  if (blog.status !== "DRAFT" && blog.status !== "REJECTED") {
    throw new HttpError(403, "INVALID_STATE", "Cannot submit blog in its current state");
  }

  const updated = await prisma.blog.update({
    where: { id },
    data: { status: "PENDING_REVIEW" },
  });

  await createAuditLog({
    actorId: user.id,
    action: "BLOG_SUBMITTED",
    targetType: "BLOG",
    targetId: blog.id,
  });

  return ApiResponse.success(res, updated, "Blog submitted for review successfully");
});
