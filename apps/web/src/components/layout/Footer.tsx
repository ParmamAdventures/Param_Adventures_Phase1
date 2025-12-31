"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-border border-t px-6 py-12">
      <div className="mx-auto mb-12 grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="mb-4 flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20">
              <Image src="/param-logo.png" alt="Logo" fill className="object-cover" unoptimized />
            </div>
            <span className="text-xl font-bold tracking-tight">Param Adventures</span>
          </Link>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Curated adventure experiences for the modern explorer. Discover the world's most
            breathtaking destinations.
          </p>
          <div className="flex gap-4">
            {/* Social Links Placeholders */}
            <div className="bg-muted/50 hover:bg-accent/20 h-8 w-8 cursor-pointer rounded-full transition-colors" />
            <div className="bg-muted/50 hover:bg-accent/20 h-8 w-8 cursor-pointer rounded-full transition-colors" />
            <div className="bg-muted/50 hover:bg-accent/20 h-8 w-8 cursor-pointer rounded-full transition-colors" />
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-bold">Explore</h3>
          <ul className="text-muted-foreground space-y-3 text-sm">
            <li>
              <Link href="/trips" className="hover:text-accent transition-colors">
                Adventures
              </Link>
            </li>
            <li>
              <Link href="/blogs" className="hover:text-accent transition-colors">
                Journal
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-accent transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-accent transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-bold">Project</h3>
          <ul className="text-muted-foreground space-y-3 text-sm">
            <li>
              <Link
                href="/project"
                className="hover:text-accent flex items-center gap-2 transition-colors"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Project Showcase
              </Link>
            </li>

            <li>
              <Link href="/login" className="hover:text-accent transition-colors">
                Admin Login
              </Link>
            </li>
            <li>
              <Link href="/style-guide" className="hover:text-accent transition-colors">
                Design System
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-border text-muted-foreground mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t pt-8 text-xs md:flex-row">
        <p>&copy; {currentYear} Param Adventures. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
