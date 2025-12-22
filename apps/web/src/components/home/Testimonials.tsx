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
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
          What Our Travelers Say
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="text-accent text-4xl font-serif absolute top-4 left-6">"</div>
              <p className="text-muted-foreground italic mb-6 relative z-10 pt-4">
                {t.text}
              </p>
              <div>
                <h4 className="font-bold text-foreground">{t.author}</h4>
                <p className="text-sm text-accent">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
