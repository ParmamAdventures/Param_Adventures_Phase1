type Props = {
  status: string;
  type?: "trip" | "booking" | "payment" | "generic";
};

/**
 * StatusBadge - Badge component for labels.
 * @param {Object} props - Component props
 * @param {string} [props.text] - Badge text
 * @param {string} [props.variant] - Badge style variant
 * @returns {React.ReactElement} Badge component
 */
export function StatusBadge({ status }: Props) {
  const map: Record<string, string> = {
    // Trip Statuses
    DRAFT: "bg-[color:var(--border)] text-[var(--muted)]",
    PENDING_REVIEW: "bg-[var(--accent)]/15 text-[var(--accent)]",
    APPROVED: "bg-emerald-500/10 text-emerald-500",
    PUBLISHED: "bg-[var(--accent)]/10 text-[var(--accent)]",
    IN_PROGRESS: "bg-indigo-500/10 text-indigo-500",
    COMPLETED: "bg-blue-500/10 text-blue-500",
    ARCHIVED: "bg-[color:var(--border)] text-[var(--muted)]",

    // Booking Statuses
    REQUESTED: "bg-amber-500/10 text-amber-500",
    CONFIRMED: "bg-emerald-500/10 text-emerald-500",
    REJECTED: "bg-rose-500/10 text-rose-500",
    CANCELLED: "bg-[color:var(--border)] text-[var(--muted)]",

    // Payment Statuses
    PENDING: "bg-amber-500/10 text-amber-500",
    PAID: "bg-emerald-500/10 text-emerald-500",
    FAILED: "bg-rose-500/10 text-rose-500",
  };

  const className = map[status] ?? "bg-[color:var(--border)] text-[var(--muted)]";

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${className}`}>
      {(status || "UNKNOWN").replace(/_/g, " ")}
    </span>
  );
}

export default StatusBadge;
