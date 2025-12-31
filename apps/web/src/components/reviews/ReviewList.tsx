"use client";

import React, { useEffect, useState } from "react";
import StarRating from "./StarRating";
import { apiFetch } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    avatarImage: {
      thumbUrl: string;
    } | null;
  };
}

interface ReviewListProps {
  tripId: string;
  refreshTrigger?: number; // Prop to trigger refetch
}

export default function ReviewList({ tripId, refreshTrigger }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await apiFetch(`/reviews/${tripId}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [tripId, refreshTrigger]);

  if (loading) {
    return <div className="text-muted-foreground text-sm">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-muted-foreground text-sm italic">
        No reviews yet. Be the first to share your experience!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Traveler Reviews ({reviews.length})</h3>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-border border-b pb-6 last:border-0 last:pb-0">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                  {review.user.avatarImage ? (
                    <img
                      src={review.user.avatarImage.thumbUrl}
                      alt={review.user.name || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-accent flex h-full w-full items-center justify-center font-bold">
                      {(review.user.name?.[0] || "U").toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {review.user.name || "Anonymous Traveler"}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <StarRating rating={review.rating} size={16} />
            </div>
            {review.comment && (
              <p className="text-foreground/80 mt-2 text-sm leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
