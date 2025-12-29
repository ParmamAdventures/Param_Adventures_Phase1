"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/Dialog";
import { Button } from "../../ui/Button";
import { apiFetch } from "@/lib/api";
import Spinner from "../../ui/Spinner";
import { User, Check } from "lucide-react";

type Props = {
  tripId: string | null;
  onClose: () => void;
  onSuccess: () => void;
};

type Guide = {
  id: string;
  name: string;
  email: string;
  avatarImage?: {
    thumbUrl: string;
  };
};

export default function AssignGuideModal({ tripId, onClose, onSuccess }: Props) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) return;

    const fetchGuides = async () => {
      try {
        const res = await apiFetch("/admin/trip-assignments/eligible-users?role=TRIP_GUIDE");
        if (res.ok) {
          const data = await res.json();
          setGuides(data);
        }
      } catch (error) {
        console.error("Failed to fetch guides", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, [tripId]);

  const handleAssign = async () => {
    if (!tripId || !selectedGuideId) return;

    setAssigning(true);
    try {
      const res = await apiFetch(`/admin/trip-assignments/${tripId}/guide`, {
        method: "POST",
        body: JSON.stringify({ guideId: selectedGuideId }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert("Failed to assign guide");
      }
    } catch (error) {
      console.error("Failed to assign guide", error);
      alert("Network error");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={!!tripId} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Trip Guide</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <Spinner size={24} />
            </div>
          ) : guides.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">No eligible guides found.</p>
          ) : (
            <div className="grid gap-2">
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  onClick={() => setSelectedGuideId(guide.id)}
                  className={`
                    flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
                    ${selectedGuideId === guide.id 
                      ? "border-accent bg-accent/5 ring-1 ring-accent" 
                      : "border-border hover:border-accent/50 hover:bg-muted/50"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {guide.avatarImage ? (
                        <img src={guide.avatarImage.thumbUrl} alt={guide.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} className="text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{guide.name}</p>
                      <p className="text-xs text-muted-foreground">{guide.email}</p>
                    </div>
                  </div>
                  {selectedGuideId === guide.id && <Check size={18} className="text-accent" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={assigning}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAssign} 
            disabled={assigning || !selectedGuideId}
          >
            {assigning ? "Assigning..." : "Assign Guide"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
