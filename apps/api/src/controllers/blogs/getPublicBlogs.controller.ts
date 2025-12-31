import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const getPublicBlogs = catchAsync(async (req: Request, res: Response) => {
  const { search } = req.query;

  const where: any = { status: "PUBLISHED" };

  if (search) {
    where.OR = [
      { title: { search: String(search).split(" ").join(" & ") } },
      { excerpt: { search: String(search).split(" ").join(" & ") } },
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

  return ApiResponse.success(res, "Blogs fetched", blogs);
});
