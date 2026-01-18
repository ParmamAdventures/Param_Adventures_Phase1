import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";

/**
 * Get Blog By Id
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function getBlogById(req: Request, res: Response) {
  const { id } = req.params;
  // Assuming req.user is added by a middleware like requireAuth
  // and Request type is augmented or casted elsewhere if not using AuthRequest directly.
  // For this change, we'll assume req.user is available on Request after middleware.
  const user = (req as any).user;

  const blog = await prisma.blog.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
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

  // Check if user is author OR has admin permission
  const isAuthor = blog.authorId === user?.id;
  const isAdmin = user?.permissions.includes("blog:approve");

  if (!isAuthor && !isAdmin) {
    throw new HttpError(403, "FORBIDDEN", "You do not have permission to view this blog");
  }

  res.json(blog);
}
