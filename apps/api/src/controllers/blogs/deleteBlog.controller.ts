import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { ApiResponse } from "../../utils/ApiResponse";
import { ErrorMessages } from "../../constants/errorMessages";

export const deleteBlog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const permissions = req.permissions || [];

  const blog = await prisma.blog.findUnique({
    where: { id },
  });

  if (!blog) {
    return ApiResponse.error(res, "BLOG_NOT_FOUND", ErrorMessages.BLOG_NOT_FOUND, 404);
  }

  // Check permissions: Admin can delete any, Owner can delete their own
  const isAdmin = permissions.includes("blog:delete"); // Assuming this permission exists or covers generic delete
  const isOwner = blog.authorId === user.id;

  if (!isAdmin && !isOwner) {
    return ApiResponse.error(res, "FORBIDDEN", ErrorMessages.INSUFFICIENT_PERMISSIONS, 403);
  }

  // Soft delete or hard delete? Usually hard delete for simple content, or soft if required.
  // Let's assume hard delete for now as per other controllers, or check schema.
  // Schema likely supports hard delete for blogs if not critical data.

  await prisma.blog.delete({
    where: { id },
  });

  return ApiResponse.success(res, null, "Blog deleted successfully");
};
