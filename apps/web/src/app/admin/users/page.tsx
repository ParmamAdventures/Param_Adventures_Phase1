"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../../../lib/api";
import { User } from "../../../types/auth";
import UserListTable from "../../../components/admin/UserListTable";
import { useToast } from "../../../components/ui/ToastProvider";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchUsers = useCallback(() => {
    let mounted = true;
    setLoading(true);

    apiFetch("/admin/users")
      .then(async (r) => {
        if (!r.ok) {
          const errData = await r.json().catch(() => ({}));
          const errMsg = 
            (typeof errData.error === 'object' ? errData.error.message : errData.error) || 
            errData.message || 
            `HTTP error! status: ${r.status}`;
          throw new Error(errMsg);
        }
        return r.json();
      })
      .then((data) => {
        if (mounted) {
          setUsers(Array.isArray(data) ? data : []);
          setError(null);
        }
      })
      .catch((e) => {
        console.error("Failed to fetch users", e);
        if (mounted) {
          setError(e.message);
          showToast(e.message, "error");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const cleanup = fetchUsers();
    return cleanup;
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Users
          </h1>
          <p className="text-muted-foreground pt-1">
            Manage system users and role assignments.
          </p>
        </div>
      </div>

      {error ? (
        <div className="p-8 text-center border rounded-xl border-dashed border-destructive/50 bg-destructive/5">
          <p className="text-destructive font-medium">Failed to load users: {error}</p>
          <button 
            onClick={() => fetchUsers()}
            className="mt-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:underline"
          >
            Try Again ➔
          </button>
        </div>
      ) : (
        <UserListTable
          users={users}
          loading={loading}
          onRefresh={fetchUsers}
        />
      )}
    </div>
  );
}
