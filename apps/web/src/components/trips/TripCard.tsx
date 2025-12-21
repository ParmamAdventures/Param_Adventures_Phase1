import Link from "next/link";
import { Button } from "../ui/Button";
import Image from "next/image";

type Trip = {
  id: string;
  title: string;
  location: string;
  slug: string;
  price?: number;
  duration?: string;
  coverImage?: string;
};

export default function TripCard({ trip }: { trip: Trip }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
      {/* Image Container - Aspect Ratio 4:3 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {trip.coverImage ? (
          <Image
            src={trip.coverImage}
            alt={trip.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-accent/5 text-accent/20">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 space-y-3">
        <div className="space-y-1 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            {trip.location}
          </p>
          <h3 className="text-lg font-bold leading-tight text-card-foreground group-hover:text-accent transition-colors line-clamp-2">
            <Link href={`/trips/${trip.slug}`}>
              <span className="absolute inset-0" />
              {trip.title}
            </Link>
          </h3>
          {(trip.duration || trip.price) && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground pt-1">
              {trip.duration && <span>{trip.duration}</span>}
              {trip.price && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>From ${trip.price}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="pt-2">
          <Button variant="subtle" className="w-full justify-between group-hover:bg-accent group-hover:text-white transition-colors">
            View Details
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
