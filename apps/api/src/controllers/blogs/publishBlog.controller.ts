import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { auditService } from "../../services/audit.service";

export async function publishBlog(req: Request, res: Response) {
  const { id } = req.params;
  const user = req.user!;

  const blog = await prisma.blog.findUnique({ where: { id } });

  if (!blog) {
    throw new HttpError(404, "NOT_FOUND", "Blog not found");
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
