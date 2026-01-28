import Link from "next/link";
import { Button } from "../ui/Button";
import { Users, Calendar, MapPin, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FileText } from "lucide-react";
import AssignCrewModal from "./AssignCrewModal";
import ReviewDocsModal from "./ReviewDocsModal";
import { Trip } from "../../types/trip";

interface ManagerTripCardProps {
  trip: Trip;
  onUpdate: () => void;
}

/**
 * ManagerTripCard - Card component for content containers.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Card content
 * @param {string} [props.title] - Card title
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} Card element
 */
export default function ManagerTripCard({ trip, onUpdate }: ManagerTripCardProps) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false); // Added isReviewOpen state
  const isPublished = trip.status === "PUBLISHED";
  const isDraft = trip.status === "DRAFT";

  // Status color
  const statusColor = isPublished
    ? "text-green-500 bg-green-500/10"
    : isDraft
      ? "text-orange-500 bg-orange-500/10"
      : "text-gray-500 bg-gray-500/10";

  return (
    <div className="bg-card border-border flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md md:flex-row">
      {/* Image Thumbnail */}
      <div className="relative h-32 w-full shrink-0 md:h-auto md:w-48">
        <Image
          src={
            (typeof trip.coverImage === "string" ? trip.coverImage : trip.coverImage?.mediumUrl) ||
            "/placeholder-trip.jpg"
          }
          alt={trip.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-bold ${statusColor} mb-2 inline-block`}
              >
                {trip.status}
              </span>
              <h3 className="text-foreground text-lg leading-tight font-bold">{trip.title}</h3>
            </div>
            {/* Bookings Count */}
            <div className="text-muted-foreground bg-accent/5 flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium">
              <Users size={14} />
              <span>
                {trip._count?.bookings || 0} / {trip.capacity || "∞"}
              </span>
            </div>
          </div>

          <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>
                {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "Date TBD"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{trip.location}</span>
            </div>
          </div>
        </div>

        {/* Footer: Guides & Actions */}
        <div className="border-border flex items-center justify-between border-t pt-2">
          {/* Assigned Guides */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Guides:
            </span>
            {trip.guides && trip.guides.length > 0 ? (
              <div className="flex -space-x-2">
                {trip.guides.map((g) => (
                  <div
                    key={g.guide.id}
                    title={g.guide.name || "Guide"}
                    className="border-background bg-accent relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border text-[10px] text-white"
                  >
                    {g.guide.avatarImage?.mediumUrl ? (
                      <Image
                        src={g.guide.avatarImage.mediumUrl}
                        fill
                        alt={g.guide.name || "Avatar"}
                        className="object-cover"
                      />
                    ) : (
                      (g.guide.name || "?")[0]
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span className="flex items-center gap-1 text-xs text-orange-500">
                <AlertCircle size={10} /> None
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="subtle"
              size="sm"
              onClick={() => setIsAssignModalOpen(true)} // Changed to open modal
              className="h-8 text-xs font-medium"
            >
              Manage Crew
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="h-8 gap-2 bg-[var(--accent)] text-xs text-white hover:bg-[var(--accent)]/90"
              onClick={() => setIsReviewOpen(true)}
            >
              <FileText size={14} /> Review Docs
            </Button>
            <Link href={`/admin/trips/${trip.id}/edit`}>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Details
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <AssignCrewModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        tripId={trip.id}
        currentGuides={trip.guides}
        onSuccess={onUpdate}
      />

      <ReviewDocsModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        trip={trip}
        onSuccess={onUpdate}
      />
    </div>
  );
}
