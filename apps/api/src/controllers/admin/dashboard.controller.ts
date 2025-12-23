import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function getDashboardStats(req: Request, res: Response) {
  try {
    const [
      pendingBlogs,
      totalUsers,
      activeTrips,
      recentActivity
    ] = await prisma.$transaction([
      // 1. Pending Blogs
      prisma.blog.count({
        where: { status: "PENDING_REVIEW" }
      }),
      // 2. Active Users
      prisma.user.count({ 
        where: { status: "ACTIVE" } 
      }),
      // 3. Active/Published Trips
      prisma.trip.count({
        where: { status: "PUBLISHED" }
      }),
      // 4. Recent Audit Logs (Activity Stream)
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        // Select only necessary fields for speed
        select: {
            id: true,
            action: true,
            // actorName: true, // Not in schema, removing to fix lint
            createdAt: true,
            targetType: true
        }
      })
    ]);

    res.json({
      counts: {
        pendingBlogs,
        totalUsers,
        activeTrips
      },
      recentActivity
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
}
