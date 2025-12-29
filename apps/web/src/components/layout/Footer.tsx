"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="relative w-8 h-8 overflow-hidden rounded-full border border-white/20">
              <Image 
                src="/param-logo.png" 
                alt="Logo" 
                fill 
                className="object-cover" 
                unoptimized
              />
            </div>
            <span className="text-xl font-bold tracking-tight">Param Adventures</span>
          </Link>
          <p className="text-muted-foreground max-w-sm mb-6">
            Curated adventure experiences for the modern explorer. 
            Discover the world's most breathtaking destinations.
          </p>
          <div className="flex gap-4">
            {/* Social Links Placeholders */}
            <div className="w-8 h-8 rounded-full bg-muted/50 hover:bg-accent/20 transition-colors cursor-pointer" />
            <div className="w-8 h-8 rounded-full bg-muted/50 hover:bg-accent/20 transition-colors cursor-pointer" />
            <div className="w-8 h-8 rounded-full bg-muted/50 hover:bg-accent/20 transition-colors cursor-pointer" />
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-4">Explore</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link href="/trips" className="hover:text-accent transition-colors">Adventures</Link></li>
            <li><Link href="/blogs" className="hover:text-accent transition-colors">Journal</Link></li>
            <li><Link href="/about" className="hover:text-accent transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Project</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>
              <Link href="/project" className="flex items-center gap-2 hover:text-accent transition-colors">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Project Showcase
              </Link>
            </li>

            <li><Link href="/login" className="hover:text-accent transition-colors">Admin Login</Link></li>
            <li><Link href="/style-guide" className="hover:text-accent transition-colors">Design System</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
        <p>&copy; {currentYear} Param Adventures. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
