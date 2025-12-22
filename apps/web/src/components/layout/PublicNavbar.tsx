"use client";

import Link from "next/link";
import ThemeToggle from "../../components/theme/ThemeToggle";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function PublicNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";

  // Navbar styles based on state
  const navClasses = isHome && !isScrolled
    ? "fixed top-0 z-50 w-full border-b border-white/10 bg-transparent text-white transition-all duration-300"
    : "fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground shadow-sm transition-all duration-300";

  const isActive = (path: string) => 
    !!pathname && (pathname === path || (path !== "/" && pathname.startsWith(path)));

  return (
    <header className={navClasses}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
          <span className={isHome && !isScrolled ? "text-white" : "text-accent"}>Param</span>
          <span>Adventures</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink href="/trips" active={isActive("/trips")} isTransparent={isHome && !isScrolled}>Adventures</NavLink>
          <NavLink href="/blogs" active={isActive("/blogs")} isTransparent={isHome && !isScrolled}>Journal</NavLink>
          
          {user && (
            <NavLink href="/dashboard" active={isActive("/dashboard")} isTransparent={isHome && !isScrolled}>Dashboard</NavLink>
          )}

          {user?.roles?.includes("SUPER_ADMIN") || user?.roles?.includes("ADMIN") ? (
             <NavLink href="/admin" active={isActive("/admin")} isTransparent={isHome && !isScrolled}>Admin</NavLink>
          ) : null}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center gap-4">
               <span className={`hidden md:block text-sm font-medium ${isHome && !isScrolled ? "text-white/80" : "text-muted-foreground"}`}>
                  {user.name || user.email?.split("@")[0]}
               </span>
               <Button variant="ghost" onClick={logout} className={`text-sm h-9 ${isHome && !isScrolled ? "text-white hover:bg-white/10 hover:text-white" : ""}`}>
                  Log out
               </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className={`text-sm h-9 ${isHome && !isScrolled ? "text-white hover:bg-white/10 hover:text-white" : ""}`}>Log in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" className="text-sm h-9">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children, isTransparent }: { href: string; active: boolean; children: React.ReactNode; isTransparent?: boolean }) {
  const baseClasses = "text-sm font-bold uppercase tracking-widest transition-all relative group";
  
  const textClass = active
    ? "text-accent"
    : isTransparent
      ? "text-white/80 hover:text-white"
      : "text-muted-foreground hover:text-accent";

  return (
    <Link 
      href={href} 
      className={`${baseClasses} ${textClass}`}
    >
      {children}
      <span className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300 ${
        active ? "w-full" : "w-0 group-hover:w-full"
      }`} />
    </Link>
  );
}
