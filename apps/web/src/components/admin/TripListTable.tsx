"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import Spinner from "../ui/Spinner";

type Trip = {
  id: string;
  title: string;
  slug: string;
  location: string;
  status: string;
  price?: number;
  startDate?: string;
  endDate?: string;
  capacity?: number;
};

type Props = {
  trips: Trip[];
  loading: boolean;
  onRefresh?: () => void;
  onAction?: (id: string, action: "submit" | "approve" | "reject" | "publish" | "archive") => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  sortBy?: string;
  sortOrder?: string;
  onSort?: (field: string) => void;
  onAssignGuide?: (id: string) => void;
};

export default function TripListTable({ 
  trips, 
  loading, 
  onRefresh, 
  onAction,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  sortBy,
  sortOrder,
  onSort,
  onAssignGuide
}: Props) {
  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
        <Spinner size={24} />
        <p>Loading adventures...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="p-12 text-center border rounded-xl border-dashed bg-muted/20 flex flex-col items-center gap-4">
        <p className="text-muted-foreground">No trips found. Time to create a new adventure!</p>
        <Link href="/admin/trips/new">
          <Button variant="primary">+ Create First Trip</Button>
        </Link>
      </div>
    );
  }

  const renderSortArrow = (field: string) => {
    if (sortBy !== field) return null;
    return (
      <span className="ml-1 inline-block">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const headerClass = "px-6 py-4 cursor-pointer hover:text-foreground transition-colors select-none";

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className={headerClass} onClick={() => onSort?.("title")}>
                  Adventure {renderSortArrow("title")}
                </th>
                <th className={headerClass} onClick={() => onSort?.("price")}>
                    Price {renderSortArrow("price")}
                </th>
                <th className={headerClass} onClick={() => onSort?.("location")}>
                  Location {renderSortArrow("location")}
                </th>
                <th className={headerClass} onClick={() => onSort?.("status")}>
                  Status {renderSortArrow("status")}
                </th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground text-base">
                        {trip.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {trip.price ? (
                        <span className="text-muted-foreground font-mono">
                          ₹{trip.price.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 italic">N/A</span>
                      )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground flex items-center gap-1">
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
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {trip.location}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={trip.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {trip.status === "DRAFT" && onAction && (
                        <Button 
                          variant="primary" 
                          className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 h-auto text-xs"
                          onClick={() => onAction(trip.id, "submit")}
                        >
                          Submit
                        </Button>
                      )}
                      {trip.status === "PENDING_REVIEW" && onAction && (
                          <>
                              <Button 
                                  variant="primary" 
                                  className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 h-auto text-xs"
                                  onClick={() => onAction(trip.id, "approve")}
                              >
                                  Approve
                              </Button>
                              <Button 
                                  variant="danger" 
                                  className="px-3 py-1.5 h-auto text-xs"
                                  onClick={() => onAction(trip.id, "reject")}
                              >
                                  Reject
                              </Button>
                          </>
                      )}
                      {trip.status === "APPROVED" && onAction && (
                        <Button 
                          variant="primary" 
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 h-auto text-xs"
                          onClick={() => onAction(trip.id, "publish")}
                        >
                          Publish
                        </Button>
                      )}
                      {trip.status === "PUBLISHED" && onAction && (
                        <Button 
                          variant="ghost" 
                          className="text-amber-600 hover:text-amber-700 px-3 py-1.5 h-auto text-xs"
                          onClick={() => onAction(trip.id, "archive")}
                        >
                          Archive
                        </Button>
                      )}
                      {(trip.status === "APPROVED" || trip.status === "PUBLISHED") && onAssignGuide && (
                        <Button
                          variant="subtle"
                          className="px-3 py-1.5 h-auto text-xs"
                          onClick={() => onAssignGuide(trip.id)}
                        >
                          Assign Guide
                        </Button>
                      )}
                          <>
                              <Link href={`/admin/trips/${trip.id}/edit`}>
                              <Button variant="ghost" className="px-3 py-1.5 h-auto text-xs">
                                  Edit
                              </Button>
                              </Link>
                              <Link href={`/trips/${trip.slug}`} target="_blank">
                              <Button variant="subtle" className="px-3 py-1.5 h-auto text-xs">
                                  Preview
                              </Button>
                              </Link>
                          </>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="subtle"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-4 py-2 h-auto text-sm"
            >
              Previous
            </Button>
            <Button
              variant="subtle"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 h-auto text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
