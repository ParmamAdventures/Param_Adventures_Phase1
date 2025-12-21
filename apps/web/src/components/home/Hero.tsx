"use client";

import Link from "next/link";
import { Button } from "../ui/Button";

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
      {/* Background Gradient / Glow - subtle visual interest */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-background to-accent/5 opacity-50 dark:opacity-20" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Supporting tag/eyebrow */}
        <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold tracking-wide uppercase">
          The Ultimate Adventure
        </span>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
          Discover the <span className="text-accent">Unseen.</span>
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Curated adventures for the modern explorer. From the peaks of the Himalayas to the depths of the ocean, find your next story here.
        </p>

        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/trips">
            <Button variant="primary" className="h-12 px-8 text-base shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all">
              Explore Trips
            </Button>
          </Link>
          <Link href="/blogs/public">
            <Button variant="ghost" className="h-12 px-8 text-base border border-border hover:bg-accent/5">
              Read Journal
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
