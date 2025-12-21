"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";

export default function AnalyticsPage() {
  const [revenue, setRevenue] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
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
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Total Revenue</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter">₹{(revenue?.totalRevenue || 0).toLocaleString()}</span>
            <span className="text-xs font-bold text-[var(--accent)]">+12%</span>
          </div>
        </div>
        <div className="p-8 rounded-[40px] bg-[var(--card)]/50 border border-[var(--border)] backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Confirmed Bookings</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter">{stats?.bookings?.CONFIRMED || 0}</span>
            <span className="text-xs font-bold text-[var(--accent)]">Active</span>
          </div>
        </div>
        <div className="p-8 rounded-[40px] bg-[var(--card)]/50 border border-[var(--border)] backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Success Rate</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter">94%</span>
            <span className="text-xs font-bold text-[var(--accent)]">High</span>
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
            {revenue?.monthly?.data.map((val: number, i: number) => {
              const max = Math.max(...revenue.monthly.data, 1);
              const height = (val / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="relative w-full">
                    <div 
                      className="w-full bg-gradient-to-t from-[var(--accent)] to-[var(--accent)]/40 rounded-t-2xl transition-all duration-700 group-hover:from-[var(--accent)] group-hover:to-[var(--accent)] shadow-xl shadow-[var(--accent)]/10"
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--card)] border border-[var(--border)] px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
                        <span className="text-[10px] font-black italic">₹{val.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">{revenue.monthly.categories[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="lg:col-span-4 p-10 rounded-[48px] bg-[var(--card)]/50 border border-[var(--border)] backdrop-blur-2xl space-y-8">
           <h3 className="text-xl font-black uppercase tracking-tight italic">Booking Status</h3>
           <div className="space-y-6">
             {Object.entries(stats?.bookings || {}).map(([status, count]: [any, any]) => (
               <div key={status} className="space-y-2">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <span className="opacity-50">{status}</span>
                   <span>{count}</span>
                 </div>
                 <div className="h-2 bg-[var(--border)]/20 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-[var(--accent)]/60 rounded-full" 
                    style={{ width: `${(count / Object.values(stats.bookings).reduce((a: any, b: any) => a + b, 0) as number) * 100}%` }}
                   />
                 </div>
               </div>
             ))}
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
                    <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-[var(--accent)]/10 text-[var(--accent)] px-4 py-1.5 rounded-full">
                       High Impact
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
