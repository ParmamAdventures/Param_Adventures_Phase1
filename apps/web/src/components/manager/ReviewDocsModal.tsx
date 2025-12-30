"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { apiFetch } from "../../lib/api";
import { Loader2, CheckCircle2, FileText, ExternalLink, Image as ImageIcon } from "lucide-react";

interface ReviewDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: any;
  onSuccess: () => void;
}

export default function ReviewDocsModal({ isOpen, onClose, trip, onSuccess }: ReviewDocsModalProps) {
  const [loading, setLoading] = useState(false);
  
  const docs = (trip.documentation as any[]) || [];

  const handleComplete = async () => {
    if (!confirm("Are you sure you want to close this trip? This will mark it as Completed.")) return;

    setLoading(true);
    try {
      const res = await apiFetch(`/trips/${trip.id}/complete`, {
        method: "POST"
      });
      
      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Trip Documentation Review</DialogTitle>
          <DialogDescription>Review proofs submitted by guides before closing the trip.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-4">
            {docs.length === 0 ? (
                <div className="p-8 text-center bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20">
                    <p className="text-muted-foreground italic">No documentation uploaded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                    {docs.map((doc, idx) => (
                        <div key={idx} className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-xl flex gap-3 group hover:border-[var(--accent)] transition-colors">
                            <div className="w-12 h-12 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0">
                                {doc.type?.includes("PHOTO") ? <ImageIcon size={20} /> : <FileText size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{doc.type || "Document"}</p>
                                <p className="text-xs text-muted-foreground truncate">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                <a 
                                    href={doc.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 mt-1"
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
            <div className="text-xs text-muted-foreground self-center">
                Review all docs carefully.
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>Close Review</Button>
                <Button onClick={handleComplete} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" size={16} />}
                    {trip.status === "COMPLETED" ? "Sync Bookings Status" : "Approve & Complete Trip"}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
