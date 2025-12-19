"use client";

import Link from "next/link";
import ThemeToggle from "../../components/theme/ThemeToggle";
import Button from "../../components/ui/Button";

export default function PublicNavbar() {
  return (
    <header className="border-b border-[var(--border)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Brand */}
        <Link href="/" className="text-lg font-semibold tracking-wide">
          Param Adventures
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link href="/trips" className="text-sm opacity-80 hover:opacity-100">
            Trips
          </Link>
          <Link href="/blogs" className="text-sm opacity-80 hover:opacity-100">
            Blogs
          </Link>

          <ThemeToggle />

          <Link href="/login">
            <Button variant="primary">Login</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
