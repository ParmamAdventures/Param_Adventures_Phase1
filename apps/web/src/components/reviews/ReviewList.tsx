"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { StarRating } from "../ui/StarRating";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string | null;
    avatarImage?: {
      thumbUrl: string;
    };
  };
}

interface ReviewListProps {
  tripId: string;
  refreshTrigger?: number; // Used to re-fetch when a new review is added
}

export default function ReviewList({ tripId, refreshTrigger }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await apiFetch(`/reviews/${tripId}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [tripId, refreshTrigger]);

  if (loading) {
    return <div className="py-8 text-center">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No reviews yet. Be the first to share your experience!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">{reviews.length} Reviews</h3>
      
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6 last:border-0">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                 {review.user.avatarImage?.thumbUrl ? (
                    <img src={review.user.avatarImage.thumbUrl} alt="User" className="h-full w-full object-cover" />
                 ) : (
                    <div className="bg-primary/20 flex h-full w-full items-center justify-center font-bold text-primary">
                      {review.user.name?.charAt(0) || "U"}
                    </div>
                 )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{review.user.name || "Anonymous User"}</h4>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <StarRating rating={review.rating} size={16} readonly />
                
                {review.comment && (
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
