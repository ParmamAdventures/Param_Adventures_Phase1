"use client";

import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "../../components/theme/ThemeToggle";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import SearchOverlay from "../search/SearchOverlay";

export default function PublicNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";

  // Navbar styles based on state
  const navClasses =
    isHome && !isScrolled
      ? "fixed top-0 z-50 w-full border-b border-white/10 bg-transparent text-white transition-all duration-300"
      : "fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground shadow-sm transition-all duration-300";

  const isActive = (path: string) =>
    !!pathname && (pathname === path || (path !== "/" && pathname.startsWith(path)));

  return (
    <>
      <header className={navClasses}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-bold tracking-tight transition-opacity hover:opacity-80"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white/20 shadow-sm">
              <Image
                src="/param-logo.png"
                alt="Param Adventures Logo"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className={isHome && !isScrolled ? "text-white" : "text-accent"}>Param</span>
              <span>Adventures</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <NavLink
              href="/trips"
              active={isActive("/trips")}
              isTransparent={isHome && !isScrolled}
            >
              Expeditions
            </NavLink>
            <NavLink
              href="/blogs"
              active={isActive("/blogs")}
              isTransparent={isHome && !isScrolled}
            >
              Journal
            </NavLink>

            {/* Links moved to User Menu */}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`rounded-xl p-2 transition-all ${isHome && !isScrolled ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:text-accent hover:bg-accent/5"}`}
              aria-label="Search"
              suppressHydrationWarning
            >
              <Search size={20} />
            </button>

            <ThemeToggle />

            {user ? (
              <>
                <div
                  className={`mr-1 hidden items-center gap-3 md:flex ${isHome && !isScrolled ? "text-white/90" : "text-foreground/90"}`}
                >
                  <span className="text-sm font-medium tracking-tight">
                    Hi, {user.name?.split(" ")[0]}
                  </span>
                  {user.roles &&
                    user.roles.length > 0 &&
                    user.roles.map((role: string) => {
                      const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
                      const isGuide = role === "GUIDE" || role === "TRIP_GUIDE";
                      const isManager = role === "TRIP_MANAGER";
                      const isUploader = role === "UPLOADER";

                      let badgeClass = "bg-gray-500/20 text-gray-500";
                      let Icon = User;

                      if (isAdmin) {
                        badgeClass = "bg-blue-500/20 text-blue-500";
                        Icon = ShieldCheck;
                      } else if (isGuide) {
                        badgeClass = "bg-green-500/20 text-green-500";
                        Icon = Compass;
                      } else if (isManager) {
                        badgeClass = "bg-purple-500/20 text-purple-500";
                        Icon = Briefcase;
                      } else if (isUploader) {
                        badgeClass = "bg-orange-500/20 text-orange-500";
                        Icon = UploadCloud;
                      }

                      return (
                        <div
                          key={role}
                          title={role.replace("_", " ")}
                          className={`rounded-full p-1.5 ${badgeClass}`}
                        >
                          <Icon size={14} />
                        </div>
                      );
                    })}
                </div>
                <UserMenu user={user} logout={logout} isHome={isHome} isScrolled={isScrolled} />
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className={`h-9 text-sm ${isHome && !isScrolled ? "text-white hover:bg-white/10 hover:text-white" : ""}`}
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" className="h-9 text-sm">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

function NavLink({
  href,
  active,
  children,
  isTransparent,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  isTransparent?: boolean;
}) {
  const baseClasses = "text-sm font-bold uppercase tracking-widest transition-all relative group";

  const textClass = active
    ? "text-accent"
    : isTransparent
      ? "text-white/80 hover:text-white"
      : "text-muted-foreground hover:text-accent";

  return (
    <Link href={href} className={`${baseClasses} ${textClass}`}>
      {children}
      <span
        className={`bg-accent absolute -bottom-1 left-0 h-0.5 transition-all duration-300 ${
          active ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  );
}

import {
  User,
  LayoutDashboard,
  Shield,
  LogOut,
  ChevronDown,
  Settings,
  ShieldCheck,
  Compass,
  Briefcase,
  UploadCloud,
} from "lucide-react";

function UserMenu({
  user,
  logout,
  isHome,
  isScrolled,
}: {
  user: any;
  logout: () => void;
  isHome: boolean;
  isScrolled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when clicking outside (simple version: onMouseLeave container)

  const buttonClass =
    isHome && !isScrolled
      ? "text-white hover:bg-white/10 border-white/20"
      : "text-foreground hover:bg-accent/5 border-border";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full border p-1 pr-3 transition-all duration-200 ${buttonClass} ${isOpen ? "ring-accent/20 bg-accent/10 ring-2" : ""}`}
      >
        <div className="from-accent/80 to-accent ring-background relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm ring-2">
          {user.avatarImage?.mediumUrl ? (
            <Image
              src={user.avatarImage.mediumUrl}
              alt={user.name || "User"}
              fill
              className="object-cover"
            />
          ) : user.name ? (
            user.name.charAt(0).toUpperCase()
          ) : (
            "U"
          )}
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />}
      <div
        className={`border-border/50 bg-background/95 absolute top-full right-0 z-20 mt-2 w-64 origin-top-right rounded-2xl border p-2 shadow-xl backdrop-blur-xl transition-all duration-200 ${isOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"}`}
      >
        {/* Header */}
        <div className="border-border/50 mb-2 border-b px-4 py-3">
          <p className="text-foreground truncate text-sm font-bold">{user.name || "User"}</p>
          <p className="text-muted-foreground truncate text-xs">{user.email}</p>
        </div>

        {/* Links */}
        <div className="space-y-1">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent/10 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>

          <Link
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent/10 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <User size={16} />
            Profile
          </Link>

          {(user?.permissions?.includes("trip:approve") || user?.roles?.includes("UPLOADER")) && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-500/10 hover:text-amber-700"
            >
              <Shield size={16} />
              Admin Panel
            </Link>
          )}

          {user?.roles?.includes("TRIP_MANAGER") && (
            <Link
              href="/dashboard/manager"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-500/10 hover:text-purple-700"
            >
              <Briefcase size={16} />
              Manager Portal
            </Link>
          )}

          {user?.permissions?.includes("trip:view:guests") &&
            !user?.permissions?.includes("trip:approve") &&
            !user?.permissions?.includes("trip:view:internal") && (
              <Link
                href="/dashboard/guide"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-green-600 transition-colors hover:bg-green-500/10 hover:text-green-700"
              >
                <Compass size={16} />
                Guide Portal
              </Link>
            )}
        </div>

        {/* Footer */}
        <div className="border-border/50 mt-2 border-t pt-2">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/5"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
