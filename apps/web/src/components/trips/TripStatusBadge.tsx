type Props = {
  status: string;
};

const colors: Record<string, string> = {
  DRAFT: "#aaa",
  PENDING_REVIEW: "#facc15",
  APPROVED: "#22c55e",
  PUBLISHED: "#3b82f6",
  ARCHIVED: "#ef4444",
};

export default function TripStatusBadge({ status }: Props) {
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: 12,
        background: colors[status] || "#ddd",
        color: "#000",
      }}
    >
      {status}
    </span>
  );
}
