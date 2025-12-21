
import React from "react";
import Link from "next/link";
import Card from "../ui/Card";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import { useRazorpay } from "../../hooks/useRazorpay";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../ui/Spinner";

type Booking = {
  id: string;
  status: string;
  createdAt: string;
  paymentStatus?: string | null;
  trip: {
    id: string;
    title: string;
    slug: string;
    location: string;
    startDate?: string | null;
    endDate?: string | null;
    price: number;
    coverImage?: { mediumUrl: string } | null;
  };
};

interface Props {
  bookings: Booking[];
  loading?: boolean;
}

export default function BookingList({ bookings, loading }: Props) {
  const { initiatePayment, simulateDevSuccess, loading: paymentLoading, message } = useRazorpay();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Spinner size={32} />
        <p className="text-muted-foreground animate-pulse">Fetching your adventures...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {bookings.map((booking) => (
        <Card key={booking.id} className="group overflow-hidden border-[var(--border)] bg-[var(--card)] transition-all hover:border-[var(--accent)]/30 hover:shadow-xl hover:shadow-[var(--accent)]/5">
          <div className="flex flex-col md:flex-row">
            {/* Trip Preview */}
            <div className="relative h-48 w-full md:h-auto md:w-64 shrink-0 overflow-hidden bg-[var(--border)]">
              {booking.trip.coverImage ? (
                <img 
                  src={booking.trip.coverImage.mediumUrl} 
                  alt={booking.trip.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <StatusBadge status={booking.status} />
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-1 flex-col p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    <Link href={`/trips/${booking.trip.slug}`} className="hover:text-[var(--accent)] transition-colors">
                      {booking.trip.title}
                    </Link>
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span className="text-sm">{booking.trip.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Payment Status</p>
                    <div className="mt-1">
                      <StatusBadge status={booking.paymentStatus || "PENDING"} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-[var(--border)] text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs uppercase">Dates</p>
                  <p className="font-medium italic">
                    {booking.trip.startDate ? new Date(booking.trip.startDate).toLocaleDateString() : "TBD"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs uppercase">Booking ID</p>
                  <p className="font-mono text-[10px] truncate">{booking.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs uppercase">Amount</p>
                  <p className="font-bold text-[var(--accent)]">₹{booking.trip.price.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs uppercase">Reference</p>
                  <p className="font-medium">{booking.paymentStatus === "PAID" ? "Trans-Verified" : "Waiting"}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex gap-4">
                  {(booking.status === "REQUESTED" || booking.status === "CONFIRMED") && booking.paymentStatus !== "PAID" ? (
                    <div className="flex flex-col gap-2">
                      <Button 
                        onClick={async () => {
                          const result = await initiatePayment(booking.id, { 
                            name: user?.name || "", 
                            email: user?.email || "" 
                          });
                        }} 
                        loading={paymentLoading}
                        className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white shadow-lg shadow-[var(--accent)]/20 rounded-full px-8"
                      >
                        {paymentLoading ? "Contacting PG..." : "Complete Payment"}
                      </Button>
                      {message && booking.id === message.split("order ")[1] && (
                        <p className="text-[10px] text-[var(--accent)] font-medium animate-pulse">{message}</p>
                      )}
                    </div>
                  ) : booking.paymentStatus === "PAID" ? (
                    <div className="flex items-center gap-2 text-emerald-500 font-bold bg-emerald-500/10 px-4 py-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Fully Paid
                    </div>
                  ) : null}

                  {/* Dev Simulate Button */}
                  {message?.includes("Dev order created") && (
                    <Button 
                      variant="subtle" 
                      onClick={() => simulateDevSuccess(booking.id)}
                      className="rounded-full px-6"
                    >
                      Simulate Success
                    </Button>
                  )}
                </div>

                <Link href={`/trips/${booking.trip.slug}`}>
                  <Button variant="ghost" className="text-muted-foreground hover:text-[var(--accent)]">
                    View Adventure Details ➔
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
