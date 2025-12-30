import Image from "next/image";
import StatusBadge from "../ui/StatusBadge";
import HeartButton from "./HeartButton";

export default function TripHero({ trip }: { trip: any }) {
  // Helper to format local image paths
  const getImageUrl = (image: any) => {
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
  const legacyImage = trip.image; // Legacy might be a full string

  // Prioritize Hero -> Cover -> Legacy
  const finalCoverImage = heroImage || coverImage || legacyImage;

  return (
    <div className="relative w-full h-[60vh] min-h-[500px] flex items-end pb-12 overflow-hidden text-white bg-slate-900">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {finalCoverImage ? (
          <Image
            src={finalCoverImage}
            alt={trip.title}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black" />
        )}
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-wrap items-center gap-4">
          <StatusBadge status={trip.status} />
          <span className="text-sm font-black uppercase tracking-[0.3em] opacity-80">
            {trip.durationDays} Days Expedition
          </span>
        </div>


        <div className="flex justify-between items-start">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter uppercase leading-[0.8]">
              {trip.title}
            </h1>
            <div className="hidden md:block pt-4">
                <HeartButton tripId={trip.id} size={32} checkStatus className="bg-white/10 hover:bg-white/20" />
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-white/20 w-fit">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Location</p>
            <p className="text-xl font-bold italic uppercase tracking-tight">{trip.location}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Difficulty</p>
            <p className="text-xl font-bold italic uppercase tracking-tight">{trip.difficulty}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Starts From</p>
            <p className="text-xl font-bold italic uppercase tracking-tight">₹{trip.price}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
