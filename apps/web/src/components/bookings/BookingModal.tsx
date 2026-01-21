"use client";

import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import { useToast } from "../ui/ToastProvider";
import { useRazorpay } from "../../hooks/useRazorpay";
import { useAsyncOperation } from "../../hooks/useAsyncOperation";
import { useFormState } from "../../hooks/useFormState";

interface Trip {
  id: string;
  title: string;
  price: number;
  durationDays: number;
  startDate?: string | Date;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onBookingSuccess: (booking: any) => void;
}

/**
 * BookingModal - Modal for booking trips with guest details.
 * Uses useAsyncOperation for submission state and useFormState for form management.
 *
 * @param {Props} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback when modal closes
 * @param {Trip} props.trip - Trip to book
 * @param {Function} props.onBookingSuccess - Success callback
 * @returns {React.ReactElement} Booking modal component
 *
 * @example
 * <BookingModal isOpen={true} trip={trip} onClose={() => {}} onBookingSuccess={() => {}} />
 */
export default function BookingModal({ isOpen, onClose, trip, onBookingSuccess }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { state, execute } = useAsyncOperation();
  const { values: formData, setField } = useFormState({
    guests: 1,
    startDate: "",
    guestDetails: [] as any[],
  });

  // Update guest details when guest count changes
  useEffect(() => {
    if (!formData.guestDetails) formData.guestDetails = [];

    setField("guestDetails", (prev: any[]) => {
      const newDetails = [...(prev || [])];
      if (formData.guests > newDetails.length) {
        // Add new guests
        for (let i = newDetails.length; i < formData.guests; i++) {
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
        newDetails.splice(formData.guests);
      }
      return newDetails;
    });
  }, [formData.guests, user, setField]);

  const updateGuestDetail = (index: number, field: string, value: string) => {
    const updated = [...(formData.guestDetails || [])];
    updated[index] = { ...updated[index], [field]: value };
    setField("guestDetails", updated);
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setField("guests", 1);

      // Auto-fill date if trip has a fixed start date
      if (trip.startDate) {
        const dateObj = new Date(trip.startDate);
        const formattedDate = dateObj.toISOString().split("T")[0];
        setField("startDate", formattedDate);
      } else {
        setField("startDate", "");
      }
    }
  }, [isOpen, trip.startDate, setField]);

  const { initiatePayment } = useRazorpay();

  const handleBooking = async () => {
    if (!formData.startDate) {
      showToast("Please select a start date", "error");
      return;
    }

    await execute(async () => {
      // 1. Create Booking
      const res = await apiFetch("/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: trip.id,
          startDate: new Date(formData.startDate).toISOString(),
          guests: Number(formData.guests),
          guestDetails: formData.guestDetails.map((g: any) => ({
            ...g,
            age: g.age ? Number(g.age) : undefined,
          })),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create booking");
      }

      const response = await res.json();
      const booking = response.data;

      // 2. Initiate Payment (Razorpay)
      const result = await initiatePayment(booking.id, {
        name: user?.name || formData.guestDetails[0]?.name,
        email: user?.email || formData.guestDetails[0]?.email,
      });

      // 3. Handle Completion
      // If result.isDev, we stay open to show simulate button.
      // If not, we let Razorpay handler/polling take over.
      // We don't close immediately unless we want to redirect to 'my-bookings'
      if (!result?.isDev) {
        // For non-dev, the hook handles toasts and redirections
        // but we might want to signal success to parent if needed
        // onBookingSuccess(booking);
      }

      return booking;
    });
  };

  const totalPrice = trip.price * formData.guests;

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
                  {formData.startDate ? (
                    <span className="text-foreground font-medium">
                      {new Date(formData.startDate).toLocaleDateString("en-GB", {
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
                  value={formData.startDate}
                  onChange={(e) => setField("startDate", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Number of Guests</label>
              <div className="flex items-center gap-4">
                <Button
                  variant="subtle"
                  onClick={() => setField("guests", Math.max(1, formData.guests - 1))}
                  disabled={formData.guests <= 1}
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <span className="w-8 text-center font-medium">{formData.guests}</span>
                <Button
                  variant="subtle"
                  onClick={() => setField("guests", formData.guests + 1)}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Guest Details Forms */}
            <div className="max-h-[300px] space-y-4 overflow-y-auto pr-2">
              {Array.from({ length: formData.guests }).map((_, index) => (
                <div key={index} className="bg-muted/20 rounded-xl border p-4">
                  <h4 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
                    {index === 0 ? "Primary Traveler (You)" : `Guest ${index + 1}`}
                  </h4>
                  <div className="grid gap-3">
                    <input
                      placeholder="Full Name"
                      className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                      value={formData.guestDetails[index]?.name || ""}
                      onChange={(e) => updateGuestDetail(index, "name", e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="Email"
                        type="email"
                        className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={formData.guestDetails[index]?.email || ""}
                        onChange={(e) => updateGuestDetail(index, "email", e.target.value)}
                      />
                      <input
                        placeholder="Phone"
                        type="tel"
                        className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={formData.guestDetails[index]?.phone || ""}
                        onChange={(e) => updateGuestDetail(index, "phone", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="Age"
                        type="number"
                        className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={formData.guestDetails[index]?.age || ""}
                        onChange={(e) => updateGuestDetail(index, "age", e.target.value)}
                      />
                      <select
                        className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={formData.guestDetails[index]?.gender || ""}
                        onChange={(e) => updateGuestDetail(index, "gender", e.target.value)}
                      >
                        <option value="">Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
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
              {state.status === "loading" && (
                <span className="animate-pulse text-xs text-blue-500">Processing...</span>
              )}
            </div>
            <Button
              onClick={handleBooking}
              disabled={state.status === "loading" || !formData.startDate}
              loading={state.status === "loading"}
              className="px-8"
            >
              {state.status === "loading" ? "Processing..." : "Confirm & Pay"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
