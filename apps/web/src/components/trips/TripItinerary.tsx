"use client";

import { useState } from "react";

type ItineraryDay = {
  day: number;
  title: string;
  description: string;
};

export default function TripItinerary({ itinerary }: { itinerary: any }) {
  const days = (Array.isArray(itinerary) ? itinerary : []) as ItineraryDay[];
  const [openDay, setOpenDay] = useState<number | null>(null);

  if (!days || days.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Itinerary</h2>
      <div className="space-y-4">
        {days.map((day) => (
          <div 
            key={day.day} 
            className={`border rounded-xl transition-all overflow-hidden ${
                openDay === day.day ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <button
              onClick={() => setOpenDay(openDay === day.day ? null : day.day)}
              className="w-full flex items-start text-left gap-4 p-4 md:p-6"
            >
              <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg font-bold text-lg transition-colors border ${
                  openDay === day.day 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-secondary/50 text-foreground border-border hover:bg-secondary"
              }`}>
                {day.day}
              </div>
              <div className="flex-1 pt-1">
                <h3 className="font-bold text-lg text-foreground">{day.title}</h3>
                {openDay !== day.day && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {day.description}
                    </p>
                )}
              </div>
              <div className={`mt-1 transition-transform duration-300 ${openDay === day.day ? "rotate-180" : ""}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </button>
            
            <div className={`grid transition-all duration-300 ease-in-out ${
                openDay === day.day ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}>
              <div className="overflow-hidden">
                <div className="p-6 pt-0 text-muted-foreground leading-relaxed">
                  {day.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
