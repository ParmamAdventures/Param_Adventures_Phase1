import React, { useState, useMemo } from "react";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import { Select } from "../ui/Select";
import Link from "next/link";
import ManualPaymentModal from "./ManualPaymentModal";
import { apiFetch } from "../../lib/api";
import TableLoading from "../ui/DataTable/TableLoading";
import TableEmptyState from "../ui/DataTable/TableEmptyState";
import type { Booking } from "@/types/booking";

interface GlobalBookingListProps {
  bookings: Booking[];
  loading: boolean;
  onRefresh: () => void;
}

/**
 * GlobalBookingList - List/Gallery display component.
 * @param {Object} props - Component props
 * @param {Array} [props.items] - Items to display
 * @param {Function} [props.renderItem] - Item render function
 * @param {boolean} [props.isLoading] - Loading state
 * @param {string} [props.emptyMessage] - Message when no items
 * @returns {React.ReactElement} List component
 */
export default function GlobalBookingList({
  bookings,
  loading,
  onRefresh,
}: GlobalBookingListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
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
    return <TableLoading message="Loading bookings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <svg
            className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by user, trip, or ID..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-2 pr-4 pl-10 text-sm outline-none focus:border-[var(--accent)]/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            triggerClassName="h-10 px-4 text-sm"
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "REQUESTED", label: "Requested" },
              { value: "CONFIRMED", label: "Confirmed" },
              { value: "REJECTED", label: "Rejected" },
              { value: "CANCELLED", label: "Cancelled" },
              { value: "COMPLETED", label: "Completed" },
            ]}
          />
        </div>
        <Button onClick={onRefresh} variant="subtle" className="rounded-xl">
          Refresh List
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-3xl border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--border)]/5">
              <th className="text-muted-foreground px-6 py-4 text-[10px] font-bold tracking-widest uppercase">
                Booking Info
              </th>
              <th className="text-muted-foreground px-6 py-4 text-[10px] font-bold tracking-widest uppercase">
                User
              </th>
              <th className="text-muted-foreground px-6 py-4 text-[10px] font-bold tracking-widest uppercase">
                Trip
              </th>
              <th className="text-muted-foreground px-6 py-4 text-[10px] font-bold tracking-widest uppercase">
                Payment
              </th>
              <th className="text-muted-foreground px-6 py-4 text-[10px] font-bold tracking-widest uppercase">
                Status
              </th>
              <th className="text-muted-foreground px-6 py-4 text-right text-[10px] font-bold tracking-widest uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="group transition-colors hover:bg-[var(--border)]/5">
                <td className="px-6 py-4">
                  <div className="text-muted-foreground mb-1 font-mono text-[10px]">
                    {booking.id.split("-")[0]}
                  </div>
                  <div className="text-xs font-medium italic">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold">{booking.user?.name || "Anonymous"}</div>
                  <div className="text-muted-foreground text-xs">{booking.user?.email}</div>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/trips/${booking.trip.slug}`}
                    className="font-bold text-[var(--accent)] hover:underline"
                  >
                    {booking.trip.title}
                  </Link>
                  <div className="text-muted-foreground text-[10px] font-bold tracking-tighter uppercase">
                    {booking.trip.location} • ₹{booking.trip.price.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={booking.paymentStatus || "PENDING"} />
                  {booking.payments?.[0] && (
                    <div className="text-muted-foreground mt-1 font-mono text-[10px]">
                      {booking.payments[0].providerOrderId.slice(-8)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/trips/${booking.trip.id}/bookings`}>
                    <Button
                      variant="ghost"
                      className="h-8 rounded-lg text-xs group-hover:bg-[var(--accent)] group-hover:text-white"
                    >
                      Manage ➔
                    </Button>
                  </Link>
                  {booking.paymentStatus !== "PAID" && booking.status !== "CANCELLED" && (
                    <Button
                      variant="outline"
                      className="ml-2 h-8 rounded-lg text-xs"
                      onClick={() => setSelectedBookingForPayment(booking)}
                    >
                      Record Pay
                    </Button>
                  )}
                  {booking.paymentStatus === "PAID" && booking.status !== "CANCELLED" && (
                    <Button
                      variant="danger"
                      className="ml-2 h-8 rounded-lg bg-red-500/10 text-xs text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={async () => {
                        if (
                          confirm(
                            "Are you sure you want to refund this booking? This action cannot be undone.",
                          )
                        ) {
                          try {
                            const res = await apiFetch(`/bookings/${booking.id}/refund`, {
                              method: "POST",
                            });
                            if (res.ok) {
                              alert("Refund processed successfully");
                              onRefresh();
                            } else {
                              const data = await res.json();
                              alert(data.message || "Refund failed");
                            }
                          } catch (e) {
                            console.error(e);
                            alert("Refund failed");
                          }
                        }
                      }}
                    >
                      Refund
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="py-12">
            <TableEmptyState
              message="No bookings match your current search/filter."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
            />
          </div>
        )}
      </div>
      {/* Modal */}
      {selectedBookingForPayment && (
        <ManualPaymentModal
          isOpen={true}
          onClose={() => setSelectedBookingForPayment(null)}
          booking={selectedBookingForPayment}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
