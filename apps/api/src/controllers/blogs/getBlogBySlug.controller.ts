import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";

/**
 * Get Blog By Slug
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function getBlogBySlug(req: Request, res: Response) {
  const { slug } = req.params;
  const user = req.user; // Types verified in express.d.ts
  const permissions = req.permissions || [];

  const canViewInternal =
    permissions.includes("blog:approve") || permissions.includes("blog:view:internal");

  const whereCondition: any = { slug };

  if (!canViewInternal) {
    if (user) {
      // Allow if PUBLISHED or if the user is the author
      whereCondition.OR = [{ status: "PUBLISHED" }, { authorId: user.id }];
    } else {
      whereCondition.status = "PUBLISHED";
    }
  }

  const blog = await prisma.blog.findFirst({
    // where: whereCondition,
    where: whereCondition,
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      coverImage: true,
      trip: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  if (!blog) {
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.BLOG_NOT_FOUND);
  }

  res.json(blog);
}
