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
import { FileText } from "lucide-react";

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState<any>(null);

  const fetchBookings = async () => {
    try {
      const res = await apiFetch("/bookings/my-bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
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

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    try {
      const res = await apiFetch(`/bookings/${selectedBooking.id}/cancel`, { method: "POST" });
      if (res.ok) {
        // Optimistic Update
        setBookings(bookings.map(b => b.id === selectedBooking.id ? { ...b, status: "CANCELLED" } : b));
      } else {
        alert("Failed to cancel booking"); // Could use Toast but focusing on task
      }
    } catch (e) {
      alert("Network error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Adventures</h1>
        <Link href="/trips">
          <Button variant="subtle">Explore More</Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-muted/20">
          <h3 className="text-xl font-medium text-muted-foreground mb-4">You haven't booked any trips yet.</h3>
          <Link href="/trips">
            <Button variant="primary" className="py-2.5 px-6">Find Your Next Adventure</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="w-full md:w-48 h-32 bg-muted rounded-xl overflow-hidden shrink-0 relative">
                 {booking.trip.coverImage?.mediumUrl ? (
                   <img 
                     src={booking.trip.coverImage.mediumUrl} 
                     alt={booking.trip.title} 
                     className="w-full h-full object-cover"
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-accent/10 text-accent font-bold">
                     PARAM
                   </div>
                 )}
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{booking.trip.title}</h3>
                    <p className="text-muted-foreground flex items-center gap-1 text-sm mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                      {booking.trip.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl font-bold">₹{booking.totalPrice.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">{booking.guests} Guests</span>
                  </div>
                </div>

                <div className="flex flax-wrap gap-4 text-sm border-t pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase">Start Date</span>
                    <span className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase">Booking ID</span>
                    <span className="font-mono text-xs text-muted-foreground">{booking.id.slice(0,8)}...</span>
                  </div>
                  <div className="flex flex-col ml-auto items-end">
                    <span className="text-xs text-muted-foreground uppercase mb-1">Status</span>
                    <StatusBadge status={booking.status} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                   {/* Invoice Button */}
                   {booking.status === "CONFIRMED" && (
                       <Button 
                            variant="outline" 
                            className="h-auto py-2 text-sm gap-2"
                            onClick={() => openInvoiceModal(booking)}
                        >
                            <FileText size={14} /> Invoice
                        </Button>
                   )}

                   {/* Cancel Button */}
                   {["REQUESTED", "CONFIRMED"].includes(booking.status) && (
                      <Button 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-auto py-2 text-sm"
                        onClick={() => openCancelModal(booking)}
                      >
                        Cancel Booking
                      </Button>
                   )}
                   {booking.paymentStatus === "PENDING" && booking.status !== "CANCELLED" && booking.status !== "REJECTED" && (
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
    </div>
  );
}
