import Image from "next/image";
import StatusBadge from "../ui/StatusBadge";
import HeartButton from "./HeartButton";

/**
 * TripHero - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
interface TripHeroProps {
  trip: {
    id: string;
    title: string;
    status: string;
    durationDays: number;
    location: string;
    difficulty: string;
    price: number;
    heroImage?: { originalUrl?: string; mediumUrl?: string } | null;
    coverImage?: { originalUrl?: string; mediumUrl?: string } | null;
  };
}

export default function TripHero({ trip }: TripHeroProps) {
  // Helper to format local image paths
  const getImageUrl = (image: { originalUrl?: string; mediumUrl?: string } | null | undefined) => {
    if (!image) return null;
    const url = image.originalUrl || image.mediumUrl;
    if (!url) return null;

    // If it's already a full URL or absolute path, return it
    if (url.startsWith("http") || url.startsWith("/")) return url;

    // Otherwise assume it's a filename in the uploads directory
    // We'll use the original folder by default for hero images
    return `/uploads/original/${url}`;
  };

  const heroImage = getImageUrl(trip.heroImage);
  const coverImage = getImageUrl(trip.coverImage);

  // Prioritize Hero -> Cover
  const finalCoverImage = heroImage || coverImage;

  return (
    <div className="relative flex h-[60vh] min-h-[500px] w-full items-end overflow-hidden bg-slate-900 pb-12 text-white">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {finalCoverImage ? (
          <Image src={finalCoverImage} alt={trip.title} fill priority className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black" />
        )}
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Content Layer */}
      <div className="animate-in fade-in slide-in-from-bottom-8 relative z-10 mx-auto w-full max-w-7xl space-y-6 px-6 duration-1000">
        <div className="flex flex-wrap items-center gap-4">
          <StatusBadge status={trip.status} />
          <span className="text-sm font-black tracking-[0.3em] uppercase opacity-80">
            {trip.durationDays} Days Expedition
          </span>
        </div>

        <div className="flex items-start justify-between">
          <h1 className="text-5xl leading-[0.8] font-black tracking-tighter uppercase italic md:text-7xl lg:text-8xl">
            {trip.title}
          </h1>
          <div className="hidden pt-4 md:block">
            <HeartButton
              tripId={trip.id}
              size={32}
              checkStatus
              className="bg-white/10 hover:bg-white/20"
            />
          </div>
        </div>

        <div className="flex w-fit flex-wrap items-center gap-8 border-t border-white/20 pt-4">
          <div className="space-y-1">
            <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase">
              Location
            </p>
            <p className="text-xl font-bold tracking-tight uppercase italic">{trip.location}</p>
          </div>
          <div className="space-y-1">
            <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase">
              Difficulty
            </p>
            <p className="text-xl font-bold tracking-tight uppercase italic">{trip.difficulty}</p>
          </div>
          <div className="space-y-1">
            <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase">
              Starts From
            </p>
            <p className="text-xl font-bold tracking-tight uppercase italic">₹{trip.price}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
