import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { auditService } from "../../services/audit.service";

export async function approveBlog(req: Request, res: Response) {
  const { id } = req.params;
  const user = (req as any).user;

  const blog = await prisma.blog.findUnique({ where: { id } });

  if (!blog) {
    throw new HttpError(404, "NOT_FOUND", "Blog not found");
  }

  if (blog.status !== "PENDING_REVIEW") {
    throw new HttpError(403, "INVALID_STATE", "Only blogs in review can be approved");
  }

  const updated = await prisma.blog.update({
    where: { id },
    data: { status: "PUBLISHED" },
  });

  await auditService.logAudit({
    actorId: user.id,
    action: "BLOG_APPROVED",
    targetType: "BLOG",
    targetId: blog.id,
  });

  res.json(updated);
}
