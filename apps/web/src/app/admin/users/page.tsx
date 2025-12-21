"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../../../lib/api";
import { User } from "../../../types/auth";
import UserListTable from "../../../components/admin/UserListTable";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(() => {
    let mounted = true;
    setLoading(true);
    apiFetch("/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (mounted) setUsers(data || []);
      })
      .catch((e) => {
        console.error("Failed to fetch users", e);
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

      <UserListTable
        users={users}
        loading={loading}
        onRefresh={fetchUsers}
      />
    </div>
  );
}
