import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import ReviewForm from "./ReviewForm";

interface ReviewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    tripId: string;
    trip: {
      title: string;
    };
  } | null;
  onSuccess?: () => void;
}

export default function ReviewBookingModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: ReviewBookingModalProps) {
  if (!booking) return null;

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review {booking.trip.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ReviewForm tripId={booking.tripId} onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
