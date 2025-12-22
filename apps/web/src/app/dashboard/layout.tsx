"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";

const tabs = [
  { name: "My Stories", href: "/dashboard", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 1 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { name: "My Adventures", href: "/dashboard/bookings", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> },
  { name: "Profile Settings", href: "/dashboard/profile", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="max-w-5xl mx-auto pt-24 pb-10 px-6 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase italic">
               Member <span className="text-[var(--accent)]">Dashboard</span>
            </h1>
            
            <nav className="flex gap-2 p-1.5 bg-[var(--border)]/20 backdrop-blur-md rounded-2xl w-fit">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`
                      flex items-center gap-2 px-6 py-2.5 rounded-[14px] text-sm font-bold transition-all
                      ${isActive 
                        ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" 
                        : "text-muted-foreground hover:bg-[var(--border)]/40 hover:text-foreground"
                      }
                    `}
                  >
                    {tab.icon}
                    {tab.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
