"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../../lib/api";
import { Button } from "../ui/Button";
import Spinner from "../ui/Spinner";
import { useToast } from "../ui/ToastProvider";

interface User {
  id: string;
  name: string;
  email: string;
}

interface TripAssignmentManagerProps {
  tripId: string;
  currentManagerId?: string | null;
  currentGuides?: { guide: User }[];
  onUpdate?: () => void;
}

export default function TripAssignmentManager({ 
  tripId, 
  currentManagerId, 
  currentGuides = [],
  onUpdate 
}: TripAssignmentManagerProps) {
  const [managers, setManagers] = useState<User[]>([]);
  const [guides, setGuides] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, gRes] = await Promise.all([
        apiFetch("/admin/trip-assignments/eligible-users?role=TRIP_MANAGER"),
        apiFetch("/admin/trip-assignments/eligible-users?role=TRIP_GUIDE")
      ]);

      if (mRes.ok) setManagers(await mRes.json());
      if (gRes.ok) setGuides(await gRes.json());
    } catch (error) {
      console.error("Failed to fetch assignment data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignManager = async (managerId: string) => {
    setSaving(true);
    try {
      const res = await apiFetch(`/admin/trip-assignments/${tripId}/manager`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId })
      });
      if (res.ok) {
        showToast("Manager assigned successfully", "success");
        onUpdate?.();
      } else {
        const error = await res.json();
        showToast(error.message || "Failed to assign manager", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignGuide = async (guideId: string) => {
    setSaving(true);
    try {
      const res = await apiFetch(`/admin/trip-assignments/${tripId}/guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId })
      });
      if (res.ok) {
        showToast("Guide assigned successfully", "success");
        onUpdate?.();
      } else {
        const error = await res.json();
        showToast(error.message || "Failed to assign guide", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveGuide = async (guideId: string) => {
    setSaving(true);
    try {
      const res = await apiFetch(`/admin/trip-assignments/${tripId}/guide/${guideId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast("Guide removed successfully", "success");
        onUpdate?.();
      } else {
        const error = await res.json();
        showToast(error.message || "Failed to remove guide", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size={24} />;

  return (
    <div className="space-y-8 bg-card border rounded-2xl p-6 shadow-sm">
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Trip Manager</h3>
        <p className="text-sm text-muted-foreground">The person responsible for overall trip logistics.</p>
        
        <div className="flex items-center gap-4">
          <select 
            className="flex-1 bg-muted border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={currentManagerId || ""}
            onChange={(e) => handleAssignManager(e.target.value)}
            disabled={saving}
          >
            <option value="">Select a Manager</option>
            {managers.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
            ))}
          </select>
          {currentManagerId && (
            <div className="text-xs font-medium text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full">
              Assigned
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">On-site Guides</h3>
          <span className="text-xs text-muted-foreground">{currentGuides.length} assigned</span>
        </div>
        
        <div className="space-y-3">
          {currentGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentGuides.map(({ guide }) => (
                <div key={guide.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{guide.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{guide.email}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={() => handleRemoveGuide(guide.id)}
                    disabled={saving}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No guides assigned yet.</p>
          )}

          <div className="flex items-center gap-2 pt-2">
            <select 
              className="flex-1 bg-muted border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              value=""
              onChange={(e) => handleAssignGuide(e.target.value)}
              disabled={saving}
            >
              <option value="">Add a Guide...</option>
              {guides
                .filter(g => !currentGuides.some(cg => cg.guide.id === g.id))
                .map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.email})</option>
              ))}
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}
