import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

/**
 * List Media
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function listMedia(req: Request, res: Response) {
  const { type, page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const where: any = {};
    if (type && type !== "ALL") {
      where.type = type;
    }

    const [mediaItems, total] = await Promise.all([
      prisma.image.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
        include: {
          _count: {
            select: {
              tripsCover: true,
              blogsCover: true,
              userAvatar: true,
              tripsGallery: true,
            },
          },
        },
      }),
      prisma.image.count({ where }),
    ]);

    const media = mediaItems.map((item) => ({
      ...item,
      usage: {
        trips: item._count.tripsCover + item._count.tripsGallery,
        blogs: item._count.blogsCover,
        users: item._count.userAvatar,
      },
    }));

    res.json({
      media,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Failed to list media", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Delete Media
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function deleteMedia(req: Request, res: Response) {
  const { id } = req.params;
  try {
    // 1. Delete from DB first to get the URLs for disk cleanup
    const media = await prisma.image.delete({
      where: { id },
    });

    // 2. Delete actual files from disk
    const path = await import("path");
    const fs = await import("fs/promises");

    // Helper to extract relative path and delete
    const deleteFile = async (url: string) => {
      if (url && url.startsWith("/uploads/")) {
        // url starts with /uploads, so we join with process.cwd()
        // /uploads/original/uuid.webp -> C:/.../apps/api/uploads/original/uuid.webp
        const fullPath = path.join(process.cwd(), url);
        try {
          await fs.unlink(fullPath);
        } catch (err) {
          // If file not found, ignore (it might have been deleted manually)
          console.warn(`[MediaCleanup] File not found or couldn't unlink: ${fullPath}`);
        }
      }
    };

    // Run unlinks in background (settled so one failure doesn't block others)
    await Promise.allSettled([
      deleteFile(media.originalUrl),
      deleteFile(media.mediumUrl),
      deleteFile(media.thumbUrl),
    ]);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Delete media error:", error);
    if (error.code === "P2003") {
      return res.status(400).json({
        error: "Cannot delete media because it is being used by other records (Trips/Blogs/Users).",
      });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Media not found." });
    }
    res.status(500).json({ error: "Failed to delete media" });
  }
}
