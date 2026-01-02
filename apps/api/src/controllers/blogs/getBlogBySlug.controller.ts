import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";

export async function getBlogBySlug(req: Request, res: Response) {
  const { slug } = req.params;
  const user = (req as any).user;
  const permissions = (req as any).permissions || [];

  const canViewInternal = permissions.includes("blog:approve") || permissions.includes("blog:view:internal");

  console.log(`[getBlogBySlug] Request for slug: ${slug}`);
  console.log(`[getBlogBySlug] User: ${user?.id} (CanViewInternal: ${canViewInternal})`);

  const whereCondition: any = { slug };
  
  if (!canViewInternal) {
    if (user) {
      // Allow if PUBLISHED or if the user is the author
      whereCondition.OR = [
        { status: "PUBLISHED" },
        { authorId: user.id }
      ];
    } else {
      whereCondition.status = "PUBLISHED";
    }
  }

  console.log(`[getBlogBySlug] Query: ${JSON.stringify(whereCondition)}`);

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
    throw new HttpError(404, "NOT_FOUND", "Blog not found");
  }

  res.json(blog);
}
