"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TripCard from "./TripCard";
import { Button } from "../ui/Button";

interface TripCarouselProps {
  trips: any[];
}

export default function TripCarousel({ trips }: TripCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8; // Scroll 80% of view
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      // Updating state after scroll animation (roughly)
      setTimeout(checkScroll, 500);
    }
  };

  if (!trips || trips.length === 0) return null;

  return (
    <div className="relative group">
      {/* Left Button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 p-3 rounded-full bg-background/80 backdrop-blur-md shadow-lg border border-border text-foreground hover:bg-accent hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:-mx-0 md:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {trips.map((trip) => (
          <div key={trip.id} className="min-w-[85%] md:min-w-[45%] lg:min-w-[32%] shrink-0 snap-center">
             <div className="h-full">
               <TripCard trip={trip} />
             </div>
          </div>
        ))}
      </div>

      {/* Right Button */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 p-3 rounded-full bg-background/80 backdrop-blur-md shadow-lg border border-border text-foreground hover:bg-accent hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}
