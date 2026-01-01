"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import { useToast } from "../ui/ToastProvider";

interface Trip {
  id: string;
  title: string;
  price: number;
  durationDays: number;
  startDate?: string | Date; // Added for auto-fill
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onBookingSuccess: (booking: any) => void;
}

export default function BookingModal({ isOpen, onClose, trip, onBookingSuccess }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [guests, setGuests] = useState(1);
  const [startDate, setStartDate] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setGuests(1);
      
      // Auto-fill date if trip has a fixed start date
      if (trip.startDate) {
        // Format to YYYY-MM-DD for input[type="date"]
        const dateObj = new Date(trip.startDate);
        const formattedDate = dateObj.toISOString().split("T")[0];
        setStartDate(formattedDate);
      } else {
        setStartDate("");
      }
      
      setLoading(false);
    }
  }, [isOpen, trip.startDate]);

  const handleBooking = async () => {
    if (!startDate) {
      showToast("Please select a start date", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: trip.id,
          startDate: new Date(startDate).toISOString(),
          guests,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create booking");
      }

      const booking = await res.json();
      showToast("Booking created successfully!", "success");
      onBookingSuccess(booking);
      onClose();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = trip.price * guests;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Adventure: {trip.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Trip Summary */}
          <div className="bg-muted/30 space-y-2 rounded-lg p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price per person</span>
              <span className="font-medium">₹{trip.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{trip.durationDays} Days</span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Start Date</label>
              <div className="relative">
                <div className="border-input bg-background text-muted-foreground ring-offset-background flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm">
                  {startDate ? (
                    <span className="text-foreground font-medium">
                      {new Date(startDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  ) : (
                    <span>dd/mm/yyyy</span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-50"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                </div>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Guests</label>
              <div className="flex items-center gap-4">
                <Button
                  variant="subtle"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  disabled={guests <= 1}
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <span className="w-8 text-center font-medium">{guests}</span>
                <Button
                  variant="subtle"
                  onClick={() => setGuests(guests + 1)}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Total Payment</span>
              <span className="text-2xl font-bold">₹{totalPrice.toLocaleString()}</span>
            </div>
            <Button
              onClick={handleBooking}
              disabled={loading || !startDate}
              loading={loading}
              className="px-8"
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
