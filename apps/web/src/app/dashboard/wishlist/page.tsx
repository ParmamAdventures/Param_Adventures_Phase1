
"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import TripCard from "@/components/trips/TripCard";
import { Loader2, Heart } from "lucide-react";

interface SavedTrip {
  id: string;
  title: string;
  slug: string;
  durationDays: number;
  price: number;
  location: string;
  coverImage?: {
    mediumUrl: string;
  };
  category: string;
  difficulty: string;
}

export default function WishlistPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    try {
      const res = await apiFetch("/wishlist");
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    } finally {
      setLoading(false);
    }
  }

  const handleRemove = (tripId: string) => {
    // Optimistic removal from list
    setTrips((current) => current.filter((t) => t.id !== tripId));
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
          <p className="text-muted-foreground mt-2">
            Your saved adventures for future reference.
          </p>
        </div>
        <div className="bg-accent/10 text-accent p-3 rounded-full">
            <Heart size={24} className="fill-current" />
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-xl bg-surface/50">
          <Heart size={48} className="text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">No saved trips yet</h3>
          <p className="text-muted-foreground">
            Explore our adventures and save the ones you love!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard 
                key={trip.id} 
                trip={trip as any} 
                initialSaved={true}
                onToggle={(isSaved) => {
                    if (!isSaved) handleRemove(trip.id);
                }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
