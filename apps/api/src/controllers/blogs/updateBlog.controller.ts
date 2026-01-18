import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { slugify } from "../../utils/slugify";
import { auditService } from "../../services/audit.service";

/**
 * Update Blog
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function updateBlog(req: Request, res: Response) {
  const { id } = req.params;
  const user = req.user!;
  const { title, content, excerpt, tripId, coverImageId } = req.body;

  const blog = await prisma.blog.findUnique({ where: { id } });

  if (!blog || blog.authorId !== user.id) {
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.BLOG_NOT_FOUND);
  }

  // if (blog.status === "ARCHIVED") {
  //   throw new HttpError(403, "INVALID_STATE", "Cannot edit archived blogs");
  // }

  const updateData: any = {
    title,
    content,
    excerpt,
    tripId,
    coverImageId,
    updatedAt: new Date(),
  };

  // If editing an approved or published blog, revert to pending review
  if (["APPROVED", "PUBLISHED"].includes(blog.status)) {
    updateData.status = "PENDING_REVIEW";
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

  res.json(updated);
}
