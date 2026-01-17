"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { apiFetch } from "../../lib/api";
import { Loader2, CheckCircle2, FileText, ExternalLink, Image as ImageIcon } from "lucide-react";

interface ReviewDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: any;
  onSuccess: () => void;
}

export default function ReviewDocsModal({
  isOpen,
  onClose,
  trip,
  onSuccess,
}: ReviewDocsModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const docs = (trip.documentation as any[]) || [];

  const handleComplete = async () => {
    if (!confirm("Are you sure you want to close this trip? This will mark it as Completed."))
      return;

    setIsLoading(true);
    try {
      const res = await apiFetch(`/trips/${trip.id}/complete`, {
        method: "POST",
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Trip Documentation Review</DialogTitle>
          <DialogDescription>
            Review proofs submitted by guides before closing the trip.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-6">
          {docs.length === 0 ? (
            <div className="bg-muted/30 border-muted-foreground/20 rounded-xl border border-dashed p-8 text-center">
              <p className="text-muted-foreground italic">No documentation uploaded yet.</p>
            </div>
          ) : (
            <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto p-1 sm:grid-cols-2">
              {docs.map((doc, idx) => (
                <div
                  key={idx}
                  className="group flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 transition-colors hover:border-[var(--accent)]"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                    {doc.type?.includes("PHOTO") ? <ImageIcon size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{doc.type || "Document"}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1 text-[10px] text-blue-500 hover:underline"
                    >
                      View File <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="text-muted-foreground self-center text-xs">
            Review all docs carefully.
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Close Review
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isLoading ? (
                <Loader2 className="mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2" size={16} />
              )}
              {trip.status === "COMPLETED" ? "Sync Bookings Status" : "Approve & Complete Trip"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

