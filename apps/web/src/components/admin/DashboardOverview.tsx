"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import Spinner from "../ui/Spinner";
import { motion } from "framer-motion";
import {
  Plus,
  CheckSquare,
  Users,
  Eye,
  ArrowRight,
  Activity,
  FileText,
  Map,
  Settings,
} from "lucide-react";

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

/**
 * DashboardOverview - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size={40} />
      </div>
    );

  const quickActions = [
    { label: "Create Trip", href: "/admin/trips/new", icon: Plus, color: "bg-blue-500" },
    {
      label: "Review Blogs",
      href: "/admin/blogs",
      icon: CheckSquare,
      color: "bg-emerald-500",
      badge: stats?.counts.pendingBlogs,
    },
    { label: "Manage Users", href: "/admin/users", icon: Users, color: "bg-violet-500" },
    { label: "View Live Site", href: "/", icon: Eye, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-12 pb-12">
      <header>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">
          Mission <span className="text-[var(--accent)]">Control</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-xs font-medium tracking-widest uppercase opacity-60">
          Operational Status & Quick Actions
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        <div className="group flex h-40 flex-col justify-between rounded-3xl border border-[var(--border)] bg-[var(--card)]/50 p-6 backdrop-blur-xl transition-colors hover:border-[var(--accent)]/50">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-500">
              <FileText size={24} />
            </div>
            {stats?.counts.pendingBlogs ? (
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
              </span>
            ) : null}
          </div>
          <div>
            <div className="text-3xl font-black tracking-tighter">{stats?.counts.pendingBlogs}</div>
            <div className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Pending Blogs
            </div>
          </div>
        </div>

        <div className="group flex h-40 flex-col justify-between rounded-3xl border border-[var(--border)] bg-[var(--card)]/50 p-6 backdrop-blur-xl transition-colors hover:border-[var(--accent)]/50">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-[var(--accent)]/10 p-3 text-[var(--accent)]">
              <Activity size={24} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tighter">
              ₹{(stats?.counts.monthlyRevenue || 0).toLocaleString()}
            </div>
            <div className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Monthly Revenue
            </div>
          </div>
        </div>

        <div className="group flex h-40 flex-col justify-between rounded-3xl border border-[var(--border)] bg-[var(--card)]/50 p-6 backdrop-blur-xl transition-colors hover:border-[var(--accent)]/50">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-500">
              <Users size={24} />
            </div>
            <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-bold text-green-500">
              Active
            </span>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tighter">{stats?.counts.totalUsers}</div>
            <div className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Total Users
            </div>
          </div>
        </div>

        <div className="group flex h-40 flex-col justify-between rounded-3xl border border-[var(--border)] bg-[var(--card)]/50 p-6 backdrop-blur-xl transition-colors hover:border-[var(--accent)]/50">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-500">
              <Map size={24} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tighter">{stats?.counts.activeTrips}</div>
            <div className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Published Trips
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="space-y-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-xl font-black tracking-tight uppercase italic">
            <Settings size={20} className="text-[var(--accent)]" /> Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--accent)] hover:shadow-[var(--accent)]/10 hover:shadow-xl"
              >
                <div
                  className={`absolute top-0 right-0 rounded-full p-20 opacity-10 blur-3xl transition-opacity group-hover:opacity-20 ${action.color}`}
                />
                <div className="relative z-10 flex items-center gap-4">
                  <div className={`rounded-2xl p-4 text-white shadow-lg ${action.color}`}>
                    <action.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg leading-none font-bold transition-colors group-hover:text-[var(--accent)]">
                      {action.label}
                    </h3>
                    <p className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase transition-transform group-hover:translate-x-1">
                      Proceed &rarr;
                    </p>
                  </div>
                  {action.badge ? (
                    <div className="animate-bounce rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
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
          <h2 className="flex items-center gap-2 text-xl font-black tracking-tight uppercase italic">
            <Activity size={20} className="text-[var(--accent)]" /> Recent Signals
          </h2>
          <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)]/30 backdrop-blur-sm">
            {!stats?.recentActivity?.length ? (
              <div className="text-muted-foreground p-8 text-center text-sm">
                No recent activity
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]/50">
                {stats.recentActivity.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-4 transition-colors hover:bg-[var(--border)]/10"
                  >
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                    <div>
                      <p className="text-xs leading-snug font-bold">
                        <span className="text-[var(--accent)] uppercase">{log.action}</span> on{" "}
                        {log.targetType}
                      </p>
                      <p className="text-muted-foreground mt-1 text-[10px] font-medium">
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/admin/audit-logs"
              className="text-muted-foreground block p-3 text-center text-[10px] font-black tracking-widest uppercase transition-colors hover:bg-[var(--border)]/10 hover:text-[var(--accent)]"
            >
              View Full Audit Trail
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

