"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "../../lib/api";

type Review = {
  id: string;
  rating: number;
  comment: string;
  user: {
    name: string;
    avatarImage?: { thumbUrl: string };
  };
  trip?: {
    title: string;
    location: string;
  };
};

export function Testimonials({ tripId }: { tripId?: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const endpoint = tripId ? `/reviews/${tripId}` : "/reviews/featured";
        const res = await apiFetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReviews();
  }, [tripId]);

  if (!isLoading && reviews.length === 0) {
    if (tripId) return null; // Don't show empty section on trip page
    // For home page, keep it hidden or show empty state? Let's hide it for now or keep hardcoded fallback if preferred.
    // User requested dynamic, so hidden if empty is better than fake data.
    return null; 
  }

  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">
          {tripId ? "Traveler Reviews" : "What Our Travelers Say"}
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {reviews.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-card border-border relative rounded-2xl border p-8 shadow-sm transition-shadow hover:shadow-md flex flex-col justify-between"
            >
              <div>
                 <div className="text-accent absolute top-4 left-6 font-serif text-4xl">"</div>
                 <p className="text-muted-foreground relative z-10 mb-6 pt-4 italic line-clamp-4">
                   {t.comment}
                 </p>
              </div>
              <div className="flex items-center gap-4 mt-4">
                 {t.user.avatarImage?.thumbUrl ? (
                    <img 
                      src={t.user.avatarImage.thumbUrl} 
                      alt={t.user.name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                 ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                      {t.user.name.charAt(0)}
                    </div>
                 )}
                 <div>
                    <h4 className="text-foreground font-bold text-sm">{t.user.name}</h4>
                    {tripId ? (
                       <span className="text-amber-500 text-xs tracking-widest">
                         {"★".repeat(t.rating)}
                       </span>
                    ) : (
                       <div className="flex flex-col text-xs text-muted-foreground mt-0.5">
                         <span className="font-medium text-accent">{t.trip?.title}</span>
                         <span>{t.trip?.location}</span>
                       </div>
                    )}
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

