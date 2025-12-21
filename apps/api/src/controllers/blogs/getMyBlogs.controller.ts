import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { prisma } from "../../lib/prisma";

export async function getMyBlogs(req: AuthRequest, res: Response) {
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
