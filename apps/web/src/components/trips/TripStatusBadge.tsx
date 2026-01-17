import StatusBadge from "../ui/StatusBadge";

type Props = {
  status: string;
};

/**
 * TripStatusBadge - Badge component for labels.
 * @param {Object} props - Component props
 * @param {string} [props.text] - Badge text
 * @param {string} [props.variant] - Badge style variant
 * @returns {React.ReactElement} Badge component
 */
export default function TripStatusBadge({ status }: Props) {
  // Keep a thin wrapper so we can adjust trip-specific styles later
  return <StatusBadge status={status} />;
}
