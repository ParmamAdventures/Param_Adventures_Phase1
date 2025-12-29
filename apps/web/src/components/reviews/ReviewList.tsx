
"use client";

import React, { useEffect, useState } from 'react';
import StarRating from './StarRating';
import { apiFetch } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

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
    return <div className="text-muted-foreground text-sm italic">No reviews yet. Be the first to share your experience!</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Traveler Reviews ({reviews.length})</h3>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 overflow-hidden flex-shrink-0">
                        {review.user.avatarImage ? (
                            <img src={review.user.avatarImage.thumbUrl} alt={review.user.name || "User"} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-accent font-bold">
                                {(review.user.name?.[0] || "U").toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-sm">{review.user.name || "Anonymous Traveler"}</div>
                        <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</div>
                    </div>
                </div>
                <StarRating rating={review.rating} size={16} />
            </div>
            {review.comment && (
                <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
                    {review.comment}
                </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
