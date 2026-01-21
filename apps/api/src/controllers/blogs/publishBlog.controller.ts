import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { auditService } from "../../services/audit.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { ErrorMessages } from "../../constants/errorMessages";
import { catchAsync } from "../../utils/catchAsync";
import { EntityStatus } from "../../constants/status";

/**
 * Publish Blog
 */
export const publishBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const blog = await prisma.blog.findUnique({ where: { id } });

  if (!blog) {
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.BLOG_NOT_FOUND);
  }

  const permissions = req.permissions || [];
  const isOwner = blog.authorId === user.id;
  const hasPermission = permissions.includes("blog:publish");

  if (!hasPermission && (!isOwner || blog.status !== EntityStatus.APPROVED)) {
    throw new HttpError(403, "FORBIDDEN", "You do not have permission to publish this blog");
  }

  const validStatuses = [EntityStatus.APPROVED, EntityStatus.PENDING_REVIEW];
  if (!validStatuses.includes(blog.status as any)) {
    throw new HttpError(403, "INVALID_STATE", "Blog must be approved or in review to be published");
  }

  const updated = await prisma.blog.update({
    where: { id },
    data: { status: EntityStatus.PUBLISHED },
  });

  await auditService.logAudit({
    actorId: user.id,
    action: "BLOG_PUBLISHED",
    targetType: "BLOG",
    targetId: blog.id,
  });

  return ApiResponse.success(res, updated, "Blog published successfully");
});
