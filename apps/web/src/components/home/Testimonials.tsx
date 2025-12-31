"use client";

import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    text: "The Everest Base Camp trek was life-changing. The guides were professional, and every detail was taken care of.",
    author: "Sarah J.",
    location: "New York, USA",
  },
  {
    id: 2,
    text: "Param Adventures showed me a side of Spiti I never knew existed. Truly an expedition into the unknown.",
    author: "Rahul M.",
    location: "Mumbai, India",
  },
  {
    id: 3,
    text: "A perfect blend of adventure and comfort. The corporate retreat in Manali was exactly what our team needed.",
    author: "David L.",
    location: "London, UK",
  },
];

export function Testimonials() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">
          What Our Travelers Say
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-card border-border relative rounded-2xl border p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="text-accent absolute top-4 left-6 font-serif text-4xl">"</div>
              <p className="text-muted-foreground relative z-10 mb-6 pt-4 italic">{t.text}</p>
              <div>
                <h4 className="text-foreground font-bold">{t.author}</h4>
                <p className="text-accent text-sm">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
