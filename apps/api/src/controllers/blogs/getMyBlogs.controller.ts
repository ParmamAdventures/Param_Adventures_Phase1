import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

/**
 * Get My Blogs
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function getMyBlogs(req: Request, res: Response) {
  const blogs = await prisma.blog.findMany({
    where: { authorId: req.user!.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      slug: true,
      createdAt: true,
      excerpt: true,
    },
  });

  res.json(blogs);
}
