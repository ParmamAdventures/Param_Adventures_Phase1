import StatusBadge from "../ui/StatusBadge";

type Props = {
  status: string;
};

export default function TripStatusBadge({ status }: Props) {
  // Keep a thin wrapper so we can adjust trip-specific styles later
  return <StatusBadge status={status} />;
}
