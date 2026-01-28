"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { Spinner } from "../../../components/ui/Spinner";

interface TripInquiry {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  destination: string;
  dates: string;
  budget: string;
  details: string;
  status: string;
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<TripInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch("/admin/inquiries");
      if (res.ok) {
        const data = await res.json();
        if (data.data?.inquiries) {
          setInquiries(data.data.inquiries);
        }
      }
    } catch (error) {
      console.error("Failed to fetch inquiries", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      // Optimistic update
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq)),
      );

      await apiFetch(`/admin/inquiries/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Failed to update status", error);
      fetchInquiries(); // Revert on error
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)]">Inquiries</h1>
        <div className="text-sm text-[var(--muted-foreground)]">Total: {inquiries.length}</div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--muted)]/50 text-[var(--muted-foreground)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Traveler</th>
                <th className="px-6 py-4 font-semibold">Destination</th>
                <th className="px-6 py-4 font-semibold">Details</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--muted-foreground)]">
                    No inquiries found.
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="transition-colors hover:bg-[var(--muted)]/20">
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--muted-foreground)]">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--foreground)]">{inquiry.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{inquiry.email}</div>
                      {inquiry.phoneNumber && (
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {inquiry.phoneNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{inquiry.destination}</div>
                      {inquiry.dates && (
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {inquiry.dates}
                        </div>
                      )}
                    </td>
                    <td className="max-w-xs truncate px-6 py-4" title={inquiry.details}>
                      {inquiry.details || "-"}
                      {inquiry.budget && (
                        <div className="mt-1 font-mono text-xs text-[var(--accent)]">
                          Budget: {inquiry.budget}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={inquiry.status}
                        onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                        className="h-8 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-xs font-medium focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
