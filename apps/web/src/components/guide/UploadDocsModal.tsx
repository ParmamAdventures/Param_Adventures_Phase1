"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { apiFetch } from "../../lib/api";
import { Loader2, UploadCloud, Link as LinkIcon, FileText } from "lucide-react";
import CroppedImageUploader from "../media/CroppedImageUploader";
import { DocumentUploader } from "../media/DocumentUploader";

interface UploadDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  onSuccess: () => void;
}

const DOC_TYPES = [
    { value: "GROUP_PHOTO", label: "Group Photo" },
    { value: "EXPENSE_REPORT", label: "Expense Report" },
    { value: "INCIDENT_LOG", label: "Incident Log" },
    { value: "OTHER", label: "Other" }
];

export default function UploadDocsModal({ isOpen, onClose, tripId, onSuccess }: UploadDocsModalProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("GROUP_PHOTO");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    try {
      const res = await apiFetch(`/trips/${tripId}/docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, url, description }),
      });
      
      if (res.ok) {
        onSuccess();
        onClose();
        // Reset form
        setUrl("");
        setDescription("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Trip Documentation</DialogTitle>
          <DialogDescription>Submit proofs, logs, or photos for this trip.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Document Type</label>
                <div className="grid grid-cols-2 gap-2">
                    {DOC_TYPES.map(t => (
                        <div 
                            key={t.value}
                            onClick={() => setType(t.value)}
                            className={`cursor-pointer px-3 py-2 rounded-lg border text-sm flex items-center justify-center transition-all ${type === t.value ? 'bg-accent text-white border-accent' : 'bg-background border-border hover:border-accent/50'}`}
                        >
                            {t.label}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Upload File</label>
                
                {(type === "GROUP_PHOTO" || type === "OTHER") ? (
                     <CroppedImageUploader 
                        label="Upload Photo" 
                        onUpload={(uploadedUrl) => setUrl(uploadedUrl)} 
                     />
                ) : (
                     <DocumentUploader 
                        label="Upload PDF Report" 
                        onUpload={(uploadedUrl) => setUrl(uploadedUrl)} 
                     />
                )}
            </div>

            {/* Hidden URL input for debug or manual override if needed, but removed for clean UX */}

            <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <textarea 
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
                    rows={2}
                    placeholder="Any details about this document..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading || !url} className="gap-2">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                    Submit Document
                </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
