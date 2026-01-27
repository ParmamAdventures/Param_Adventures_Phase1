"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { StarRating } from "../ui/StarRating";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface ReviewFormProps {
  tripId: string;
  onSuccess?: () => void;
}

/**
 * ReviewForm - Form component with validation.
 * @param {Object} props - Component props
 * @param {Array} [props.fields] - Form fields
 * @param {Function} [props.onSubmit] - Form submission handler
 * @param {Object} [props.initialValues] - Initial field values
 * @returns {React.ReactElement} Form component
 */
export default function ReviewForm({ tripId, onSuccess }: ReviewFormProps) {
  const { user } = useAuth(); // Token handled by apiFetch
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Eligibility State
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [isEligible, setIsEligible] = useState(false);
  const [ineligibilityReason, setIneligibilityReason] = useState("");

  // Check Eligibility on Mount
  // Check Eligibility on Mount
  useEffect(() => {
    let isMounted = true;

    if (user) {
      apiFetch(`/reviews/check/${tripId}`)
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) {
            setIsEligible(data.eligible);
            if (!data.eligible) setIneligibilityReason(data.reason);
          }
        })
        .catch(() => {
          if (isMounted) setIsEligible(false);
        })
        .finally(() => {
          if (isMounted) setCheckingEligibility(false);
        });
    } else {
      setCheckingEligibility(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user, tripId]);

  if (!user) {
    return (
      <div className="bg-muted/30 rounded-xl border p-6 text-center">
        <p className="text-muted-foreground">Please log in to leave a review.</p>
      </div>
    );
  }

  if (checkingEligibility) {
    return (
      <div className="text-muted-foreground p-4 text-center text-sm">Checking eligibility...</div>
    );
  }

  if (!isEligible) {
    return null; // Build stricter: "write a review should only be visible ... not to everyone"
    // OR return user friendly message:
    // return (
    //   <div className="bg-muted/30 rounded-xl border p-6 text-center text-sm text-muted-foreground">
    //     {ineligibilityReason || "You can only review trips you have completed."}
    //   </div>
    // );
    // User asked "only be visible to user who finished". So "return null" is strictest.
    // BUT "return null" might confuse user who expects to see it?
    // I'll leave a small note or return null based on strict instruction.
    // Instruction: "stricter write a review should only be visible... not to everyone".
    // I will return NULL to hide it completely.
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... (rest is same)
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({ tripId, rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      setRating(0);
      setComment("");
      if (onSuccess) onSuccess();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errMsg);
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
            className="bg-background focus:ring-primary h-32 w-full rounded-md border p-3 focus:ring-2 focus:outline-none"
          />
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
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
