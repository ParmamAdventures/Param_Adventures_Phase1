import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { auditService } from "../../services/audit.service";

/**
 * Publish Blog
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function publishBlog(req: Request, res: Response) {
  const { id } = req.params;
  const user = req.user!;

  const blog = await prisma.blog.findUnique({ where: { id } });

  if (!blog) {
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.BLOG_NOT_FOUND);
  }

  const permissions = req.permissions || [];
  const isOwner = blog.authorId === user.id;
  const hasPermission = permissions.includes("blog:publish");

  // Logic: 
  // 1. Admin/Moderator with 'blog:publish' can publish from APPROVED or PENDING_REVIEW (bypass).
  // 2. Owner can publish ONLY if status is 'APPROVED'.

  if (!hasPermission && (!isOwner || blog.status !== "APPROVED")) {
     throw new HttpError(403, "FORBIDDEN", "You do not have permission to publish this blog");
  }

  // Allow publishing from APPROVED or directly from PENDING_REVIEW if the admin wants to skip
  const validStatuses = ["APPROVED", "PENDING_REVIEW"];
  if (!validStatuses.includes(blog.status)) {
    throw new HttpError(403, "INVALID_STATE", "Blog must be approved or in review to be published");
  }

  const updated = await prisma.blog.update({
    where: { id },
    data: { status: "PUBLISHED" },
  });

  await auditService.logAudit({
    actorId: user.id,
    action: "BLOG_PUBLISHED",
    targetType: "BLOG",
    targetId: blog.id,
  });

  res.json(updated);
}
