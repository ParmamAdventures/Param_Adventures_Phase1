"use client";

import Link from "next/link";
import { Button } from "../ui/Button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  videoUrl: string;
  ctaLink?: string;
  order: number;
}

interface HeroProps {
  slides?: HeroSlide[];
}

export function Hero({ slides = [] }: HeroProps) {
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);

  // If no slides, fallback to default static content or a placeholder list
  const displaySlides = slides.length > 0 ? slides : [
    {
      id: "default-1",
      title: "Discover the Unseen",
      subtitle: "Curated adventures for the modern explorer.",
      videoUrl: "", // Logic to handle empty video
      ctaLink: "/trips",
      order: 1
    }
  ];

  const activeSlide = displaySlides[activeIndex];

  // Auto-advance slider
  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displaySlides.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(interval);
  }, [displaySlides.length]);

  return (
    <section className="relative h-[100vh] flex flex-col items-center justify-center text-center overflow-hidden isolate">
      
      {/* Background Slider */}
      <AnimatePresence mode="popLayout">
        <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full bg-slate-900" // removed -z-20, will rely on section relative context or explicit z-0, but actually absolute inside relative parent needs to be behind content. Let's keep it clean:
            style={{ zIndex: -1 }} 
        >
            {activeSlide.videoUrl ? (
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-60"
                    key={activeSlide.videoUrl} 
                    src={activeSlide.videoUrl}
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black relative">
                   <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                </div>
            )}
        </motion.div>
      </AnimatePresence>
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent -z-10" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-12">
        
        {/* Dynamic Text */}
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSlide.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-semibold tracking-wide uppercase mb-4 backdrop-blur-sm border border-accent/20 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                        {displaySlides.length > 1 ? `0${activeIndex + 1} / 0${displaySlides.length}` : "Premium Travel"}
                    </span>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[1.05] drop-shadow-2xl">
                        {activeSlide.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200/90 max-w-2xl mx-auto mt-6 font-light">
                        {activeSlide.subtitle}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Trip Type Selector / Navigation */}
        {displaySlides.length > 1 && (
             <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {displaySlides.map((slide, idx) => (
                    <button
                        key={slide.id}
                        onClick={() => setActiveIndex(idx)}
                        suppressHydrationWarning
                        className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 border backdrop-blur-md ${
                            idx === activeIndex 
                                ? "bg-accent text-white border-accent shadow-[0_0_20px_rgba(249,115,22,0.4)] scale-105" 
                                : "bg-black/30 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/30"
                        }`}
                    >
                        {slide.title}
                    </button>
                ))}
             </div>
        )}

        {/* CTA */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-8"
        >
             <Link href="/trips">
                <Button variant="primary" className="h-14 px-10 text-lg shadow-xl shadow-accent/20 hover:scale-105 transition-transform">
                    Explore All
                </Button>
            </Link>
        </motion.div>

      </div>
    </section>
  );
}
