import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { slugify } from "../../utils/slugify";
import { auditService } from "../../services/audit.service";
import { sanitizeHtml } from "../../utils/sanitize";
import { ErrorMessages } from "../../constants/errorMessages";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { EntityStatus } from "../../constants/status";

/**
 * Update Blog
 */
export const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const { title, content, excerpt, tripId, coverImageId } = req.body;

  const blog = await prisma.blog.findUnique({ where: { id } });

  if (!blog || blog.authorId !== user.id) {
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.BLOG_NOT_FOUND);
  }

  const updateData: Prisma.BlogUncheckedUpdateInput = {
    title,
    content: content ? (sanitizeHtml(content) as unknown as Prisma.InputJsonValue) : undefined,
    excerpt,
    tripId,
    coverImageId,
    updatedAt: new Date(),
  };

  // If editing an approved or published blog, revert to pending review
  if (blog.status === EntityStatus.APPROVED || blog.status === EntityStatus.PUBLISHED) {
    updateData.status = EntityStatus.PENDING_REVIEW;
  }

  if (title && title !== blog.title) {
    updateData.slug = slugify(title);
  }

  const updated = await prisma.blog.update({
    where: { id },
    data: updateData,
  });

  await auditService.logAudit({
    actorId: user.id,
    action: "BLOG_UPDATED",
    targetType: "BLOG",
    targetId: blog.id,
  });

  return ApiResponse.success(res, updated, "Blog updated successfully");
});
