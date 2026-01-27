"use client";

import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const defaultStats = [
  { key: "travelers", label: "Happy Travelers", value: 10000, suffix: "+" },
  { key: "destinations", label: "Destinations", value: 50, suffix: "+" },
  { key: "years", label: "Years of Experience", value: 12, suffix: "" },
  { key: "safety", label: "Safety Record", value: 100, suffix: "%" },
];

/**
 * StatsCounter - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export function StatsCounter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [statsData, setStatsData] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    fetch("/api/content/stats")
      .then((res) => res.json())
      .then((data) => setStatsData(data))
      .catch((err) => console.error("Failed to load stats", err));
  }, []);

  return (
    <section className="bg-accent py-20 text-white" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
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
                <div className="text-4xl font-black tracking-tight md:text-5xl">
                  {isInView ? <CountUp end={displayValue} duration={2} /> : <span>0</span>}
                  {stat.suffix}
                </div>
                <p className="text-sm font-medium tracking-wider text-white/80 uppercase">
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
      setTimeout(() => {
        setCount((prev) => (prev !== 0 ? 0 : prev));
      }, 0);
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
