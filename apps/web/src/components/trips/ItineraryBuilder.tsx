import { useState } from "react";
import Button from "../ui/Button";
import DynamicList from "../ui/DynamicList";
import {
  Coffee,
  Utensils,
  Moon,
  Truck,
  MapPin,
  ChevronDown,
  ChevronUp,
  Trash2,
  Cookie,
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

type ItineraryBuilderProps = {
  days: ItineraryDay[];
  onChange: (days: ItineraryDay[]) => void;
  disabled?: boolean;
};

/**
 * ItineraryBuilder - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export default function ItineraryBuilder({ days = [], onChange, disabled }: ItineraryBuilderProps) {
  const [expandedDays, setExpandedDays] = useState<number[]>([1]); // Default first day expanded

  const addDay = () => {
    const nextDayCounter = days.length + 1;
    const newDay: ItineraryDay = {
      day: nextDayCounter,
      title: "",
      description: "",
      activities: [],
      meals: { breakfast: true, lunch: true, dinner: true, snacks: false },
      accommodation: "",
      distance: "",
      travelTime: "",
    };
    onChange([...days, newDay]);
    setExpandedDays([nextDayCounter]); // Expand the new day
  };

  const updateDay = (index: number, field: keyof ItineraryDay, value: any) => {
    const newDays = [...days];
    newDays[index] = { ...newDays[index], [field]: value };
    onChange(newDays);
  };

  const updateMeals = (
    index: number,
    meal: keyof NonNullable<ItineraryDay["meals"]>,
    value: boolean,
  ) => {
    console.log(`[ItineraryBuilder] Updating meal day ${index + 1}: ${meal} = ${value}`);
    const newDays = [...days];
    const currentMeals = newDays[index].meals || {
      breakfast: false,
      lunch: false,
      dinner: false,
      snacks: false,
    };
    newDays[index] = {
      ...newDays[index],
      meals: { ...currentMeals, [meal]: value },
    };
    onChange(newDays);
  };

  const removeDay = (index: number) => {
    const newDays = days.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 }));
    onChange(newDays);
  };

  const toggleExpand = (dayNum: number) => {
    setExpandedDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum],
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-border/50 flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-foreground text-xl font-bold">Day-by-Day Itinerary</h3>
          <p className="text-muted-foreground text-sm">Detail the journey for your adventurers.</p>
        </div>
        <Button
          onClick={addDay}
          type="button"
          variant="primary"
          disabled={disabled}
          className="rounded-full px-6"
        >
          + Add Day {days.length + 1}
        </Button>
      </div>

      <div className="space-y-4">
        {days.map((day, index) => {
          const isExpanded = expandedDays.includes(day.day);

          return (
            <div
              key={index}
              className={`overflow-hidden rounded-2xl border transition-all duration-300 ${isExpanded ? "border-primary/30 bg-card shadow-primary/5 shadow-xl" : "border-border bg-muted/10 hover:border-primary/20"} `}
            >
              {/* Header */}
              <div
                className={`flex cursor-pointer items-center gap-4 p-4 transition-colors select-none ${isExpanded ? "bg-primary/5" : "hover:bg-muted/20"}`}
                onClick={() => toggleExpand(day.day)}
              >
                <div className="bg-primary shadow-primary/20 flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black text-white shadow-lg">
                  {day.day}
                </div>

                <div className="min-w-0 flex-1">
                  {isExpanded ? (
                    <input
                      value={day.title}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateDay(index, "title", e.target.value)}
                      placeholder="Day Title (e.g. Arrival in Manali)"
                      className="text-foreground placeholder:text-muted-foreground/50 w-full border-none bg-transparent p-0 text-lg font-bold outline-none focus:ring-0"
                      disabled={disabled}
                    />
                  ) : (
                    <h4 className="text-foreground truncate text-lg font-bold">
                      {day.title || `Day ${day.day}: Untitled`}
                    </h4>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDay(index);
                    }}
                    className="text-muted-foreground rounded-lg p-2 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                    disabled={disabled}
                    title="Delete Day"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="text-muted-foreground p-1">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              {/* Body */}
              {isExpanded && (
                <div className="animate-in slide-in-from-top-2 space-y-6 p-6 pt-2 duration-300">
                  {/* Common Row */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <label className="text-muted-foreground mb-2 block text-xs font-black tracking-wider uppercase">
                          Description
                        </label>
                        <textarea
                          value={day.description}
                          onChange={(e) => updateDay(index, "description", e.target.value)}
                          placeholder="What happens on this day? Be descriptive..."
                          className="border-border focus:border-primary bg-background text-foreground min-h-[140px] w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none"
                          disabled={disabled}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-muted-foreground mb-2 block text-xs font-black tracking-wider uppercase">
                            Accommodation
                          </label>
                          <div className="relative">
                            <Moon
                              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                              size={16}
                            />
                            <input
                              className="border-border bg-background w-full rounded-lg border py-2 pr-4 pl-10 text-sm"
                              value={day.accommodation}
                              onChange={(e) => updateDay(index, "accommodation", e.target.value)}
                              placeholder="e.g. Luxury Tent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-muted-foreground mb-2 block text-xs font-black tracking-wider uppercase">
                            Travel Info
                          </label>
                          <div className="relative">
                            <Truck
                              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                              size={16}
                            />
                            <input
                              className="border-border bg-background w-full rounded-lg border py-2 pr-4 pl-10 text-sm"
                              value={day.distance}
                              onChange={(e) => updateDay(index, "distance", e.target.value)}
                              placeholder="e.g. 5km / 2hrs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <DynamicList
                        label="Daily Activities"
                        items={day.activities || []}
                        onChange={(items) => updateDay(index, "activities", items)}
                        placeholder="Add activity (e.g. Forest Walk)"
                      />

                      <div className="bg-muted/30 border-border/50 rounded-xl border p-4">
                        <label className="text-muted-foreground mb-3 block text-xs font-black tracking-wider uppercase">
                          Meals Included
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="border-border/50 hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-colors">
                            <input
                              type="checkbox"
                              className="border-input text-primary accent-primary h-5 w-5 rounded"
                              checked={day.meals?.breakfast || false}
                              onChange={(e) => updateMeals(index, "breakfast", e.target.checked)}
                            />
                            <div className="text-foreground flex items-center gap-2">
                              <Coffee size={18} className="text-muted-foreground" />
                              <span className="text-sm font-semibold">Breakfast</span>
                            </div>
                          </label>

                          <label className="border-border/50 hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-colors">
                            <input
                              type="checkbox"
                              className="border-input text-primary accent-primary h-5 w-5 rounded"
                              checked={day.meals?.lunch || false}
                              onChange={(e) => updateMeals(index, "lunch", e.target.checked)}
                            />
                            <div className="text-foreground flex items-center gap-2">
                              <Utensils size={18} className="text-muted-foreground" />
                              <span className="text-sm font-semibold">Lunch</span>
                            </div>
                          </label>

                          <label className="border-border/50 hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-colors">
                            <input
                              type="checkbox"
                              className="border-input text-primary accent-primary h-5 w-5 rounded"
                              checked={day.meals?.snacks || false}
                              onChange={(e) => updateMeals(index, "snacks", e.target.checked)}
                            />
                            <div className="text-foreground flex items-center gap-2">
                              <Cookie size={18} className="text-muted-foreground" />
                              <span className="text-sm font-semibold">Snacks</span>
                            </div>
                          </label>

                          <label className="border-border/50 hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-colors">
                            <input
                              type="checkbox"
                              className="border-input text-primary accent-primary h-5 w-5 rounded"
                              checked={day.meals?.dinner || false}
                              onChange={(e) => updateMeals(index, "dinner", e.target.checked)}
                            />
                            <div className="text-foreground flex items-center gap-2">
                              <Utensils size={18} className="text-muted-foreground rotate-12" />
                              <span className="text-sm font-semibold">Dinner</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {days.length === 0 && (
          <div className="border-border bg-muted/5 group hover:bg-muted/10 rounded-3xl border-2 border-dashed p-12 text-center transition-colors">
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-transform group-hover:scale-110">
              <MapPin className="text-muted-foreground" size={32} />
            </div>
            <h4 className="text-foreground mb-2 text-xl font-bold">Build Your Journey</h4>
            <p className="text-muted-foreground mx-auto mb-6 max-w-xs text-sm">
              Click below to start adding day-by-day details of your adventure.
            </p>
            <Button
              onClick={addDay}
              type="button"
              variant="primary"
              className="shadow-primary/20 rounded-full px-8 shadow-lg"
            >
              Start Building
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
