import { prisma } from "../lib/prisma";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";
import { RazorpayWebhookEvent, isPaymentEvent } from "../types/razorpay.types";

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

    // Monthly data for chart (Last 6 months) - parallelized
    const monthQueries = Array.from({ length: 6 }, (_, idx) => {
      const i = 5 - idx;
      const date = subMonths(now, i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      return {
        date,
        promise: prisma.payment.aggregate({
          where: {
            status: "CAPTURED",
            createdAt: { gte: start, lte: end },
          },
          _sum: { amount: true },
        }),
      };
    });

    const results = await Promise.all(monthQueries.map((q) => q.promise));
    const last6Months = results.map((monthRev, idx) => {
      const date = monthQueries[idx].date;
      return {
        month: date.toLocaleString("default", { month: "short", year: "2-digit" }),
        revenue: (monthRev._sum.amount || 0) / 100,
      };
    });

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
  async getPaymentStats() {
    const [total, captured, failed, refunded, refundAmountInfo] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: "CAPTURED" } }),
      prisma.payment.findMany({
        where: { status: "FAILED" },
        select: { rawPayload: true },
      }),
      prisma.payment.count({ where: { status: "REFUNDED" } }),
      prisma.payment.aggregate({
        where: { status: "REFUNDED" },
        _sum: { amount: true },
      }),
    ]);

    const successRate = total > 0 ? (captured / total) * 100 : 0;

    // Aggregating failure reasons
    const reasonCounts: Record<string, number> = {};
    failed.forEach((p) => {
      let reason = "Unknown";
      if (p.rawPayload && typeof p.rawPayload === "object") {
        const payload = p.rawPayload as unknown as RazorpayWebhookEvent;
        if (isPaymentEvent(payload)) {
          // Razorpay error structure in webhook payload usually: payload.payment.entity.error_description
          // or sometimes top level error field depending on webhook type
          const entity = payload.payload?.payment?.entity;
          if (entity?.error_description) {
            reason = entity.error_description;
          } else if (entity?.error_code) {
            reason = entity.error_code;
          }
        }
      }
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    const topFailureReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalTransactions: total,
      successRate: parseFloat(successRate.toFixed(2)),
      refunds: {
        count: refunded,
        totalAmount: (refundAmountInfo._sum.amount || 0) / 100,
      },
      breakdown: {
        captured,
        failed: failed.length,
        refunded,
      },
      topFailureReasons,
    };
  }
}

export const analyticsService = new AnalyticsService();
