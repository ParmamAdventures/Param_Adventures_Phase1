"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const stats = [
  { label: "Happy Travelers", value: 10000, suffix: "+" },
  { label: "Destinations", value: 50, suffix: "+" },
  { label: "Years of Experience", value: 12, suffix: "" },
  { label: "Safety Record", value: 100, suffix: "%" },
];

export function StatsCounter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 bg-accent text-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-4xl md:text-5xl font-black tracking-tight">
                 {isInView ? (
                   <CountUp end={stat.value} duration={2} />
                 ) : (
                    <span>0</span>
                 )}
                 {stat.suffix}
              </div>
              <p className="text-white/80 font-medium uppercase tracking-wider text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountUp({ end, duration }: { end: number; duration: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
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
