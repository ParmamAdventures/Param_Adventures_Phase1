"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";
import { Button } from "../../../components/ui/Button";
import StatusBadge from "../../../components/ui/StatusBadge";
import Spinner from "../../../components/ui/Spinner";
import Card from "../../../components/ui/Card";
import { useAuth } from "../../../context/AuthContext";
import CancelBookingDialog from "@/components/bookings/CancelBookingDialog";
import InvoiceModal from "@/components/bookings/InvoiceModal";
import { FileText, Star } from "lucide-react";
import ReviewBookingModal from "@/components/reviews/ReviewBookingModal";

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState<any>(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<any>(null);

  const fetchBookings = async () => {
    try {
      const res = await apiFetch("/bookings/me");
      if (res.ok) {
        const response = await res.json();
        setBookings(response.data);
      }
    } catch (error) {
      console.error("Failed to load bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openCancelModal = (booking: any) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };

  const openInvoiceModal = (booking: any) => {
    setInvoiceBooking(booking);
    setInvoiceModalOpen(true);
  };

  const openReviewModal = (booking: any) => {
    setReviewBooking(booking);
    setReviewModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    try {
      const res = await apiFetch(`/bookings/${selectedBooking.id}/cancel`, { method: "POST" });
      if (res.ok) {
        // Optimistic Update
        setBookings(
          bookings.map((b) => (b.id === selectedBooking.id ? { ...b, status: "CANCELLED" } : b)),
        );
      } else {
        alert("Failed to cancel booking"); // Could use Toast but focusing on task
      }
    } catch (e) {
      alert("Network error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Adventures</h1>
        <Link href="/trips">
          <Button variant="subtle">Explore More</Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-muted/20 rounded-2xl border-2 border-dashed py-16 text-center">
          <h3 className="text-muted-foreground mb-4 text-xl font-medium">
            You haven't booked any trips yet.
          </h3>
          <Link href="/trips">
            <Button variant="primary" className="px-6 py-2.5">
              Find Your Next Adventure
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="flex flex-col gap-6 p-6 transition-shadow hover:shadow-lg md:flex-row md:p-8"
            >
              {/* Image */}
              <div className="bg-muted relative h-32 w-full shrink-0 overflow-hidden rounded-xl md:w-48">
                {booking.trip.coverImage?.mediumUrl || booking.trip.coverImageLegacy ? (
                  <img
                    src={booking.trip.coverImage?.mediumUrl || booking.trip.coverImageLegacy}
                    alt={booking.trip.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="bg-accent/10 text-accent flex h-full w-full items-center justify-center font-bold">
                    PARAM
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{booking.trip.title}</h3>
                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {booking.trip.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl font-bold">
                      ₹{booking.totalPrice.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-xs">{booking.guests} Guests</span>
                  </div>
                </div>

                <div className="flax-wrap flex gap-4 border-t pt-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs uppercase">Start Date</span>
                    <span className="font-medium">
                      {new Date(booking.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs uppercase">Booking ID</span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {booking.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="ml-auto flex flex-col items-end">
                    <span className="text-muted-foreground mb-1 text-xs uppercase">Status</span>
                    <StatusBadge status={booking.status} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  {/* Leave Review Button */}
                  {booking.status === "COMPLETED" && (
                    <>
                      <Button
                        variant="primary"
                        className="h-auto gap-2 py-2 text-sm"
                        onClick={() => openReviewModal(booking)}
                      >
                        <Star size={14} /> Leave Review
                      </Button>
                      <Link href={`/dashboard/blogs/new?tripId=${booking.tripId}`}>
                        <Button
                          variant="outline"
                          className="h-auto gap-2 border-amber-500 py-2 text-sm text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                        >
                          <FileText size={14} /> Share Story
                        </Button>
                      </Link>
                    </>
                  )}

                  {/* Invoice Button */}
                  {booking.status === "CONFIRMED" && (
                    <Button
                      variant="outline"
                      className="h-auto gap-2 py-2 text-sm"
                      onClick={() => openInvoiceModal(booking)}
                    >
                      <FileText size={14} /> Invoice
                    </Button>
                  )}

                  {/* Cancel Button */}
                  {["REQUESTED", "CONFIRMED"].includes(booking.status) && (
                    <Button
                      variant="ghost"
                      className="h-auto py-2 text-sm text-red-500 hover:bg-red-500/10 hover:text-red-600"
                      onClick={() => openCancelModal(booking)}
                    >
                      Cancel Booking
                    </Button>
                  )}
                  {booking.paymentStatus === "PENDING" &&
                    booking.status !== "CANCELLED" &&
                    booking.status !== "REJECTED" && (
                      <Button
                        variant="primary"
                        className="h-auto py-2 text-sm"
                        onClick={() => alert("Payment flow integration pending")}
                      >
                        Pay Now
                      </Button>
                    )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CancelBookingDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        bookingTitle={selectedBooking?.trip.title || ""}
      />

      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        booking={invoiceBooking}
      />

      <ReviewBookingModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        booking={reviewBooking}
        onSuccess={() => {
          /* Maybe refetch bookings if we want to hide button? Optional */
        }}
      />
    </div>
  );
}
