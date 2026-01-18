import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { auditService } from "../../services/audit.service";

/**
 * Approve Blog
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function approveBlog(req: Request, res: Response) {
  const { id } = req.params;
  const user = req.user!;

  const blog = await prisma.blog.findUnique({ where: { id } });

  if (!blog) {
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.BLOG_NOT_FOUND);
  }

  if (blog.status !== "PENDING_REVIEW") {
    throw new HttpError(403, "INVALID_STATE", "Only blogs in review can be approved");
  }

  const updated = await prisma.blog.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  await auditService.logAudit({
    actorId: user.id,
    action: "BLOG_APPROVED",
    targetType: "BLOG",
    targetId: blog.id,
  });

  res.json(updated);
}
