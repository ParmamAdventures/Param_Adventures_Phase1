import Link from "next/link";
import { Button } from "../ui/Button";
import Image from "next/image";
import HeartButton from "./HeartButton";

type Trip = {
  id: string;
  title: string;
  location: string;
  slug: string;
  price?: number;
  duration?: string;
  durationDays?: number;
  coverImage?: string | { mediumUrl: string };
  coverImageLegacy?: string;
};

interface TripCardProps {
  trip: Trip;
  initialSaved?: boolean;
  onToggle?: (isSaved: boolean) => void;
}

/**
 * TripCard - Card component for content containers.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Card content
 * @param {string} [props.title] - Card title
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} Card element
 */
export default function TripCard({ trip, initialSaved = false, onToggle }: TripCardProps) {
  const imageUrl =
    typeof trip.coverImage === "string"
      ? trip.coverImage
      : (trip.coverImage as any)?.mediumUrl ||
        trip.coverImageLegacy ||
        "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80";

  const displayDuration = trip.duration || (trip.durationDays ? `${trip.durationDays} Days` : null);

  return (
    <div className="group bg-card border-border relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image Container - Aspect Ratio 4:3 */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageUrl}
          alt={trip.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {trip.price && (
          <div className="absolute top-4 left-4 rounded-full border border-black/10 bg-white/90 px-3 py-1 text-sm font-bold text-black shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-black/80 dark:text-white">
            ₹{trip.price}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Wishlist Button */}
        <div className="absolute top-4 right-4 z-20">
          <HeartButton tripId={trip.id} initialSaved={initialSaved} onToggle={onToggle} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col space-y-3 p-5">
        <div className="flex-1 space-y-1">
          <p className="text-accent text-xs font-semibold tracking-wider uppercase">
            {trip.location}
          </p>
          <h3 className="text-card-foreground group-hover:text-accent line-clamp-2 text-lg leading-tight font-bold transition-colors">
            <Link href={`/trips/${trip.slug}`}>
              <span className="absolute inset-0" />
              {trip.title}
            </Link>
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
        </div>

        {/* CTA */}
        <div className="pt-2">
          <Link href={`/trips/${trip.slug}`} className="relative z-10 block w-full">
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
