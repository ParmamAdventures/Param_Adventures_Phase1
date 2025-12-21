import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

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
