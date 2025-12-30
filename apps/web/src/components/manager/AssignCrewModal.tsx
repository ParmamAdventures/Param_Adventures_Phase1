"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { apiFetch } from "../../lib/api";
import { Loader2, Search, UserPlus, Check, Trash2, X } from "lucide-react";
import Image from "next/image";

interface AssignCrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string | null;
  onSuccess: () => void;
  currentGuides?: any[]; // Already assigned guides
}

export default function AssignCrewModal({ isOpen, onClose, tripId, onSuccess, currentGuides = [] }: AssignCrewModalProps) {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchEligibleGuides();
    }
  }, [isOpen]);

  const fetchEligibleGuides = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/admin/trip-assignments/eligible-users?role=TRIP_GUIDE");
      if (res.ok) {
        const data = await res.json();
        setGuides(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (guideId: string) => {
    if (!tripId) return;
    setAssigningId(guideId);
    try {
      const res = await apiFetch(`/admin/trip-assignments/${tripId}/guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId }),
      });
      if (res.ok) {
        onSuccess(); // Refresh parent
        // Just remove from local list or mark assigned?? Parent refresh handles it
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAssigningId(null);
    }
  };

  const handleRemove = async (guideId: string) => {
     if (!tripId) return;
     setAssigningId(guideId); 
     try {
         const res = await apiFetch(`/admin/trip-assignments/${tripId}/guide/${guideId}`, {
             method: "DELETE"
         });
         if (res.ok) {
             onSuccess();
         }
     } catch (e) {
         console.error(e);
     } finally {
         setAssigningId(null);
     }
  }

  // Filter guides: Exclude those already assigned (handled by visual check mostly)
  const availableGuides = guides.filter(g => 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make Crew Assignments</DialogTitle>
          <DialogDescription>Assign Guides to this trip.</DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
                type="text" 
                placeholder="Search guides by name..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
             {/* Current Assignments */}
             {currentGuides.length > 0 && (
                 <div className="space-y-2">
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned</p>
                     {currentGuides.map((item: any) => (
                         <div key={item.guide.id} className="flex items-center justify-between p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                                     {item.guide.name[0]}
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-sm font-medium text-foreground">{item.guide.name}</span>
                                     <span className="text-xs text-muted-foreground">{item.guide.email}</span>
                                 </div>
                             </div>
                             <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                onClick={() => handleRemove(item.guide.id)}
                                disabled={assigningId === item.guide.id}
                             >
                                 {assigningId === item.guide.id ? <Loader2 className="animate-spin" size={14} /> : <X size={16} />}
                             </Button>
                         </div>
                     ))}
                 </div>
             )}

            <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available Guides</p>
                {loading ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : availableGuides.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No guides found.</p>
                ) : (
                    availableGuides
                        .filter(g => !currentGuides.some(cg => cg.guide.id === g.id))
                        .map((guide) => (
                        <div key={guide.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/5 border border-transparent hover:border-border transition-all">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                                     {guide.name[0]}
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-sm font-medium text-foreground">{guide.name}</span>
                                     <span className="text-xs text-muted-foreground">{guide.email}</span>
                                 </div>
                             </div>
                             <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleAssign(guide.id)}
                                disabled={assigningId === guide.id}
                                className="h-8 gap-1"
                             >
                                 {assigningId === guide.id ? <Loader2 className="animate-spin" size={14} /> : <><UserPlus size={14} /> Add</>}
                             </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
