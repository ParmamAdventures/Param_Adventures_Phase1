"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import type { Trip } from "@/types/trip";

interface RevenueData {
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  growthPercentage: number;
  potentialRevenue: number;
  monthlyChart: Array<{ month: string; revenue: number }>;
}

interface AnalyticsStats {
  total: number;
  confirmed: number;
  cancelled: number;
  currentMonthCount: number;
  successRate: number;
}

interface TripAnalytics extends Trip {
  bookingCount: number;
  revenue: number;
  impact: "High" | "Medium" | "Low";
}

export default function AnalyticsPage() {
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [trips, setTrips] = useState<TripAnalytics[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [revRes, tripRes, statRes] = await Promise.all([
          apiFetch("/admin/analytics/revenue"),
          apiFetch("/admin/analytics/trips"),
          apiFetch("/admin/analytics/bookings"),
        ]);

        if (revRes.ok) setRevenue(await revRes.json());
        if (tripRes.ok) setTrips(await tripRes.json());
        if (statRes.ok) setStats(await statRes.json());
      } catch (e) {
        console.error("Failed to load analytics", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading)
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size={40} />
      </div>
    );

  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">
          Revenue <span className="text-[var(--accent)]">Analytics</span>
        </h1>
        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase opacity-60">
          System performance and financial metrics
        </p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[40px] border border-[var(--border)] bg-[var(--card)]/50 p-8 backdrop-blur-xl">
          <p className="text-muted-foreground mb-4 text-[10px] font-black tracking-[0.2em] uppercase">
            Current Month Revenue
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter">
              ₹{(revenue?.currentMonthRevenue || 0).toLocaleString()}
            </span>
            <span
              className={`text-xs font-bold ${revenue?.growthPercentage && revenue.growthPercentage >= 0 ? "text-[var(--accent)]" : "text-red-500"}`}
            >
              {revenue?.growthPercentage && revenue.growthPercentage >= 0 ? "+" : ""}
              {revenue?.growthPercentage || 0}%
            </span>
          </div>
        </div>
        <div className="rounded-[40px] border border-[var(--border)] bg-[var(--card)]/50 p-8 backdrop-blur-xl">
          <p className="text-muted-foreground mb-4 text-[10px] font-black tracking-[0.2em] uppercase">
            Confirmed Bookings
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter">{stats?.confirmed || 0}</span>
            <span className="text-xs font-bold text-[var(--accent)]">
              +{stats?.currentMonthCount || 0} new
            </span>
          </div>
        </div>
        <div className="rounded-[40px] border border-[var(--border)] bg-[var(--card)]/50 p-8 backdrop-blur-xl">
          <p className="text-muted-foreground mb-4 text-[10px] font-black tracking-[0.2em] uppercase">
            Success Rate
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter">{stats?.successRate || 0}%</span>
            <span className="text-xs font-bold text-[var(--accent)]">
              {stats?.successRate && stats.successRate > 90 ? "High" : "Optimal"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Revenue Chart */}
        <div className="space-y-8 rounded-[48px] border border-[var(--border)] bg-[var(--card)]/50 p-10 backdrop-blur-2xl lg:col-span-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight uppercase italic">Monthly Growth</h3>
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-[var(--accent)]"></div>
              <span className="text-[10px] font-black tracking-widest uppercase opacity-50">
                Revenue (INR)
              </span>
            </div>
          </div>

          <div className="flex h-64 items-end gap-4 px-2">
            {revenue?.monthlyChart?.map((item: { month: string; revenue: number }, i: number) => {
              const max = Math.max(...revenue.monthlyChart.map((m) => m.revenue), 1);
              const height = (item.revenue / max) * 100;
              return (
                <div key={i} className="group flex flex-1 flex-col items-center gap-4">
                  <div className="relative w-full">
                    <div
                      className="w-full rounded-t-2xl bg-gradient-to-t from-[var(--accent)] to-[var(--accent)]/40 shadow-[var(--accent)]/10 shadow-xl transition-all duration-700 group-hover:from-[var(--accent)] group-hover:to-[var(--accent)]"
                      style={{ height: `${height}%` }}
                    />
                    <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 opacity-0 shadow-2xl transition-opacity group-hover:opacity-100">
                      <span className="text-[10px] font-black italic">
                        ₹{item.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black tracking-tighter uppercase opacity-40">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-8 rounded-[48px] border border-[var(--border)] bg-[var(--card)]/50 p-10 backdrop-blur-2xl lg:col-span-4">
          <h3 className="text-xl font-black tracking-tight uppercase italic">Financial Health</h3>
          <div className="space-y-6">
            <div className="rounded-3xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-6">
              <p className="text-muted-foreground mb-2 text-[10px] font-black tracking-widest uppercase">
                Potential Revenue
              </p>
              <p className="text-2xl font-black tracking-tighter">
                ₹{(revenue?.potentialRevenue || 0).toLocaleString()}
              </p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                <div
                  className="h-full bg-[var(--accent)]"
                  style={{
                    width: `${revenue?.potentialRevenue ? (revenue.currentMonthRevenue / (revenue.potentialRevenue / 12)) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-[8px] font-bold uppercase opacity-40">
                Target Realization Rate
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
                <p className="text-[8px] font-black uppercase opacity-40">Confirmed</p>
                <p className="text-lg font-black">{stats?.confirmed || 0}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
                <p className="text-[8px] font-black uppercase opacity-40">Cancelled</p>
                <p className="text-lg font-black text-red-500">{stats?.cancelled || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trip performance Table */}
      <div className="space-y-8 rounded-[48px] border border-[var(--border)] bg-[var(--card)]/50 p-10 backdrop-blur-2xl">
        <h3 className="text-xl font-black tracking-tight uppercase italic">Trip Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-muted-foreground px-4 pb-4 text-[10px] font-black tracking-[0.2em] uppercase">
                  Expedition
                </th>
                <th className="text-muted-foreground px-4 pb-4 text-[10px] font-black tracking-[0.2em] uppercase">
                  Bookings
                </th>
                <th className="text-muted-foreground px-4 pb-4 text-[10px] font-black tracking-[0.2em] uppercase">
                  Revenue
                </th>
                <th className="text-muted-foreground px-4 pb-4 text-right text-[10px] font-black tracking-[0.2em] uppercase">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {trips.map((trip) => (
                <tr key={trip.id} className="group transition-colors hover:bg-[var(--border)]/10">
                  <td className="px-4 py-6">
                    <span className="text-sm font-black tracking-tight uppercase italic">
                      {trip.title}
                    </span>
                  </td>
                  <td className="px-4 py-6">
                    <span className="text-sm font-bold opacity-60">{trip.bookingCount} units</span>
                  </td>
                  <td className="px-4 py-6">
                    <span className="text-sm font-black text-[var(--accent)]">
                      ₹{trip.revenue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-6 text-right">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase ${
                        trip.impact === "High"
                          ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                          : trip.impact === "Medium"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {trip.impact} Impact
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
