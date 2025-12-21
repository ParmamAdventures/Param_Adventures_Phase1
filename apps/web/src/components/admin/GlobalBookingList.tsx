
import React, { useState, useMemo } from "react";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import Link from "next/link";

interface Booking {
  id: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  trip: {
    id: string;
    title: string;
    slug: string;
    location: string;
    price: number;
    startDate: string | null;
  };
  payments: Array<{
    status: string;
    amount: number;
    providerOrderId: string;
  }>;
}

interface GlobalBookingListProps {
  bookings: Booking[];
  loading: boolean;
  onRefresh: () => void;
}

export default function GlobalBookingList({ bookings, loading, onRefresh }: GlobalBookingListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = 
        b.user?.email.toLowerCase().includes(search.toLowerCase()) ||
        b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.trip.title.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-[var(--border)]/20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            placeholder="Search by user, trip, or ID..." 
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--accent)]/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm outline-none focus:border-[var(--accent)]/50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="REQUESTED">Requested</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <Button onClick={onRefresh} variant="subtle" className="rounded-xl">
          Refresh List
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-3xl border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--border)]/5">
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Booking Info</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">User</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Trip</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Payment</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Status</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="group hover:bg-[var(--border)]/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-mono text-[10px] text-muted-foreground mb-1">{booking.id.split('-')[0]}</div>
                  <div className="text-xs font-medium italic">{new Date(booking.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold">{booking.user?.name || "Anonymous"}</div>
                  <div className="text-xs text-muted-foreground">{booking.user?.email}</div>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/trips/${booking.trip.slug}`} className="font-bold text-[var(--accent)] hover:underline">
                    {booking.trip.title}
                  </Link>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                    {booking.trip.location} • ₹{booking.trip.price.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                   <StatusBadge status={booking.paymentStatus || "PENDING"} />
                   {booking.payments?.[0] && (
                     <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                       {booking.payments[0].providerOrderId.slice(-8)}
                     </div>
                   )}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/trips/${booking.trip.id}/bookings`}>
                    <Button variant="ghost" className="text-xs h-8 rounded-lg group-hover:bg-[var(--accent)] group-hover:text-white">
                      Manage ➔
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredBookings.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground italic">No bookings match your current search/filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
