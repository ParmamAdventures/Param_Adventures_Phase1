"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import RoleCard from "../../../components/admin/RoleCard";
import Spinner from "../../../components/ui/Spinner";
import ErrorBlock from "../../../components/ui/ErrorBlock";
import { useToast } from "../../../components/ui/ToastProvider";

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
          />
        ))}
      </div>

      {roles.length === 0 && (
        <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-dashed border-[var(--border)]">
          <p className="text-muted-foreground italic font-medium">No roles identified in the system core.</p>
        </div>
      )}
    </div>
  );
}
