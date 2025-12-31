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
            (typeof errData.error === "object" ? errData.error.message : errData.error) ||
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
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground pt-1">Manage system users and role assignments.</p>
        </div>
      </div>

      {error ? (
        <div className="border-destructive/50 bg-destructive/5 rounded-xl border border-dashed p-8 text-center">
          <p className="text-destructive font-medium">Failed to load users: {error}</p>
          <button
            onClick={() => fetchUsers()}
            className="mt-2 text-xs font-bold tracking-widest text-[var(--accent)] uppercase hover:underline"
          >
            Try Again ➔
          </button>
        </div>
      ) : (
        <UserListTable users={users} loading={loading} onRefresh={fetchUsers} />
      )}
    </div>
  );
}
