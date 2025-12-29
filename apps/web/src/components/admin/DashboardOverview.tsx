"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import Spinner from "../ui/Spinner";
import { motion } from "framer-motion";
import { Plus, CheckSquare, Users, Eye, ArrowRight, Activity, FileText, Map, Settings } from "lucide-react";

interface DashboardStats {
  counts: {
    pendingBlogs: number;
    totalUsers: number;
    activeTrips: number;
    monthlyRevenue: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    targetType: string;
    createdAt: string;
  }>;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await apiFetch("/admin/dashboard/stats");
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner size={40} /></div>;

  const quickActions = [
    { label: "Create Trip", href: "/admin/trips/new", icon: Plus, color: "bg-blue-500" },
    { label: "Review Blogs", href: "/admin/blogs", icon: CheckSquare, color: "bg-emerald-500", badge: stats?.counts.pendingBlogs },
    { label: "Manage Users", href: "/admin/users", icon: Users, color: "bg-violet-500" },
    { label: "View Live Site", href: "/", icon: Eye, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-12 pb-12">
      <header>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Mission <span className="text-[var(--accent)]">Control</span></h1>
        <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest opacity-60 mt-2">Operational Status & Quick Actions</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-[var(--card)]/50 border border-[var(--border)] backdrop-blur-xl flex flex-col justify-between h-40 group hover:border-[var(--accent)]/50 transition-colors">
          <div className="flex justify-between items-start">
             <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                <FileText size={24} />
             </div>
             {stats?.counts.pendingBlogs ? (
                 <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                 </span>
             ) : null}
          </div>
          <div>
            <div className="text-3xl font-black tracking-tighter">{stats?.counts.pendingBlogs}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pending Blogs</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--card)]/50 border border-[var(--border)] backdrop-blur-xl flex flex-col justify-between h-40 group hover:border-[var(--accent)]/50 transition-colors">
          <div className="flex justify-between items-start">
             <div className="p-3 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <Activity size={24} />
             </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tighter">₹{(stats?.counts.monthlyRevenue || 0).toLocaleString()}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monthly Revenue</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--card)]/50 border border-[var(--border)] backdrop-blur-xl flex flex-col justify-between h-40 group hover:border-[var(--accent)]/50 transition-colors">
          <div className="flex justify-between items-start">
             <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                <Users size={24} />
             </div>
             <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tighter">{stats?.counts.totalUsers}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Users</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--card)]/50 border border-[var(--border)] backdrop-blur-xl flex flex-col justify-between h-40 group hover:border-[var(--accent)]/50 transition-colors">
          <div className="flex justify-between items-start">
             <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                <Map size={24} />
             </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tighter">{stats?.counts.activeTrips}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Published Trips</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tight italic flex items-center gap-2">
                <Settings size={20} className="text-[var(--accent)]"/> Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                    <Link key={action.label} href={action.href} className="group relative overflow-hidden p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all hover:shadow-xl hover:shadow-[var(--accent)]/10">
                        <div className={`absolute top-0 right-0 p-20 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${action.color}`} />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`p-4 rounded-2xl text-white shadow-lg ${action.color}`}>
                                <action.icon size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg leading-none mb-1 group-hover:text-[var(--accent)] transition-colors">{action.label}</h3>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider group-hover:translate-x-1 transition-transform">Proceed &rarr;</p>
                            </div>
                            {action.badge ? (
                                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                                    {action.badge}
                                </div>
                            ) : null}
                        </div>
                    </Link>
                ))}
            </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
             <h2 className="text-xl font-black uppercase tracking-tight italic flex items-center gap-2">
                <Activity size={20} className="text-[var(--accent)]"/> Recent Signals
            </h2>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/30 backdrop-blur-sm overflow-hidden">
                {!stats?.recentActivity?.length ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">No recent activity</div>
                ) : (
                    <div className="divide-y divide-[var(--border)]/50">
                        {stats.recentActivity.map((log) => (
                            <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-[var(--border)]/10 transition-colors">
                                <div className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)] shrink-0" />
                                <div>
                                    <p className="text-xs font-bold leading-snug">
                                        <span className="text-[var(--accent)] uppercase">{log.action}</span> on {log.targetType}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                                        {new Date(log.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 <Link href="/admin/audit-logs" className="block p-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-[var(--accent)] hover:bg-[var(--border)]/10 transition-colors">
                    View Full Audit Trail
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}
