import Image from "next/image";
import StatusBadge from "../ui/StatusBadge";

export default function TripHero({ trip }: { trip: any }) {
  const coverImage = trip.coverImage?.originalUrl || trip.image;

  return (
    <div className="relative w-full h-[60vh] min-h-[500px] flex items-end pb-12 overflow-hidden text-white">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={trip.title}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-wrap items-center gap-4">
          <StatusBadge status={trip.status} />
          <span className="text-sm font-black uppercase tracking-[0.3em] opacity-80">
            {trip.durationDays} Days Expedition
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter uppercase leading-[0.8]">
          {trip.title}
        </h1>

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
