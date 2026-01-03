"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { StarRating } from "../ui/StarRating";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
  tripId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ tripId, onSuccess }: ReviewFormProps) {
  const { user, token } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="bg-muted/30 rounded-xl border p-6 text-center">
        <p className="text-muted-foreground">Please log in to leave a review.</p>
        {/* Ideally show Login Button */}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tripId, rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      setRating(0);
      setComment("");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border p-6 shadow-sm">
      <h3 className="mb-4 text-xl font-bold">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Rating</label>
          <StarRating rating={rating} onRatingChange={setRating} size={28} />
        </div>

        {/* Comment Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Review (Optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was your experience?"
            className="bg-background focus:ring-primary h-32 w-full rounded-md border p-3 focus:outline-none focus:ring-2"
          />
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 rounded-md px-4 py-2 font-medium disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="animate-spin" size={16} />}
          Submit Review
        </button>
      </form>
    </div>
  );
}
