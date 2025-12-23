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

export default function TripBookingCard({ trip }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { initiatePayment, simulateDevSuccess, loading: paymentLoading, message } = useRazorpay();
  
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
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
      email: user?.email || "" 
    });
  };

  return (
    <>
      <Card className="sticky top-24 space-y-6 bg-[var(--card)] border shadow-xl z-20">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight">Reserve Your Spot</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Embark on this adventure with us. Secure your seat today.
          </p>
        </div>

        <div className="py-4 border-y border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Trip Price</span>
            <span className="text-2xl font-black text-[var(--accent)]">₹{trip.price?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Availability</span>
            <span className="text-emerald-500 font-bold">Limited Slots</span>
          </div>
        </div>

        <div className="space-y-4">
          {!bookingId ? (
            <Button 
              disabled={disabled} 
              onClick={handleBookClick}
              className="w-full py-6 rounded-2xl shadow-lg shadow-[var(--accent)]/20 text-lg font-bold"
            >
              {disabled ? "Not available" : "Join Trip"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center space-y-2">
                <p className="text-emerald-500 text-sm font-bold">✓ Booking Requested</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold italic">ID: {bookingId.slice(0, 8)}...</p>
              </div>
              
              <Button 
                onClick={handlePayment}
                loading={paymentLoading}
                className="w-full py-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 text-lg font-bold"
              >
                {paymentLoading ? "Contacting PG..." : "Pay Now to Confirm"}
              </Button>

              {message?.includes("Dev order created") && (
                <Button 
                  variant="subtle" 
                  onClick={() => simulateDevSuccess(bookingId)}
                  className="w-full rounded-2xl"
                >
                  Simulate Dev Success
                </Button>
              )}

              {message && (
                <p className="text-[10px] text-center text-[var(--accent)] font-medium animate-pulse">
                  {message}
                </p>
              )}
              
              <Link href="/my-bookings" className="block text-center text-xs text-muted-foreground hover:text-[var(--accent)] transition-colors">
                Manage all bookings ➔
              </Link>
            </div>
          )}
        </div>

        <div className="bg-[var(--border)]/10 p-4 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Secure Checkout
          </div>
          <p className="text-[10px] text-muted-foreground">Your transactions are encrypted and processed securely via Razorpay.</p>
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
