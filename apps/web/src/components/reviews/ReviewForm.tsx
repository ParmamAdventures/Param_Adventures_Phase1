"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import StarRating from "./StarRating";
import { apiFetch } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

interface ReviewFormProps {
  tripId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ tripId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      showToast("Please select a rating", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, rating, comment }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit review");
      }

      showToast("Review submitted successfully!", "success");
      setRating(0);
      setComment("");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border-border space-y-4 rounded-lg border p-6"
    >
      <h3 className="text-lg font-semibold">Write a Review</h3>

      <div className="space-y-2">
        <label className="text-sm font-medium">Rating</label>
        <StarRating
          rating={hoverRating || rating}
          size={32}
          editable
          onRatingChange={setRating}
          onHover={setHoverRating}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Comment (Optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience..."
          className="border-input focus-visible:ring-ring min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
        />
      </div>

      <Button type="submit" disabled={loading || rating === 0}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Review"
        )}
      </Button>
    </form>
  );
}
