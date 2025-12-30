"use client";

import { useState } from "react";
import Button from "../ui/Button";
import CroppedImageUploader from "../media/CroppedImageUploader";
import { DocumentUploader } from "../media/DocumentUploader";
import { GalleryUploader } from "../media/GalleryUploader";
import DynamicList from "../ui/DynamicList";
import ItineraryBuilder from "./ItineraryBuilder";
import { Select } from "../ui/Select";
import FormattedDateInput from "../ui/FormattedDateInput";

export type TripFormData = {
  title: string;
  slug: string;
  location: string;
  startPoint: string;
  endPoint: string;
  durationDays: number;
  difficulty: string;
  category: "TREK" | "CAMPING" | "CORPORATE" | "EDUCATIONAL" | "SPIRITUAL" | "CUSTOM";
  price: number;
  capacity: number;
  description: string;
  startDate: string;
  endDate: string;
  coverImageId?: string | null;
  heroImageId?: string | null;
  gallery?: { id: string, thumbUrl: string }[];
  itinerary: any[];
  itineraryPdf?: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: any; // Simplified for now
  thingsToPack: string[];
  faqs: { question: string; answer: string }[];
  seasons: string[];
  altitude: string;
  distance: string;
  isFeatured: boolean;
  managerId?: string | null;
  guides?: { guide: { id: string; name: string; email: string } }[];
};

type TripFormProps = {
  initialData?: Partial<TripFormData>;
  onSubmit: (data: TripFormData) => Promise<void>;
  submitting: boolean;
};

const TABS = ["Overview", "Itinerary", "Logistics", "Inclusions & Policies", "Extras"];

export default function TripForm({
  initialData,
  onSubmit,
  submitting,
}: TripFormProps) {
  const [activeTab, setActiveTab] = useState("Overview");

  // Initialize all fields safely
  const [form, setForm] = useState<TripFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    location: initialData?.location || "",
    startPoint: initialData?.startPoint || "",
    endPoint: initialData?.endPoint || "",
    durationDays: initialData?.durationDays || 1,
    difficulty: initialData?.difficulty || "Easy",
    category: (initialData?.category as any) || "TREK",
    price: initialData?.price || 0,
    capacity: initialData?.capacity || 10,
    description: initialData?.description || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
  coverImageId: initialData?.coverImageId || null,
    heroImageId: initialData?.heroImageId || null,
    gallery: initialData?.gallery || [],
    itinerary: Array.isArray(initialData?.itinerary) ? initialData.itinerary : [],
    itineraryPdf: initialData?.itineraryPdf || "",
    highlights: (initialData?.highlights as string[]) || [],
    inclusions: (initialData?.inclusions as string[]) || [],
    exclusions: (initialData?.exclusions as string[]) || [],
    cancellationPolicy: initialData?.cancellationPolicy || {},
    thingsToPack: (initialData?.thingsToPack as string[]) || [],
    faqs: (initialData?.faqs as any[]) || [],
    seasons: (initialData?.seasons as string[]) || [],
    altitude: initialData?.altitude || "",
    distance: initialData?.distance || "",
    isFeatured: initialData?.isFeatured || false,
    managerId: initialData?.managerId || null,
    guides: initialData?.guides || [],
  });

  function update<K extends keyof TripFormData>(key: K, value: TripFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Ensure properly formatted data for optional fields
    const payload = {
        ...form,
        itineraryPdf: form.itineraryPdf || undefined, // Send undefined if empty
        gallery: form.gallery?.map((img, index) => ({ ...img, order: index })) // Ensure structured gallery
    };
    await onSubmit(payload);
  }

  const labelClass = "block text-sm font-semibold mb-2 text-foreground";
  const inputClass = "w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground";

  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-xl border border-border">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={form.isFeatured}
                  onChange={(e) => update("isFeatured", e.target.checked)}
                  className="w-5 h-5 text-primary rounded border-input bg-background"
                />
                <div>
                    <label htmlFor="isFeatured" className="font-bold text-foreground cursor-pointer">Mark as Featured Adventure</label>
                    <p className="text-xs text-muted-foreground">Featured trips appear on the homepage hero section.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Trip Title</label>
                <input className={inputClass} value={form.title} onChange={(e) => update("title", e.target.value)} required placeholder="e.g. Kedarkantha Trek" />
              </div>
              <div>
                <label className={labelClass}>URL Slug</label>
                <input className={inputClass} value={form.slug} onChange={(e) => update("slug", e.target.value)} required placeholder="kedarkantha-trek" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div>
                    <label className={labelClass}>Category</label>
                    <Select 
                        value={form.category} 
                        onChange={(val) => update("category", val as any)}
                        options={[
                            { value: "TREK", label: "Trekking" },
                            { value: "CAMPING", label: "Camping" },
                            { value: "SPIRITUAL", label: "Spiritual / Pilgrim" },
                            { value: "CORPORATE", label: "Corporate Outing" },
                            { value: "EDUCATIONAL", label: "Educational Trip" },
                            { value: "CUSTOM", label: "Custom / Other" },
                        ]}
                    />
                </div>
                <div>
                    <label className={labelClass}>Difficulty</label>
                    <Select 
                        value={form.difficulty} 
                        onChange={(val) => update("difficulty", val)}
                        options={[
                            { value: "Easy", label: "Easy" },
                            { value: "Moderate", label: "Moderate" },
                            { value: "Difficult", label: "Difficult" },
                            { value: "Challenging", label: "Challenging" },
                        ]}
                    />
                </div>
                 <div>
                    <label className={labelClass}>Max Capacity</label>
                    <input type="number" className={inputClass} value={form.capacity} onChange={(e) => update("capacity", Number(e.target.value))} min={1} />
                </div>
            </div>

            <div>
                <label className={labelClass}>Description / Overview</label>
                <textarea 
                    className={`${inputClass} min-h-[120px]`}
                    value={form.description} 
                    onChange={(e) => update("description", e.target.value)} 
                    placeholder="Brief overview of the entire journey..."
                />
            </div>

            <div>
                 <label className={labelClass}>Highlights</label>
                 <DynamicList 
                    items={form.highlights} 
                    onChange={(items) => update("highlights", items)} 
                    placeholder="Add a highlight (e.g. 'Summit at 12,500ft')"
                 />
            </div>
            
            <div className="pt-4 border-t border-border grid md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>
                        Cover Image (Card)
                        <span className="text-xs font-normal text-muted-foreground ml-2">Ratio 16:9</span>
                    </label>
                    <CroppedImageUploader 
                        id="cover-upload"
                        onUpload={(img) => update("coverImageId", img.id)} 
                        label={form.coverImageId ? "Replace Cover Image" : "Upload Cover"}
                        aspectRatio={16/9}
                    />
                </div>
                <div>
                    <label className={labelClass}>
                        Hero Banner (Header)
                        <span className="text-xs font-normal text-muted-foreground ml-2">Wide 21:9</span>
                    </label>
                    <CroppedImageUploader 
                        id="hero-upload"
                        onUpload={(img) => update("heroImageId", img.id)} 
                        label={form.heroImageId ? "Replace Hero Banner" : "Upload Hero Banner"}
                        aspectRatio={21/9}
                    />
                </div>
            </div>
          </div>
        );

      case "Itinerary":
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                     <label className={labelClass}>
                        Itinerary PDF
                        <span className="text-muted-foreground font-normal ml-2 text-xs">(Optional)</span>
                     </label>
                     <DocumentUploader 
                        label="Upload Detailed Itinerary (PDF)"
                        existingUrl={form.itineraryPdf || undefined} 
                        onUpload={(url) => update("itineraryPdf", url)} 
                     />
                     <p className="text-xs text-muted-foreground mt-2">
                        Upload the full day-by-day itinerary PDF for users to download.
                     </p>
                </div>
            </div>
            
            <div className="border-t border-border pt-6">
                <ItineraryBuilder 
                    days={form.itinerary} 
                    onChange={(days) => update("itinerary", days)} 
                    disabled={submitting} 
                />
            </div>
            
             <div className="pt-4 border-t border-border">
                <label className={labelClass}>Gallery Photos</label>
                <GalleryUploader images={form.gallery || []} onChange={(imgs) => update("gallery", imgs)} />
            </div>
          </div>
        );

      case "Logistics":
        return (
             <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Start Point</label>
                        <input className={inputClass} value={form.startPoint} onChange={(e) => update("startPoint", e.target.value)} placeholder="e.g. Dehradun / Bangalore" />
                    </div>
                    <div>
                        <label className={labelClass}>End Point</label>
                        <input className={inputClass} value={form.endPoint} onChange={(e) => update("endPoint", e.target.value)} placeholder="e.g. Sankri / Bangalore" />
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <label className={labelClass}>Region / Location</label>
                        <input className={inputClass} value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. Karnataka" />
                    </div>
                     <div>
                        <label className={labelClass}>Max Altitude</label>
                        <input className={inputClass} value={form.altitude} onChange={(e) => update("altitude", e.target.value)} placeholder="e.g. 12,500 ft" />
                    </div>
                     <div>
                        <label className={labelClass}>Total Distance</label>
                        <input className={inputClass} value={form.distance} onChange={(e) => update("distance", e.target.value)} placeholder="e.g. 24 km" />
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    <div>
                        <label className={labelClass}>Price (₹)</label>
                         <input type="number" className={inputClass} value={form.price} onChange={(e) => update("price", Number(e.target.value))} />
                    </div>
                    <div>
                         <label className={labelClass}>Start Date</label>
                         <FormattedDateInput className={inputClass} value={form.startDate} onChange={(val) => {
                             const newStart = val;
                             update("startDate", newStart);
                             if (newStart && form.endDate) {
                                 const start = new Date(newStart);
                                 const end = new Date(form.endDate);
                                 const diffTime = end.getTime() - start.getTime();
                                 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                 if (diffDays > 0) update("durationDays", diffDays);
                             }
                         }} />
                    </div>
                    <div>
                         <label className={labelClass}>End Date</label>
                        <FormattedDateInput className={inputClass} value={form.endDate} onChange={(val) => {
                            const newEnd = val;
                            update("endDate", newEnd);
                            if (form.startDate && newEnd) {
                                const start = new Date(form.startDate);
                                const end = new Date(newEnd);
                                const diffTime = end.getTime() - start.getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                if (diffDays > 0) update("durationDays", diffDays);
                            }
                        }} />
                    </div>
                    <div>
                        <label className={labelClass}>
                           Duration (Days)
                           <span className="ml-1 text-[10px] text-muted-foreground font-normal">(Auto-calc)</span>
                        </label>
                        <input 
                           type="number" 
                           className={`${inputClass} bg-muted/50 cursor-not-allowed`} 
                           value={form.durationDays} 
                           disabled // Read-only as it's calculated
                           readOnly
                        />
                    </div>
                 </div>
             </div>
        );

      case "Inclusions & Policies":
        return (
             <div className="grid md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                <div>
                     <h3 className="font-bold text-lg mb-4 text-emerald-600 dark:text-emerald-400">Inclusions</h3>
                     <DynamicList items={form.inclusions} onChange={(i) => update("inclusions", i)} placeholder="Add inclusion..." />
                </div>
                 <div>
                     <h3 className="font-bold text-lg mb-4 text-red-600 dark:text-red-400">Exclusions</h3>
                     <DynamicList items={form.exclusions} onChange={(i) => update("exclusions", i)} placeholder="Add exclusion..." />
                </div>
                 <div className="md:col-span-2 pt-6 border-t border-border">
                      <h3 className="font-bold text-lg mb-4 text-foreground">Cancellation Policy</h3>
                      <p className="text-sm text-muted-foreground mb-2">Detailed text about cancellation terms.</p>
                       <textarea 
                        className={`${inputClass} min-h-[150px]`}
                        value={typeof form.cancellationPolicy === 'string' ? form.cancellationPolicy : JSON.stringify(form.cancellationPolicy, null, 2)} 
                        onChange={(e) => update("cancellationPolicy", e.target.value)} 
                        placeholder="Paste policy text here..."
                    />
                 </div>
             </div>
        );

        case "Extras":
            return (
                 <div className="space-y-8 animate-in fade-in duration-300">
                    <div>
                        <label className={labelClass}>Things to Pack</label>
                        <DynamicList items={form.thingsToPack} onChange={(i) => update("thingsToPack", i)} placeholder="e.g. Warm jacket, Sunscreen..." />
                    </div>
                    
                    <div>
                        <label className={labelClass}>Best Seasons</label>
                        <DynamicList items={form.seasons} onChange={(i) => update("seasons", i)} placeholder="e.g. Winter, Spring" />
                    </div>
                 </div>
            )

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
      {/* Tabs Header */}
      <div className="flex border-b border-border bg-muted/20 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-8 min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-muted/20 border-t border-border flex items-center justify-between sticky bottom-0 z-10 backdrop-blur-sm">
        <div className="text-sm text-muted-foreground font-medium hidden md:block">
            {activeTab !== "Overview" && <button type="button" onClick={() => setActiveTab(TABS[TABS.indexOf(activeTab) - 1])} className="hover:underline hover:text-foreground transition-colors">← Back</button>}
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            {activeTab !== "Extras" ? (
                 <Button type="button" onClick={() => setActiveTab(TABS[TABS.indexOf(activeTab) + 1])} variant="subtle" className="flex-1 md:flex-none">
                    Next Step → 
                 </Button>
            ) : (
                <span />
            )}
            
            <Button 
                loading={submitting} 
                disabled={submitting} 
                variant="primary"
                className="flex-1 md:flex-none shadow-lg shadow-indigo-200 md:min-w-[200px]"
            >
                {submitting ? "Saving..." : (initialData?.title ? "Update Adventure" : "Launch Adventure")}
            </Button>
        </div>
      </div>
    </form>
  );
}
