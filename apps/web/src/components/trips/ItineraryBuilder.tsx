"use client";

import { useState } from "react";
import Button from "../ui/Button";

type ItineraryDay = {
  day: number;
  title: string;
  description: string;
  activities?: string[];
  meals?: string[];
};

type ItineraryBuilderProps = {
  days: ItineraryDay[];
  onChange: (days: ItineraryDay[]) => void;
  disabled?: boolean;
};

export default function ItineraryBuilder({ days = [], onChange, disabled }: ItineraryBuilderProps) {
  const addDay = () => {
    const nextDay = days.length + 1;
    onChange([
      ...days,
      {
        day: nextDay,
        title: "",
        description: "",
        activities: [],
      },
    ]);
  };

  const updateDay = (index: number, field: keyof ItineraryDay, value: any) => {
    const newDays = [...days];
    newDays[index] = { ...newDays[index], [field]: value };
    onChange(newDays);
  };

  const removeDay = (index: number) => {
    const newDays = days.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 }));
    onChange(newDays);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-foreground">Detailed Itinerary</label>
        <Button onClick={addDay} type="button" variant="subtle" disabled={disabled} className="text-sm h-8">
          + Add Day {days.length + 1}
        </Button>
      </div>

      <div className="space-y-4">
        {days.map((day, index) => (
          <div key={index} className="border border-border rounded-xl p-4 bg-muted/20 relative group">
            <div className="flex gap-4 mb-3">
              <div className="flex md:w-16 h-10 shrink-0 items-center justify-center bg-primary/10 text-primary font-bold rounded-lg text-sm">
                Day {day.day}
              </div>
              <input
                value={day.title}
                onChange={(e) => updateDay(index, "title", e.target.value)}
                placeholder="Day Title (e.g. Arrival in Manali)"
                className="flex-1 px-3 py-2 border border-input rounded-lg outline-none focus:border-primary font-semibold bg-background text-foreground"
                disabled={disabled}
              />
              <button
                type="button"
                onClick={() => removeDay(index)}
                className="text-muted-foreground hover:text-red-500 p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                disabled={disabled}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
            
            <textarea
              value={day.description}
              onChange={(e) => updateDay(index, "description", e.target.value)}
              placeholder="Describe the activities, travel, and experiences for this day..."
              className="w-full px-3 py-2 border border-input rounded-lg outline-none focus:border-primary min-h-[80px] text-sm bg-background text-foreground"
              disabled={disabled}
            />
          </div>
        ))}

        {days.length === 0 && (
          <div className="text-center p-8 border-2 border-dashed border-border rounded-xl bg-muted/10">
             <p className="text-muted-foreground text-sm mb-4">No itinerary added yet.</p>
             <Button onClick={addDay} type="button" variant="subtle">Start Building Itinerary</Button>
          </div>
        )}
      </div>
    </div>
  );
}
