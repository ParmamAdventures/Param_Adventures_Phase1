import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";
import { auditService } from "../../services/audit.service";

/**
 * Reject Blog
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function rejectBlog(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { reason } = req.body || {}; // Safely destructure with fallback

    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      throw new HttpError(404, "NOT_FOUND", "Blog not found");
    }

    if (blog.status !== "PENDING_REVIEW") {
      throw new HttpError(403, "INVALID_STATE", "Only blogs in review can be rejected");
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    await auditService.logAudit({
      actorId: user.id,
      action: "BLOG_REJECTED",
      targetType: "BLOG",
      targetId: blog.id,
      metadata: { reason },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error rejecting blog:", error);
    throw error;
  }
}
