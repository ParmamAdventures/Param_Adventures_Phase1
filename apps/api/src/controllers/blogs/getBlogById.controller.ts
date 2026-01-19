import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { ApiResponse } from "../../utils/ApiResponse";
import { ErrorMessages } from "../../constants/errorMessages";
import { catchAsync } from "../../utils/catchAsync";

/**
 * Get Blog By Id
 */
export const getBlogById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;

  const blog = await prisma.blog.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
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
    throw new HttpError(404, "NOT_FOUND", ErrorMessages.BLOG_NOT_FOUND);
  }

  // Check if user is author OR has admin permission
  const isAuthor = blog.authorId === user?.id;
  const isAdmin = user?.permissions?.includes("blog:approve");

  if (!isAuthor && !isAdmin) {
    throw new HttpError(403, "FORBIDDEN", "You do not have permission to view this blog");
  }

  return ApiResponse.success(res, blog, "Blog details retrieved");
});
