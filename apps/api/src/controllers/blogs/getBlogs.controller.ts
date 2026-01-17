import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

/**
 * Get Blogs
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function getBlogs(req: Request, res: Response) {
  const { status } = req.query;

  const blogs = await prisma.blog.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      coverImage: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(blogs);
}
