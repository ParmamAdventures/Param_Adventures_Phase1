/**
 * TripLogistics - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export default function TripLogistics({ trip }: { trip: Record<string, unknown> }) {
  return (
    <div className="bg-card border-border space-y-6 rounded-xl border p-6">
      <h3 className="text-lg font-bold">Trip Logistics</h3>

      <div className="grid grid-cols-1 gap-4">
        {trip.startPoint && (
          <div className="flex items-start gap-3">
            <div className="text-primary mt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
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
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Start Point
              </p>
              <p className="text-foreground font-medium">{trip.startPoint}</p>
            </div>
          </div>
        )}

        {trip.endPoint && (
          <div className="flex items-start gap-3">
            <div className="text-primary mt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" x2="4" y1="22" y2="15" />
              </svg>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                End Point
              </p>
              <p className="text-foreground font-medium">{trip.endPoint}</p>
            </div>
          </div>
        )}

        <div className="border-border grid grid-cols-2 gap-4 border-t pt-4">
          {trip.altitude && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-bold tracking-wider uppercase">
                Max Altitude
              </p>
              <p className="text-foreground text-lg font-bold">{trip.altitude}</p>
            </div>
          )}
          {trip.distance && (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-bold tracking-wider uppercase">
                Trek Distance
              </p>
              <p className="text-foreground text-lg font-bold">{trip.distance}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
