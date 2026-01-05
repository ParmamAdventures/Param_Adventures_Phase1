"use client";

import { useState } from "react";


import {
  MapPin,
  Clock,
  Tent,
  Utensils,
  Coffee,
  Cookie,
  ChevronDown,
} from "lucide-react";

type ItineraryDay = {
  day: number;
  title: string;
  description: string;
  activities?: string[];
  meals?: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    snacks: boolean;
  };
  accommodation?: string;
  distance?: string;
  travelTime?: string;
};

export default function TripItinerary({ itinerary }: { itinerary: any }) {
  const days = (Array.isArray(itinerary) ? itinerary : itinerary?.days || []) as ItineraryDay[];
  const [openDay, setOpenDay] = useState<number | null>(null);

  if (!days || days.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Itinerary</h2>
      <div className="space-y-4">
        {days.map((day) => (
          <div
            key={day.day}
            className={`overflow-hidden rounded-xl border transition-all ${
              openDay === day.day
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <button
              onClick={() => setOpenDay(openDay === day.day ? null : day.day)}
              className="flex w-full items-start gap-4 p-4 text-left md:p-6"
            >
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border text-lg font-bold transition-colors ${
                  openDay === day.day
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/50 text-foreground border-border hover:bg-secondary"
                }`}
              >
                {day.day}
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-foreground text-lg font-bold">{day.title}</h3>
                {openDay !== day.day && (
                  <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                    {day.distance && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {day.distance}
                      </span>
                    )}
                    {day.accommodation && (
                      <span className="flex items-center gap-1">
                        <Tent size={12} /> {day.accommodation}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div
                className={`mt-1 transition-transform duration-300 ${openDay === day.day ? "rotate-180" : ""}`}
              >
                <ChevronDown className="text-muted-foreground" size={20} />
              </div>
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                openDay === day.day ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="space-y-6 p-6 pt-0">
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {day.description}
                  </div>

                  {/* Rich Details Grid */}
                  <div className="bg-background/50 grid gap-4 rounded-xl border p-4 text-sm md:grid-cols-2">
                    {/* Logistics */}
                    <div className="space-y-3">
                      {day.distance && (
                        <div className="flex items-center gap-3">
                          <MapPin className="text-primary" size={16} />
                          <div>
                            <p className="text-muted-foreground text-xs font-bold uppercase">
                              Travel Info
                            </p>
                            <p className="font-medium">{day.distance}</p>
                          </div>
                        </div>
                      )}
                      {day.accommodation && (
                        <div className="flex items-center gap-3">
                          <Tent className="text-primary" size={16} />
                          <div>
                            <p className="text-muted-foreground text-xs font-bold uppercase">
                              Accommodation
                            </p>
                            <p className="font-medium">{day.accommodation}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meals */}
                    {day.meals && Object.values(day.meals).some(Boolean) && (
                      <div className="space-y-2">
                         <p className="text-muted-foreground text-xs font-bold uppercase">
                            Meals Included
                          </p>
                          <div className="flex flex-wrap gap-2">
                             {day.meals.breakfast && (
                                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                                   <Coffee size={12} /> Breakfast
                                </span>
                             )}
                              {day.meals.lunch && (
                                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                                   <Utensils size={12} /> Lunch
                                </span>
                             )}
                              {day.meals.snacks && (
                                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                                   <Cookie size={12} /> Snacks
                                </span>
                             )}
                              {day.meals.dinner && (
                                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                                   <Utensils size={12} className="rotate-12" /> Dinner
                                </span>
                             )}
                          </div>
                      </div>
                    )}
                  </div>
                   
                   {/* Activities */}
                   {day.activities && day.activities.length > 0 && (
                      <div>
                         <p className="text-muted-foreground mb-2 text-xs font-bold uppercase">
                            Highlights & Activities
                          </p>
                          <ul className="space-y-1">
                             {day.activities.map((act, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                   <span className="bg-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                                   {act}
                                </li>
                             ))}
                          </ul>
                      </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
