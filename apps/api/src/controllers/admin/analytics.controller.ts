import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export async function getRevenueSummary(req: Request, res: Response) {
  try {
    const payments = await prisma.payment.findMany({
      where: { status: "CAPTURED" },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Group by month
    const monthlyData: Record<string, number> = {};
    payments.forEach((p) => {
      const month = p.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + p.amount / 100; // Convert to INR
    });

    const categories = Object.keys(monthlyData).sort();
    const data = categories.map((month) => monthlyData[month]);

    const totalRevenue = payments.reduce((acc, p) => acc + p.amount / 100, 0);

    res.json({
      totalRevenue,
      monthly: {
        categories,
        data,
      },
    });
  } catch (error) {
    console.error("Failed to fetch revenue summary", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getTripPerformance(req: Request, res: Response) {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        bookings: {
          include: {
            payments: {
              where: { status: "CAPTURED" }
            }
          }
        }
      }
    });

    const performance = trips.map((trip) => {
      const bookingCount = trip.bookings.length;
      const revenue = trip.bookings.reduce((sum, booking) => {
        return sum + booking.payments.reduce((pSum, p) => pSum + p.amount / 100, 0);
      }, 0);

      return {
        id: trip.id,
        title: trip.title,
        bookingCount,
        revenue,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    res.json(performance);
  } catch (error) {
    console.error("Failed to fetch trip performance", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getBookingStats(req: Request, res: Response) {
  try {
    const stats = await prisma.booking.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    });

    const paymentStats = await prisma.payment.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    });

    res.json({
      bookings: stats.reduce((acc: any, s) => {
        acc[s.status] = s._count._all;
        return acc;
      }, {}),
      payments: paymentStats.reduce((acc: any, s) => {
        acc[s.status] = s._count._all;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error("Failed to fetch booking stats", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getModerationSummary(req: Request, res: Response) {
  try {
    const [pendingTrips, pendingBlogs] = await Promise.all([
      prisma.trip.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.blog.count({ where: { status: "PENDING_REVIEW" } }),
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
