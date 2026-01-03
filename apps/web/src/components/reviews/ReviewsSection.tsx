"use client";

import { useState } from "react";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import { MessageSquare } from "lucide-react";

interface ReviewsSectionProps {
  tripId: string;
}

export default function ReviewsSection({ tripId }: ReviewsSectionProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReviewSubmitted = () => {
    // Increment trigger to reload the list
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <section id="reviews" className="scroll-mt-24 space-y-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full text-primary">
          <MessageSquare size={20} />
        </div>
        <h2 className="text-2xl font-bold">Reviews & Experiences</h2>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_350px]">
        {/* Left Column: List */}
        <div>
          <ReviewList tripId={tripId} refreshTrigger={refreshTrigger} />
        </div>

        {/* Right Column: Add Review */}
        <div className="space-y-6">
          <ReviewForm tripId={tripId} onSuccess={handleReviewSubmitted} />
          
          <div className="bg-accent/5 rounded-xl p-6 text-sm text-muted-foreground">
            <p>
              <strong>Note:</strong> You can only review trips you have completed. verified reviews help our community stay safe and informed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
