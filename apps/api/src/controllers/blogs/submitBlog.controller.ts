import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { auditService } from "../../services/audit.service";

export async function submitBlog(req: Request, res: Response) {
  const { id } = req.params;
  const user = req.user!;

  const blog = await prisma.blog.findUnique({ where: { id } });

  if (!blog || blog.authorId !== user.id) {
    throw new HttpError(404, "NOT_FOUND", "Blog not found");
  }

  if (blog.status !== "DRAFT" && blog.status !== "REJECTED") {
    throw new HttpError(403, "INVALID_STATE", "Cannot submit blog in its current state");
  }

  const updated = await prisma.blog.update({
    where: { id },
    data: { status: "PENDING_REVIEW" },
  });

  await auditService.logAudit({
    actorId: user.id,
    action: "BLOG_SUBMITTED",
    targetType: "BLOG",
    targetId: blog.id,
  });

  res.json(updated);
}
