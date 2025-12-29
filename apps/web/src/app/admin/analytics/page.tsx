"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";

interface RevenueData {
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  growthPercentage: number;
  potentialRevenue: number;
  monthlyChart: Array<{ month: string, revenue: number }>;
}

interface AnalyticsStats {
  total: number;
  confirmed: number;
  cancelled: number;
  currentMonthCount: number;
  successRate: number;
}

export default function AnalyticsPage() {
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Spinner size={40} /></div>;

  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-2">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Revenue <span className="text-[var(--accent)]">Analytics</span></h1>
        <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest opacity-60">System performance and financial metrics</p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[40px] bg-[var(--card)]/50 border border-[var(--border)] backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Current Month Revenue</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter">₹{(revenue?.currentMonthRevenue || 0).toLocaleString()}</span>
            <span className={`text-xs font-bold ${revenue?.growthPercentage && revenue.growthPercentage >= 0 ? 'text-[var(--accent)]' : 'text-red-500'}`}>
              {revenue?.growthPercentage && revenue.growthPercentage >= 0 ? '+' : ''}{revenue?.growthPercentage || 0}%
            </span>
          </div>
        </div>
        <div className="p-8 rounded-[40px] bg-[var(--card)]/50 border border-[var(--border)] backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Confirmed Bookings</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter">{stats?.confirmed || 0}</span>
            <span className="text-xs font-bold text-[var(--accent)]">+{stats?.currentMonthCount || 0} new</span>
          </div>
        </div>
        <div className="p-8 rounded-[40px] bg-[var(--card)]/50 border border-[var(--border)] backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Success Rate</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter">{stats?.successRate || 0}%</span>
            <span className="text-xs font-bold text-[var(--accent)]">{stats?.successRate && stats.successRate > 90 ? 'High' : 'Optimal'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-8 p-10 rounded-[48px] bg-[var(--card)]/50 border border-[var(--border)] backdrop-blur-2xl space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-tight italic">Monthly Growth</h3>
            <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--accent)]"></div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Revenue (INR)</span>
            </div>
          </div>
          
          <div className="h-64 flex items-end gap-4 px-2">
            {revenue?.monthlyChart?.map((item: any, i: number) => {
              const max = Math.max(...revenue.monthlyChart.map(m => m.revenue), 1);
              const height = (item.revenue / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="relative w-full">
                    <div 
                      className="w-full bg-gradient-to-t from-[var(--accent)] to-[var(--accent)]/40 rounded-t-2xl transition-all duration-700 group-hover:from-[var(--accent)] group-hover:to-[var(--accent)] shadow-xl shadow-[var(--accent)]/10"
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--card)] border border-[var(--border)] px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
                        <span className="text-[10px] font-black italic">₹{item.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="lg:col-span-4 p-10 rounded-[48px] bg-[var(--card)]/50 border border-[var(--border)] backdrop-blur-2xl space-y-8">
           <h3 className="text-xl font-black uppercase tracking-tight italic">Financial Health</h3>
           <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[var(--accent)]/5 border border-[var(--accent)]/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Potential Revenue</p>
                <p className="text-2xl font-black tracking-tighter">₹{(revenue?.potentialRevenue || 0).toLocaleString()}</p>
                <div className="mt-4 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--accent)]" 
                    style={{ width: `${revenue?.potentialRevenue ? ((revenue.currentMonthRevenue / (revenue.potentialRevenue / 12)) * 100) : 0}%` }}
                  />
                </div>
                <p className="text-[8px] font-bold uppercase mt-2 opacity-40">Target Realization Rate</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center">
                   <p className="text-[8px] font-black uppercase opacity-40">Confirmed</p>
                   <p className="text-lg font-black">{stats?.confirmed || 0}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-center">
                   <p className="text-[8px] font-black uppercase opacity-40">Cancelled</p>
                   <p className="text-lg font-black text-red-500">{stats?.cancelled || 0}</p>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Trip performance Table */}
      <div className="p-10 rounded-[48px] bg-[var(--card)]/50 border border-[var(--border)] backdrop-blur-2xl space-y-8">
        <h3 className="text-xl font-black uppercase tracking-tight italic">Trip Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">Expedition</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">Bookings</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-4">Revenue</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right px-4">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {trips.map((trip) => (
                <tr key={trip.id} className="group hover:bg-[var(--border)]/10 transition-colors">
                  <td className="py-6 px-4">
                    <span className="text-sm font-black italic uppercase tracking-tight">{trip.title}</span>
                  </td>
                  <td className="py-6 px-4">
                    <span className="text-sm font-bold opacity-60">{trip.bookingCount} units</span>
                  </td>
                  <td className="py-6 px-4">
                    <span className="text-sm font-black text-[var(--accent)]">₹{trip.revenue.toLocaleString()}</span>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                      trip.impact === 'High' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' :
                      trip.impact === 'Medium' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
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

