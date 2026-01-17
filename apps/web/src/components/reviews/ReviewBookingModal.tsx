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

/**
 * ReviewBookingModal - Modal dialog component for user interactions.
 * @param {Object} props - Component props
 * @param {boolean} [props.isOpen] - Whether modal is open
 * @param {Function} [props.onClose] - Callback when modal closes
 * @param {string} [props.title] - Modal title
 * @param {React.ReactNode} [props.children] - Modal content
 * @returns {React.ReactElement} Modal component
 */
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
