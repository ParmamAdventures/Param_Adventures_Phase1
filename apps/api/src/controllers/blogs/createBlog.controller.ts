import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { slugify } from "../../utils/slugify";
import { auditService } from "../../services/audit.service";
import { sanitizeHtml } from "../../utils/sanitize";

/**
 * Create Blog
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function createBlog(req: Request, res: Response) {
  const { title, content, excerpt, tripId, coverImageId } = req.body;
  const user = (req as any).user;

  const slug = slugify(title);

  if (!tripId) {
    return res.status(400).json({ message: "Blogs must be linked to a completed adventure." });
  }

  if (tripId) {
    const booking = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        tripId: tripId,
        status: "COMPLETED",
      },
    });

    if (!booking) {
      return res
        .status(403)
        .json({ message: "You can only write blogs for trips you have completed." });
    }
  }

  const blog = await prisma.blog.create({
    data: {
      title,
      slug,
      content: sanitizeHtml(content),
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
