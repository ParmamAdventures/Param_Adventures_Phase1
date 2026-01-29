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
  // Trips
  "trip:create",
  "trip:edit",
  "trip:view:internal",
  "trip:approve",
  "trip:publish",
  "trip:archive",
  "trip:submit",
  "trip:assign-guide",
  "trip:assign-manager",
  "trip:update-status",
  // Blogs
  "blog:create",
  "blog:update",
  "blog:submit",
  "blog:approve",
  "blog:reject",
  "blog:publish",
  "blog:view:internal",
  // Bookings
  "booking:create",
  "booking:approve",
  "booking:reject",
  "booking:read:admin",
  "booking:cancel",
  // Roles (only SUPER_ADMIN)
  "role:list",
  "role:assign",
  "role:create",
  "role:update",
  "role:delete",
  // Users
  "user:list",
  "user:edit",
  "user:delete",
  "user:assign-role",
  "user:remove-role",
  // Media
  "media:upload",
  "media:view",
  "media:delete",
  "media:manage",
  // Analytics & Audit
  "analytics:view",
  "audit:view",
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  const isSuperAdmin = user?.roles?.includes("SUPER_ADMIN");

  useEffect(() => {
    let mounted = true;
    const fetchRoles = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch("/admin/roles");
        if (!res.ok) throw new Error("Failed to fetch roles");
        const data = await res.json();
        if (mounted) setRoles(data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch roles";
        if (mounted) {
          setError(message);
          showToast(message, "error");
        }
      } finally {
        if (mounted) setIsLoading(false);
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
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
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
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-4">
        <Spinner size={32} />
        <p className="text-muted-foreground animate-pulse font-medium">
          Analyzing security clusters...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl py-12">
        <ErrorBlock>{error}</ErrorBlock>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-[10px] font-bold tracking-widest text-(--accent) uppercase hover:underline"
        >
          Retry Connection ➔
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <span className="text-xs font-bold tracking-widest text-(--accent) uppercase">
            Access Control
          </span>
          <h1 className="from-foreground to-foreground/60 bg-linear-to-r bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-5xl">
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Manage system-wide access levels and security protocols.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            allSystemPermissions={ALL_SYSTEM_PERMISSIONS}
            onConfigure={isSuperAdmin ? setEditingRole : undefined}
            isSuperAdmin={isSuperAdmin}
          />
        ))}
      </div>

      {roles.length === 0 && (
        <div className="flex min-h-50 items-center justify-center rounded-3xl border border-dashed border-(--border)">
          <p className="text-muted-foreground font-medium italic">
            No roles identified in the system core.
          </p>
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
                className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={isSaving}
                className="rounded-xl bg-(--accent) px-6 py-2 text-sm font-bold text-white shadow-(--accent)/20 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-(--accent)/40 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          }
        >
          <div className="space-y-6">
            <p className="text-muted-foreground text-sm">
              Select the permissions to assign to this role. System constraints apply.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ALL_SYSTEM_PERMISSIONS.map((perm) => {
                const isSelected = selectedPermissions.includes(perm);
                return (
                  <div
                    key={perm}
                    onClick={() => togglePermission(perm)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all select-none ${
                      isSelected
                        ? "border-(--accent) bg-(--accent)/5 text-(--accent) shadow-sm"
                        : "text-muted-foreground border-(--border) bg-(--card) hover:border-(--accent)/50"
                    } `}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${isSelected ? "border-(--accent) bg-(--accent)" : "border-(--border) bg-(--background)"} `}
                    >
                      {isSelected && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`truncate font-mono text-xs font-bold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {perm}
                      </p>
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
