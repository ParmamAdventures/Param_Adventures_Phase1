import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { analyticsService } from "../../services/analytics.service";

/**
 * Get Dashboard Stats
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function getDashboardStats(req: Request, res: Response) {
  try {
    const data = await prisma
      .$transaction([
        // 1. Pending Blogs
        prisma.blog.count({
          where: { status: "PENDING_REVIEW" },
        }),
        // 2. Active Users
        prisma.user.count({
          where: { status: "ACTIVE" },
        }),
        // 3. Active/Published Trips
        prisma.trip.count({
          where: { status: "PUBLISHED" },
        }),
        // 4. Recent Audit Logs (Activity Stream)
        prisma.auditLog.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          // Select only necessary fields for speed
          select: {
            id: true,
            action: true,
            createdAt: true,
            targetType: true,
          },
        }),
      ])
      .then(async ([pendingBlogs, totalUsers, activeTrips, recentActivity]) => {
        const revenueStats = await analyticsService.getRevenueStats();
        return {
          pendingBlogs,
          totalUsers,
          activeTrips,
          recentActivity,
          revenueStats,
        };
      });

    res.json({
      counts: {
        pendingBlogs: data.pendingBlogs,
        totalUsers: data.totalUsers,
        activeTrips: data.activeTrips,
        monthlyRevenue: data.revenueStats.currentMonthRevenue,
      },
      recentActivity: data.recentActivity,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
}
