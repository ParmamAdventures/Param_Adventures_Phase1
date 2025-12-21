"use client";

import Link from "next/link";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Cinematic Background Mesh */}
      <div className="absolute inset-0 -z-10 bg-black">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--accent),_transparent_70%)] opacity-20 blur-[120px] animate-glow" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-900/10 blur-[100px] rounded-full mix-blend-screen animate-float" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      <div className="max-w-5xl mx-auto space-y-12 z-10">
        {/* Floating Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">
            The Future of Exploration
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/50 leading-[0.8] mix-blend-overlay"
        >
          BEYOND
          <br />
          <span className="text-stroke text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}>
            BOUNDARIES
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-lg md:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed font-light"
        >
          Premium expeditions for the modern avant-garde. <br className="hidden md:block" />
          Experience the world through a new lens.
        </motion.p>

        {/* CTA Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link href="/trips">
            <Button className="h-14 px-10 text-lg bg-white text-black hover:bg-white/90 rounded-full font-bold transition-transform hover:scale-105">
              Start Expedition
            </Button>
          </Link>
          <Link href="/blogs/public">
            <Button variant="ghost" className="h-14 px-10 text-lg text-white hover:bg-white/10 rounded-full glass font-medium">
              View Journal
            </Button>
          </Link>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
      </motion.div>
    </section>
  );
}
