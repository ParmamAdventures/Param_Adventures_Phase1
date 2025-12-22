"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import RoleCard from "../../../components/admin/RoleCard";
import Spinner from "../../../components/ui/Spinner";
import ErrorBlock from "../../../components/ui/ErrorBlock";
import { useToast } from "../../../components/ui/ToastProvider";
import Modal from "../../../components/ui/Modal";
import { useAuth } from "../../../context/AuthContext";

type Role = {
  id: string;
  name: string;
  isSystem: boolean;
  permissions: string[];
};

const ALL_SYSTEM_PERMISSIONS = [
  "trip:create", "trip:edit", "trip:view:internal", "trip:approve", "trip:publish", "trip:archive", "trip:submit",
  "blog:create", "blog:update", "blog:submit", "blog:approve", "blog:reject",
  "booking:create", "booking:approve", "booking:reject",
  "role:list", "role:assign", "role:revoke",
  "user:list",
  "media:upload", "media:view", "media:delete",
  "audit:view"
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const isSuperAdmin = user?.roles?.includes("SUPER_ADMIN");

  useEffect(() => {
    let mounted = true;
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/admin/roles");
        if (!res.ok) throw new Error("Failed to fetch roles");
        const data = await res.json();
        if (mounted) setRoles(data || []);
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
          showToast(err.message, "error");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRoles();
    return () => {
      mounted = false;
    };
  }, [showToast]);

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingRole) {
      setSelectedPermissions(editingRole.permissions);
    } else {
      setSelectedPermissions([]);
    }
  }, [editingRole]);

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSavePermissions = async () => {
    if (!editingRole) return;
    try {
      setIsSaving(true);
      const res = await apiFetch(`/admin/roles/${editingRole.id}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: selectedPermissions }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update role permissions");
      }
      
      showToast("Role permissions updated successfully", "success");
      setEditingRole(null);
      // Refresh roles
      const refreshRes = await apiFetch("/admin/roles");
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setRoles(data || []);
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <Spinner size={32} />
        <p className="text-muted-foreground animate-pulse font-medium">Analyzing security clusters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl py-12">
        <ErrorBlock>{error}</ErrorBlock>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] hover:underline"
        >
          Retry Connection ➔
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[var(--accent)] font-bold tracking-widest uppercase text-xs">Access Control</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground text-lg font-medium">Manage system-wide access levels and security protocols.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {roles.map((role) => (
          <RoleCard 
            key={role.id} 
            role={role} 
            allSystemPermissions={ALL_SYSTEM_PERMISSIONS}
            onConfigure={isSuperAdmin ? setEditingRole : undefined} 
          />
        ))}
      </div>

      {roles.length === 0 && (
        <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-dashed border-[var(--border)]">
          <p className="text-muted-foreground italic font-medium">No roles identified in the system core.</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingRole && (
        <Modal
          isOpen={!!editingRole}
          onClose={() => setEditingRole(null)}
          title={`Edit Permissions: ${editingRole.name}`}
          className="max-w-4xl"
          footer={
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setEditingRole(null)}
                className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePermissions}
                disabled={isSaving}
                className="px-6 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-bold shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          }
        >
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Select the permissions to assign to this role. System constraints apply.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_SYSTEM_PERMISSIONS.map((perm) => {
                const isSelected = selectedPermissions.includes(perm);
                return (
                  <div 
                    key={perm}
                    onClick={() => togglePermission(perm)}
                    className={`
                      cursor-pointer rounded-xl border p-3 flex items-center gap-3 transition-all select-none
                      ${isSelected 
                        ? "bg-[var(--accent)]/5 border-[var(--accent)] shadow-sm text-[var(--accent)]" 
                        : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)]/50 text-muted-foreground"
                      }
                    `}
                  >
                    <div className={`
                      w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0
                      ${isSelected ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--border)] bg-[var(--background)]"}
                    `}>
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold font-mono truncate ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>{perm}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
