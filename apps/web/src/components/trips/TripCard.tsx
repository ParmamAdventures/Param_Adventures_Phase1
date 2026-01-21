import Link from "next/link";
import { Button } from "../ui/Button";
import HeartButton from "./HeartButton";
import { MediaCard } from "../ui/MediaCard";

import { Trip } from "@/types/trip";

interface TripCardProps {
  trip: Trip;
  initialSaved?: boolean;
  onToggle?: (isSaved: boolean) => void;
}

export default function TripCard({ trip, initialSaved = false, onToggle }: TripCardProps) {
  const imageUrl =
    typeof trip.coverImage === "string"
      ? trip.coverImage
      : (trip.coverImage as { mediumUrl: string })?.mediumUrl ||
        "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80";

  const displayDuration = trip.duration || (trip.durationDays ? `${trip.durationDays} Days` : null);

  return (
    <MediaCard
      title={trip.title}
      href={`/trips/${trip.slug}`}
      imageUrl={imageUrl}
      topRightActions={
        <HeartButton tripId={trip.id} initialSaved={initialSaved} onToggle={onToggle} />
      }
      badges={
        trip.price ? (
          <div className="rounded-full border border-black/10 bg-white/90 px-3 py-1 text-sm font-bold text-black shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-black/80 dark:text-white">
            ₹{trip.price}
          </div>
        ) : null
      }
      footer={
        <Link href={`/trips/${trip.slug}`} className="block w-full">
          <Button
            variant="subtle"
            className="group-hover:bg-accent w-full justify-between transition-colors group-hover:text-white"
          >
            View Details
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
      }
    >
      <p className="text-accent text-xs font-semibold tracking-wider uppercase">{trip.location}</p>
      <h3 className="text-card-foreground group-hover:text-accent line-clamp-2 text-lg leading-tight font-bold transition-colors">
        {trip.title}
      </h3>
      {(displayDuration || trip.price) && (
        <div className="text-muted-foreground flex items-center gap-3 pt-1 text-sm">
          {displayDuration && <span>{displayDuration}</span>}
          {trip.price && (
            <>
              <span className="bg-border h-1 w-1 rounded-full" />
              <span>From ₹{trip.price}</span>
            </>
          )}
        </div>
      )}
    </MediaCard>
  );
}
