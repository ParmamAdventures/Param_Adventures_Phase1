import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";

export async function getBlogBySlug(req: Request, res: Response) {
  const { slug } = req.params;
  const user = (req as any).user;
  const permissions = (req as any).permissions || [];

  const canViewInternal = permissions.includes("blog:approve") || permissions.includes("blog:view:internal");

  const whereCondition: any = { slug };
  
  if (!canViewInternal) {
    whereCondition.status = "PUBLISHED";
  }

  const blog = await prisma.blog.findFirst({
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
    throw new HttpError(404, "NOT_FOUND", "Blog not found");
  }

  res.json(blog);
}
