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
    <div className="group relative">
      {/* Left Button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="bg-background/80 border-border text-foreground hover:bg-accent absolute top-1/2 left-0 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border p-3 opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:opacity-100 hover:text-white md:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-8 md:-mx-0 md:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="min-w-[85%] shrink-0 snap-center md:min-w-[45%] lg:min-w-[32%]"
          >
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
          className="bg-background/80 border-border text-foreground hover:bg-accent absolute top-1/2 right-0 z-10 hidden translate-x-1/2 -translate-y-1/2 rounded-full border p-3 opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:opacity-100 hover:text-white md:flex"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}
