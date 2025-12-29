"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Tent, 
  Briefcase, 
  GraduationCap, 
  Sprout, 
  Map 
} from "lucide-react";

const categories = [
  {
    id: "trek",
    title: "Trek and Camping",
    description: "Connect with nature in its rawest form.",
    icon: Tent,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    href: "#category-trek",
  },
  {
    id: "corporate",
    title: "Corporate Trips",
    description: "Team building in the heart of mountains.",
    icon: Briefcase,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    href: "#category-corporate",
  },
  {
    id: "educational",
    title: "Educational Trips",
    description: "Learning beyond the four walls.",
    icon: GraduationCap,
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    href: "#category-educational",
  },
  {
    id: "spiritual",
    title: "Spiritual Trips",
    description: "Find your inner peace and clarity.",
    icon: Sprout,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    href: "#category-spiritual",
  },
  {
    id: "custom",
    title: "Custom Trip",
    description: "Your journey, crafted exactly your way.",
    icon: Map,
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    href: "#custom-trip-form", // Anchor link to the form
  },
];

export function AdventureCategories() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">
            Choose Your Adventure
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you seek adrenaline, peace, or connection, we have the perfect path for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat, idx) => (
            <Link key={cat.id} href={cat.href} className="group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="h-full bg-background border border-border p-6 rounded-2xl hover:border-accent/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group-hover:bg-accent/5"
              >
                <div className={`p-4 rounded-full mb-4 ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <cat.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">
                  {cat.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cat.description}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
