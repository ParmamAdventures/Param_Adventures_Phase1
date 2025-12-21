type Props = {
  status: string;
  type?: "trip" | "booking" | "payment" | "generic";
};

export function StatusBadge({ status }: Props) {
  const map: Record<string, string> = {
    DRAFT: "bg-[color:var(--border)] text-[var(--muted)]",
    PENDING_REVIEW: "bg-[var(--accent)]/15 text-[var(--accent)]",
    APPROVED: "bg-[var(--semantic-success)]/10 text-[var(--semantic-success)]",
    PUBLISHED: "bg-[var(--accent)]/10 text-[var(--accent)]",
    ARCHIVED: "bg-[color:var(--border)] text-[var(--muted)]",
  };

  const className =
    map[status] ?? "bg-[color:var(--border)] text-[var(--muted)]";

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${className}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default StatusBadge;
