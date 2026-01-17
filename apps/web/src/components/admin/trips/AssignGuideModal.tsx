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

/**
 * AssignGuideModal - Modal dialog component for user interactions.
 * @param {Object} props - Component props
 * @param {boolean} [props.isOpen] - Whether modal is open
 * @param {Function} [props.onClose] - Callback when modal closes
 * @param {string} [props.title] - Modal title
 * @param {React.ReactNode} [props.children] - Modal content
 * @returns {React.ReactElement} Modal component
 */
export default function AssignGuideModal({ tripId, onClose, onSuccess }: Props) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(false);
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

        <div className="max-h-[60vh] space-y-4 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Spinner size={24} />
            </div>
          ) : guides.length === 0 ? (
            <p className="text-muted-foreground p-4 text-center">No eligible guides found.</p>
          ) : (
            <div className="grid gap-2">
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  onClick={() => setSelectedGuideId(guide.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                    selectedGuideId === guide.id
                      ? "border-accent bg-accent/5 ring-accent ring-1"
                      : "border-border hover:border-accent/50 hover:bg-muted/50"
                  } `}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
                      {guide.avatarImage ? (
                        <img
                          src={guide.avatarImage.thumbUrl}
                          alt={guide.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{guide.name}</p>
                      <p className="text-muted-foreground text-xs">{guide.email}</p>
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
          <Button variant="primary" onClick={handleAssign} disabled={assigning || !selectedGuideId}>
            {assigning ? "Assigning..." : "Assign Guide"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

