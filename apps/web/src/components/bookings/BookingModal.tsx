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
      setStartDate("");
      setLoading(false);
    }
  }, [isOpen]);

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
          guests
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
          <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
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
              <input 
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
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
          <div className="pt-4 border-t flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total Payment</span>
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
