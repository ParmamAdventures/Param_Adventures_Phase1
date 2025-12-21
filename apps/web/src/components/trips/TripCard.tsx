
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
    <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg transaction-all duration-500 hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-2 h-full">
      {/* Cinematic Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {trip.coverImage ? (
          <Image
            src={trip.coverImage}
            alt={trip.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-accent/5 text-accent/20">
            <svg className="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
        
        {/* Floating Location Badge */}
        <div className="absolute top-4 right-4">
           <span className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/90">
             {trip.location}
           </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6 space-y-4 relative">
        <div className="space-y-2 flex-1">
          <h3 className="text-xl font-bold leading-tight text-white group-hover:text-accent transition-colors line-clamp-2">
            <Link href={`/trips/${trip.slug}`}>
              <span className="absolute inset-0" />
              {trip.title}
            </Link>
          </h3>
          {(trip.duration || trip.price) && (
            <div className="flex items-center gap-3 text-xs text-white/50 font-medium uppercase tracking-wider pt-2">
              {trip.duration && <span>{trip.duration}</span>}
              {trip.price && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>From ${trip.price}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Cinematic CTA */}
        <div className="pt-2">
          <Button variant="subtle" className="w-full justify-between bg-white/5 hover:bg-accent hover:text-white border-none text-white/80 transition-all font-medium h-12 rounded-xl">
            <span>View Expedition</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
