import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function getPublicBlogs(req: Request, res: Response) {
  const { search } = req.query;
  
  const where: any = { status: "PUBLISHED" };
  
  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: "insensitive" } },
      { excerpt: { contains: String(search), mode: "insensitive" } },
    ];
  }

  const blogs = await prisma.blog.findMany({
    where,
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
