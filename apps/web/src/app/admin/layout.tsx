"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import PermissionRoute from "../../components/PermissionRoute";

const navItems = [
  { name: "Overview", href: "/admin", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { name: "Moderation", href: "/admin/moderation", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg> },
  { name: "Trips", href: "/admin/trips", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg> },
  { name: "Bookings", href: "/admin/bookings", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> },
  { name: "Blogs", href: "/admin/blogs", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 1 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { name: "Users", href: "/admin/users", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { name: "Roles", href: "/admin/roles", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { name: "Media", href: "/admin/media", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg> },
  { name: "Content", href: "/admin/content", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { name: "Analytics", href: "/admin/analytics", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { name: "Audit logs", href: "/admin/audit-logs", icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <PermissionRoute permission="trip:view:internal">
      <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row pt-16">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-xl z-20">
          <div className="sticky top-0 p-6 flex flex-col h-full min-h-screen">
            <div className="mb-10">
              <div className="relative w-12 h-12 mb-4 overflow-hidden rounded-full border-2 border-[var(--border)] shadow-md">
                 <Image src="/param-logo.png" alt="Logo" fill className="object-cover" sizes="48px" />
              </div>
              <h2 className="text-xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/60">
                Admin Center
              </h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-50">
                Param Adventures v1.0
              </p>
            </div>

            <nav className="flex-1 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname ? (pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))) : false;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all
                      ${isActive 
                        ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" 
                        : "text-muted-foreground hover:bg-[var(--border)]/10 hover:text-foreground"
                      }
                    `}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-10 pt-6 border-t border-[var(--border)] opacity-30">
              <Link href="/" className="text-[10px] font-black uppercase tracking-widest hover:text-[var(--accent)] transition-colors">
                ← Exit to Frontend
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </PermissionRoute>
  );
}
