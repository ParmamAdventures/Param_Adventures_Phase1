"use client";

import React, { useState, useCallback } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import { useToast } from "../ui/ToastProvider";
import { useRazorpay } from "../../hooks/useRazorpay";
import Link from "next/link";
import BookingModal from "../bookings/BookingModal";

interface Props {
  trip: any;
}

/**
 * TripBookingCard - Card component for content containers.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Card content
 * @param {string} [props.title] - Card title
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} Card element
 */
export default function TripBookingCard({ trip }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { initiatePayment, simulateDevSuccess, isLoading: paymentLoading, message } = useRazorpay();

  const [isLoading, setIsLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const disabled = trip?.status !== "PUBLISHED";

  const handleBookClick = () => {
    if (!user) {
      showToast("Please sign in to book this trip", "info");
      return;
    }
    setIsModalOpen(true);
  };

  const handleBookingSuccess = (booking: any) => {
    setBookingId(booking.id);
    // BookingModal handles the success toast
  };

  const handlePayment = async () => {
    if (!bookingId) return;
    setPaymentInitiated(true);
    const result = await initiatePayment(bookingId, {
      name: user?.name || "",
      email: user?.email || "",
    });
    if (result?.orderId) {
      setOrderId(result.orderId);
    }
  };

  return (
    <>
      <Card className="sticky top-24 z-20 space-y-6 border bg-[var(--card)] shadow-xl">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight">Reserve Your Spot</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Embark on this adventure with us. Secure your seat today.
          </p>
        </div>

        <div className="space-y-3 border-y border-[var(--border)] py-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
              Trip Price
            </span>
            <span className="text-2xl font-black text-[var(--accent)]">
              ₹{trip.price?.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Availability</span>
            <span className="font-bold text-emerald-500">Limited Slots</span>
          </div>
        </div>

        <div className="space-y-4">
          {!bookingId ? (
            <Button
              disabled={disabled}
              onClick={handleBookClick}
              className="w-full rounded-2xl py-6 text-lg font-bold shadow-[var(--accent)]/20 shadow-lg"
            >
              {disabled ? "Not available" : "Join Trip"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                <p className="text-sm font-bold text-emerald-500">✓ Booking Requested</p>
                <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase italic">
                  ID: {bookingId.slice(0, 8)}...
                </p>
              </div>

              <Button
                onClick={handlePayment}
                loading={paymentLoading}
                className="w-full rounded-2xl bg-emerald-500 py-6 text-lg font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
              >
                {paymentLoading ? "Contacting PG..." : "Pay Now to Confirm"}
              </Button>

              {message?.includes("Dev order created") && (
                <Button
                  variant="subtle"
                  onClick={() => simulateDevSuccess(bookingId, orderId || undefined)}
                  className="w-full rounded-2xl"
                >
                  Simulate Dev Success
                </Button>
              )}

              {message && (
                <p className="animate-pulse text-center text-[10px] font-medium text-[var(--accent)]">
                  {message}
                </p>
              )}

              <Link
                href="/my-bookings"
                className="text-muted-foreground block text-center text-xs transition-colors hover:text-[var(--accent)]"
              >
                Manage all bookings ➔
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-2xl bg-[var(--border)]/10 p-4">
          <div className="text-muted-foreground flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Secure Checkout
          </div>
          <p className="text-muted-foreground text-[10px]">
            Your transactions are encrypted and processed securely via Razorpay.
          </p>
        </div>
      </Card>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trip={trip}
        onBookingSuccess={handleBookingSuccess}
      />
    </>
  );
}
