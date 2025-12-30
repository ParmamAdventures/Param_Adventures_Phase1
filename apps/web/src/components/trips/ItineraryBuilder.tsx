import { useState } from "react";
import Button from "../ui/Button";
import DynamicList from "../ui/DynamicList";
import { Coffee, Utensils, Moon, Truck, MapPin, ChevronDown, ChevronUp, Trash2, Cookie } from "lucide-react";

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

  const updateMeals = (index: number, meal: keyof NonNullable<ItineraryDay["meals"]>, value: boolean) => {
    console.log(`[ItineraryBuilder] Updating meal day ${index + 1}: ${meal} = ${value}`);
    const newDays = [...days];
    const currentMeals = newDays[index].meals || { breakfast: false, lunch: false, dinner: false, snacks: false };
    newDays[index] = { 
      ...newDays[index], 
      meals: { ...currentMeals, [meal]: value } 
    };
    onChange(newDays);
  };

  const removeDay = (index: number) => {
    const newDays = days.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 }));
    onChange(newDays);
  };

  const toggleExpand = (dayNum: number) => {
    setExpandedDays(prev => 
      prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h3 className="text-xl font-bold text-foreground">Day-by-Day Itinerary</h3>
          <p className="text-sm text-muted-foreground">Detail the journey for your adventurers.</p>
        </div>
        <Button onClick={addDay} type="button" variant="primary" disabled={disabled} className="rounded-full px-6">
          + Add Day {days.length + 1}
        </Button>
      </div>

      <div className="space-y-4">
        {days.map((day, index) => {
          const isExpanded = expandedDays.includes(day.day);
          
          return (
            <div key={index} className={`
              border rounded-2xl transition-all duration-300 overflow-hidden
              ${isExpanded ? "border-primary/30 bg-card shadow-xl shadow-primary/5" : "border-border bg-muted/10 hover:border-primary/20"}
            `}>
              {/* Header */}
              <div 
                className={`p-4 flex items-center gap-4 cursor-pointer select-none transition-colors ${isExpanded ? "bg-primary/5" : "hover:bg-muted/20"}`}
                onClick={() => toggleExpand(day.day)}
              >
                <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-lg shadow-primary/20">
                  {day.day}
                </div>
                
                <div className="flex-1 min-w-0">
                  {isExpanded ? (
                    <input
                      value={day.title}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateDay(index, "title", e.target.value)}
                      placeholder="Day Title (e.g. Arrival in Manali)"
                      className="w-full bg-transparent border-none outline-none font-bold text-lg text-foreground placeholder:text-muted-foreground/50 p-0 focus:ring-0"
                      disabled={disabled}
                    />
                  ) : (
                    <h4 className="font-bold text-lg text-foreground truncate">
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
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                <div className="p-6 pt-2 space-y-6 animate-in slide-in-from-top-2 duration-300">
                  {/* Common Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 block">Description</label>
                        <textarea
                          value={day.description}
                          onChange={(e) => updateDay(index, "description", e.target.value)}
                          placeholder="What happens on this day? Be descriptive..."
                          className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary min-h-[140px] text-sm bg-background text-foreground transition-all"
                          disabled={disabled}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 block">Accommodation</label>
                          <div className="relative">
                            <Moon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input 
                              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-background"
                              value={day.accommodation}
                              onChange={(e) => updateDay(index, "accommodation", e.target.value)}
                              placeholder="e.g. Luxury Tent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 block">Travel Info</label>
                          <div className="relative">
                            <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input 
                              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-background"
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

                      <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3 block">Meals Included</label>
                        <div className="grid grid-cols-2 gap-3">
                           <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                               <input 
                                 type="checkbox" 
                                 className="w-5 h-5 rounded border-input text-primary accent-primary"
                                 checked={day.meals?.breakfast || false}
                                 onChange={(e) => updateMeals(index, "breakfast", e.target.checked)}
                               />
                               <div className="flex items-center gap-2 text-foreground">
                                 <Coffee size={18} className="text-muted-foreground" />
                                 <span className="text-sm font-semibold">Breakfast</span>
                               </div>
                           </label>

                           <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                               <input 
                                 type="checkbox" 
                                 className="w-5 h-5 rounded border-input text-primary accent-primary"
                                 checked={day.meals?.lunch || false}
                                 onChange={(e) => updateMeals(index, "lunch", e.target.checked)}
                               />
                               <div className="flex items-center gap-2 text-foreground">
                                 <Utensils size={18} className="text-muted-foreground" />
                                 <span className="text-sm font-semibold">Lunch</span>
                               </div>
                           </label>
                           
                           <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                               <input 
                                 type="checkbox" 
                                 className="w-5 h-5 rounded border-input text-primary accent-primary"
                                 checked={day.meals?.snacks || false}
                                 onChange={(e) => updateMeals(index, "snacks", e.target.checked)}
                               />
                               <div className="flex items-center gap-2 text-foreground">
                                 <Cookie size={18} className="text-muted-foreground" />
                                 <span className="text-sm font-semibold">Snacks</span>
                               </div>
                           </label>

                           <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                               <input 
                                 type="checkbox" 
                                 className="w-5 h-5 rounded border-input text-primary accent-primary"
                                 checked={day.meals?.dinner || false}
                                 onChange={(e) => updateMeals(index, "dinner", e.target.checked)}
                               />
                               <div className="flex items-center gap-2 text-foreground">
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
          <div className="text-center p-12 border-2 border-dashed border-border rounded-3xl bg-muted/5 group hover:bg-muted/10 transition-colors">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="text-muted-foreground" size={32} />
             </div>
             <h4 className="text-xl font-bold text-foreground mb-2">Build Your Journey</h4>
             <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">Click below to start adding day-by-day details of your adventure.</p>
             <Button onClick={addDay} type="button" variant="primary" className="rounded-full px-8 shadow-lg shadow-primary/20">
               Start Building
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}
