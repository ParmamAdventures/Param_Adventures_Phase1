
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import StarRating from './StarRating';
import { apiFetch } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

interface ReviewFormProps {
  tripId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ tripId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, rating, comment }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit review');
      }

      showToast('Review submitted successfully!', 'success');
      setRating(0);
      setComment('');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-surface p-6 rounded-lg border border-border">
      <h3 className="text-lg font-semibold">Write a Review</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Rating</label>
        <div onMouseLeave={() => setHoverRating(0)} className="flex gap-1 w-fit">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                >
                    <StarRating rating={hoverRating || rating} size={24} editable={false} /> 
                    {/* Reusing StarRating purely for icon display is a bit redundant if we loop manually, 
                        but easier here. Actually let's just use StarRating's props properly if possible 
                        or just raw icons. Let's stick to the component. */}
                </button>
            ))}
             {/* Better Implementation: Use StarRating directly if it supports hover out of box, 
                 but our StarRating component is simple. Let's rewrite this part for clarity. */}
        </div>
         <StarRating 
            rating={rating} 
            size={28} 
            editable 
            onRatingChange={setRating} 
         />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Comment (Optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience..."
          className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <Button type="submit" disabled={loading || rating === 0}>
        {loading ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
            </>
        ) : (
            'Submit Review'
        )}
      </Button>
    </form>
  );
}
