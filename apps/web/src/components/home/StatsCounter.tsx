"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";


const defaultStats = [
  { key: "travelers", label: "Happy Travelers", value: 10000, suffix: "+" },
  { key: "destinations", label: "Destinations", value: 50, suffix: "+" },
  { key: "years", label: "Years of Experience", value: 12, suffix: "" },
  { key: "safety", label: "Safety Record", value: 100, suffix: "%" },
];

export function StatsCounter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/content/stats`)
        .then(res => res.json())
        .then(data => setStatsData(data))
        .catch(err => console.error("Failed to load stats", err));
  }, []);

  return (
    <section className="py-20 bg-accent text-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {defaultStats.map((stat, index) => {
             // If we have API data, use it. Otherwise fall back to default (or 0)
             // Actually, defaults are 10000, which is good for loading state or backup.
             // But if API returns 5, we should show 5.
             let displayValue = stat.value;
             if (statsData && statsData[stat.key] !== undefined) {
                displayValue = statsData[stat.key];
             }

             return (
                <div key={index} className="space-y-2">
                  <div className="text-4xl md:text-5xl font-black tracking-tight">
                    {isInView ? (
                        <CountUp end={displayValue} duration={2} />
                    ) : (
                        <span>0</span>
                    )}
                    {stat.suffix}
                  </div>
                  <p className="text-white/80 font-medium uppercase tracking-wider text-sm">
                    {stat.label}
                  </p>
                </div>
             );
          })}
        </div>
      </div>
    </section>
  );
}

function CountUp({ end, duration }: { end: number; duration: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    if (end === 0) {
        setCount(0);
        return;
    }
    const increment = end / (duration * 60);
    const interval = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [end, duration]);

  return <span>{count}</span>;
}
