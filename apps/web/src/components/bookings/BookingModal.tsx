"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import { useToast } from "../ui/ToastProvider";
import { useRazorpay } from "../../hooks/useRazorpay";

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

/**
 * BookingModal - Modal dialog component for user interactions.
 * @param {Object} props - Component props
 * @param {boolean} [props.isOpen] - Whether modal is open
 * @param {Function} [props.onClose] - Callback when modal closes
 * @param {string} [props.title] - Modal title
 * @param {React.ReactNode} [props.children] - Modal content
 * @returns {React.ReactElement} Modal component
 */
export default function BookingModal({ isOpen, onClose, trip, onBookingSuccess }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [guests, setGuests] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [guestDetails, setGuestDetails] = useState<any[]>([]);

  // Update guest details when guest count changes
  useEffect(() => {
    setGuestDetails((prev) => {
      const newDetails = [...prev];
      if (guests > prev.length) {
        // Add new guests
        for (let i = prev.length; i < guests; i++) {
          if (i === 0 && user) {
            // Auto-fill primary user
            newDetails.push({
              name: user.name || "",
              email: user.email || "",
              phone: user.phoneNumber || "",
              age: user.age || "",
              gender: user.gender || "",
            });
          } else {
            newDetails.push({ name: "", email: "", phone: "", age: "", gender: "" });
          }
        }
      } else {
        // Remove guests
        newDetails.splice(guests);
      }
      return newDetails;
    });
  }, [guests, user]);

  const updateGuestDetail = (index: number, field: string, value: string) => {
    setGuestDetails((prev) => {
      const newDetails = [...prev];
      newDetails[index] = { ...newDetails[index], [field]: value };
      return newDetails;
    });
  };

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

      setIsLoading(false);
    }
  }, [isOpen, trip.startDate]);

  const { initiatePayment, message: paymentMessage } = useRazorpay();

  const handleBooking = async () => {
    if (!startDate) {
      showToast("Please select a start date", "error");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create Booking
      const res = await apiFetch("/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: trip.id,
          startDate: new Date(startDate).toISOString(),
          guests,
          guestDetails,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create booking");
      }

      const response = await res.json();
      const booking = response.data; // Unwrap API response

      // 2. Initiate Payment (Razorpay)
      // This handles opening the modal and verification internally
      const result = await initiatePayment(booking.id, {
        name: user?.name || guestDetails[0]?.name,
        email: user?.email || guestDetails[0]?.email,
      });

      // 3. Success (Only if we get here without error)
      showToast("Booking & Payment Successful!", "success");
      onBookingSuccess(booking);
      onClose();
    } catch (err: any) {
      // If booking was created but payment failed/cancelled, we still show error
      // The user can pay later from "My Bookings" (Future feature)
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
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

            <div className="space-y-4">
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

            {/* Guest Details Forms */}
            <div className="max-h-[300px] space-y-4 overflow-y-auto pr-2">
              {Array.from({ length: guests }).map((_, index) => (
                <div key={index} className="bg-muted/20 rounded-xl border p-4">
                  <h4 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
                    {index === 0 ? "Primary Traveler (You)" : `Guest ${index + 1}`}
                  </h4>
                  <div className="grid gap-3">
                    <input
                      placeholder="Full Name"
                      className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                      value={guestDetails[index]?.name || ""}
                      onChange={(e) => updateGuestDetail(index, "name", e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="Email"
                        type="email"
                        className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={guestDetails[index]?.email || ""}
                        onChange={(e) => updateGuestDetail(index, "email", e.target.value)}
                      />
                      <input
                        placeholder="Phone"
                        type="tel"
                        className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={guestDetails[index]?.phone || ""}
                        onChange={(e) => updateGuestDetail(index, "phone", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="Age"
                        type="number"
                        className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={guestDetails[index]?.age || ""}
                        onChange={(e) => updateGuestDetail(index, "age", e.target.value)}
                      />
                      <select
                        className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={guestDetails[index]?.gender || ""}
                        onChange={(e) => updateGuestDetail(index, "gender", e.target.value)}
                      >
                        <option value="">Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Total Payment</span>
              <span className="text-2xl font-bold">₹{totalPrice.toLocaleString()}</span>
              {isLoading && paymentMessage && (
                <span className="animate-pulse text-xs text-blue-500">{paymentMessage}</span>
              )}
            </div>
            <Button
              onClick={handleBooking}
              disabled={isLoading || !startDate}
              loading={isLoading}
              className="px-8"
            >
              {isLoading ? "Processing..." : "Confirm & Pay"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
