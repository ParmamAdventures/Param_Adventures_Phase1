import { Request, Response } from "express";
import { analyticsService } from "../../services/analytics.service";

export async function getRevenueSummary(req: Request, res: Response) {
  try {
    const stats = await analyticsService.getRevenueStats();
    res.json(stats);
  } catch (error) {
    console.error("Failed to fetch revenue summary", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getTripPerformance(req: Request, res: Response) {
  try {
    const performance = await analyticsService.getTripPerformance();
    res.json(performance);
  } catch (error) {
    console.error("Failed to fetch trip performance", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getBookingStats(req: Request, res: Response) {
  try {
    const stats = await analyticsService.getBookingStats();
    res.json(stats);
  } catch (error) {
    console.error("Failed to fetch booking stats", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getModerationSummary(req: Request, res: Response) {
  // Keeping this simple/direct as it's just counts
  try {
    const [pendingTrips, pendingBlogs] = await Promise.all([
      import("../../lib/prisma").then(m => m.prisma.trip.count({ where: { status: "PENDING_REVIEW" } })),
      import("../../lib/prisma").then(m => m.prisma.blog.count({ where: { status: "PENDING_REVIEW" } })),
    ]);

    res.json({
      pendingTrips,
      pendingBlogs,
      totalPending: pendingTrips + pendingBlogs,
    });
  } catch (error) {
    console.error("Failed to fetch moderation summary", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

