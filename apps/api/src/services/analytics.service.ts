import { prisma } from "../lib/prisma";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";

export class AnalyticsService {
  async getRevenueStats() {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));

    const [currentMonthRevenue, prevMonthRevenue, allCaptured] = await Promise.all([
      // Current Month Captured Revenue
      prisma.payment.aggregate({
        where: {
          status: "CAPTURED",
          createdAt: { gte: currentMonthStart },
        },
        _sum: { amount: true },
      }),
      // Previous Month Captured Revenue
      prisma.payment.aggregate({
        where: {
          status: "CAPTURED",
          createdAt: {
            gte: prevMonthStart,
            lte: prevMonthEnd,
          },
        },
        _sum: { amount: true },
      }),
      // Total Potential Revenue (Confirmed bookings)
      prisma.booking.aggregate({
        where: {
          status: { in: ["CONFIRMED", "REQUESTED"] },
        },
        _sum: { totalPrice: true },
      }),
    ]);

    const currentRev = (currentMonthRevenue._sum.amount || 0) / 100;
    const prevRev = (prevMonthRevenue._sum.amount || 0) / 100;
    const potentialRev = allCaptured._sum.totalPrice || 0;

    let growth = 0;
    if (prevRev > 0) {
      growth = ((currentRev - prevRev) / prevRev) * 100;
    } else if (currentRev > 0) {
      growth = 100;
    }

    // Monthly data for chart (Last 6 months)
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const monthRev = await prisma.payment.aggregate({
        where: {
          status: "CAPTURED",
          createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      last6Months.push({
        month: date.toLocaleString("default", { month: "short", year: "2-digit" }),
        revenue: (monthRev._sum.amount || 0) / 100,
      });
    }

    return {
      currentMonthRevenue: currentRev,
      previousMonthRevenue: prevRev,
      growthPercentage: parseFloat(growth.toFixed(2)),
      potentialRevenue: potentialRev,
      monthlyChart: last6Months,
    };
  }

  async getBookingStats() {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);

    const [total, confirmed, cancelled, currentMonth] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
      prisma.booking.count({ where: { createdAt: { gte: currentMonthStart } } }),
    ]);

    const successRate = total > 0 ? (confirmed / (total - cancelled * 0.5)) * 100 : 0; // Weighing cancellation impact

    return {
      total,
      confirmed,
      cancelled,
      currentMonthCount: currentMonth,
      successRate: parseFloat(Math.min(successRate, 100).toFixed(2)),
    };
  }

  async getTripPerformance() {
    const trips = await prisma.trip.findMany({
      include: {
        bookings: {
          include: {
            payments: {
              where: { status: "CAPTURED" },
            },
          },
        },
      },
    });

    return trips
      .map((trip) => {
        const bookingCount = trip.bookings.length;
        const revenue = trip.bookings.reduce((sum, booking) => {
          return sum + booking.payments.reduce((pSum, p) => pSum + p.amount / 100, 0);
        }, 0);

        let impact = "Low";
        if (revenue > 5000) impact = "High";
        else if (revenue > 1000) impact = "Medium";

        return {
          id: trip.id,
          title: trip.title,
          bookingCount,
          revenue,
          impact,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }
}

export const analyticsService = new AnalyticsService();
