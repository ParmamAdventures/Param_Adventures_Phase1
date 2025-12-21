import { Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { AuthRequest } from "../../middlewares/auth.middleware";

export async function getBlogById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const user = req.user;

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
    throw new HttpError(404, "NOT_FOUND", "Blog not found");
  }

  // Check if user is author OR has admin permission
  const isAuthor = blog.authorId === user?.id;
  const isAdmin = user?.permissions.includes("blog:approve");

  if (!isAuthor && !isAdmin) {
    throw new HttpError(403, "FORBIDDEN", "You do not have permission to view this blog");
  }

  res.json(blog);
}
