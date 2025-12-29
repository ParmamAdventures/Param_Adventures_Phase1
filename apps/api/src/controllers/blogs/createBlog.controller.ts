import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { slugify } from "../../utils/slugify";
import { auditService } from "../../services/audit.service";

export async function createBlog(req: Request, res: Response) {
  const { title, content, excerpt, tripId, coverImageId } = req.body;
  const user = (req as any).user;

  const slug = slugify(title);

  const blog = await prisma.blog.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      tripId,
      coverImageId,
      authorId: user.id,
    },
  });

  await auditService.logAudit({
    actorId: user.id,
    action: "BLOG_CREATED",
    targetType: "BLOG",
    targetId: blog.id,
    metadata: { status: blog.status },
  });

  res.status(201).json(blog);
}
