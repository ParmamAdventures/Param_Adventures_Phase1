import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";

export const getPublicBlogs = catchAsync(async (req: Request, res: Response) => {
  const { search } = req.query;
  const { page, limit, skip } = req.pagination || { page: 1, limit: 10, skip: 0 };

  const where: any = { status: "PUBLISHED" };

  if (search) {
    where.OR = [
      { title: { search: String(search).split(" ").join(" & ") } },
      { excerpt: { search: String(search).split(" ").join(" & ") } },
    ];
  }

  const [total, blogs] = await prisma.$transaction([
    prisma.blog.count({ where }),
    prisma.blog.findMany({
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
      skip,
      take: limit,
    }),
  ]);

  return ApiResponse.success(
    res,
    {
      blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    "Blogs fetched successfully",
  );
});
