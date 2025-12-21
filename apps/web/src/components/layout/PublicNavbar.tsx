"use client";

import Link from "next/link";
import ThemeToggle from "../../components/theme/ThemeToggle";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { usePathname } from "next/navigation";

export default function PublicNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => 
    !!pathname && (pathname === path || (path !== "/" && pathname.startsWith(path)));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
          <span className="text-accent">Param</span>
          <span>Adventures</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink href="/trips" active={isActive("/trips")}>Adventures</NavLink>
          <NavLink href="/blogs/public" active={isActive("/blogs")}>Journal</NavLink>
          
          {user && (
            <NavLink href="/dashboard" active={isActive("/dashboard")}>Dashboard</NavLink>
          )}

          {user?.roles?.includes("SUPER_ADMIN") || user?.roles?.includes("ADMIN") ? (
             <NavLink href="/admin" active={isActive("/admin")}>Admin</NavLink>
          ) : null}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center gap-4">
               <span className="hidden md:block text-sm font-medium text-muted-foreground">
                  {user.name || user.email?.split("@")[0]}
               </span>
               <Button variant="ghost" onClick={logout} className="text-sm h-9">
                  Log out
               </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-sm h-9">Log in</Button>
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

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className={`text-sm font-bold uppercase tracking-widest transition-all relative group ${
        active ? "text-accent" : "text-muted-foreground hover:text-accent"
      }`}
    >
      {children}
      <span className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300 ${
        active ? "w-full" : "w-0 group-hover:w-full"
      }`} />
    </Link>
  );
}
