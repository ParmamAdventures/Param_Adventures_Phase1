import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

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
                }
            }
        }
      }),
      prisma.image.count({ where }),
    ]);

    const media = mediaItems.map(item => ({
        ...item,
        usage: {
            trips: item._count.tripsCover + item._count.tripsGallery,
            blogs: item._count.blogsCover,
            users: item._count.userAvatar
        }
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

export async function deleteMedia(req: Request, res: Response) {
    const { id } = req.params;
    try {
        await prisma.image.delete({
            where: { id }
        });
        // TODO: Delete actual file from disk to save space
        res.json({ success: true });
    } catch (error: any) {
        console.error("Delete media error:", error);
        if (error.code === 'P2003') {
            return res.status(400).json({ error: "Cannot delete media because it is being used by other records (Trips/Blogs/Users)." });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Media not found." });
        }
        res.status(500).json({ error: "Failed to delete media" });
    }
}
