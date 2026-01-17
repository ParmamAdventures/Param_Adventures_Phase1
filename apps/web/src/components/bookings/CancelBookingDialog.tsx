"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface CancelBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  bookingTitle: string;
}

export default function CancelBookingDialog({
  isOpen,
  onClose,
  onConfirm,
  bookingTitle,
}: CancelBookingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2 text-red-500">
            <AlertTriangle size={24} />
            <DialogTitle>Cancel Booking?</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to cancel your booking for{" "}
            <span className="text-foreground font-bold">{bookingTitle}</span>? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Keep Booking
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {isLoading ? <Loader2 className="mr-2 animate-spin" size={16} /> : null}
            Yes, Cancel It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

