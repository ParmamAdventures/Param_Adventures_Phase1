import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function getPublicBlogs(req: Request, res: Response) {
  const blogs = await prisma.blog.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      coverImage: true,
    },
  });

  res.json(blogs);
}
