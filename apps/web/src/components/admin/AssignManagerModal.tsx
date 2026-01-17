import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { apiFetch } from "../../lib/api";
import Spinner from "../ui/Spinner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tripId: string | null;
  tripTitle?: string;
  onSuccess: () => void;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  avatarImage?: { thumbUrl: string };
}

/**
 * AssignManagerModal - Modal dialog component for user interactions.
 * @param {Object} props - Component props
 * @param {boolean} [props.isOpen] - Whether modal is open
 * @param {Function} [props.onClose] - Callback when modal closes
 * @param {string} [props.title] - Modal title
 * @param {React.ReactNode} [props.children] - Modal content
 * @returns {React.ReactElement} Modal component
 */
export default function AssignManagerModal({
  isOpen,
  onClose,
  tripId,
  tripTitle,
  onSuccess,
}: Props) {
  const [query, setQuery] = useState("");
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Fetch eligible managers
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // We need an endpoint for this, or reuse users list with role filter.
      // For now, assuming we have a specialized endpoint or generic user search
      // Since we don't have a perfect "list managers" endpoint yet, let's use the generic User List endpoint with a query param if supported,
      // OR filtering on client side if the list is small.
      // BETTER: Create a focused endpoint or just search.
      // Let's assume we can search users and filter by role or the backend handles it.
      // Actually, we have `getUsers` controller.
      // Fetch all users and filter client-side to include Admins and Trip Managers
      // Use dedicated endpoint/filter for TRIP_MANAGER
      apiFetch(`/admin/users?role=TRIP_MANAGER`)
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setManagers(Array.isArray(data) ? data : []);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  const filteredManagers = managers.filter(
    (m) =>
      m.name?.toLowerCase().includes(query.toLowerCase()) ||
      m.email.toLowerCase().includes(query.toLowerCase()),
  );

  const handleAssign = async () => {
    if (!tripId || !selectedManagerId) return;
    setAssigning(true);
    try {
      const res = await apiFetch(`/admin/trip-assignments/${tripId}/manager`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId: selectedManagerId }),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert("Failed to assign manager");
      }
    } catch (e) {
      console.error(e);
      alert("Error assigning manager");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Manager to {tripTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input
            placeholder="Search Managers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="max-h-[200px] space-y-2 overflow-y-auto rounded-md border p-2">
            {isLoading ? (
              <Spinner size={20} />
            ) : filteredManagers.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">No managers found.</p>
            ) : (
              filteredManagers.map((manager) => (
                <div
                  key={manager.id}
                  onClick={() => setSelectedManagerId(manager.id)}
                  className={`flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors ${selectedManagerId === manager.id ? "bg-primary/10 border-primary border" : "hover:bg-muted"}`}
                >
                  <div className="bg-muted h-8 w-8 overflow-hidden rounded-full">
                    {manager.avatarImage ? (
                      <img
                        src={manager.avatarImage.thumbUrl}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-300 text-[10px] font-bold">
                        {manager.name?.[0] || "M"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{manager.name || "No Name"}</p>
                    <p className="text-muted-foreground truncate text-xs">{manager.email}</p>
                  </div>
                  {selectedManagerId === manager.id && <div className="text-primary">✓</div>}
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            loading={assigning}
            disabled={!selectedManagerId}
          >
            Assign Manager
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
