"use client";

import React, { useState } from "react";
import { User } from "../../types/auth";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useRoles } from "../../hooks/useRoles";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import Spinner from "../ui/Spinner";
import { Select } from "../ui/Select";

type Props = {
  users: User[];
  loading: boolean;
  onRefresh: () => void;
};

export default function UserListTable({ users, loading, onRefresh }: Props) {
  const { user: currentUser } = useAuth();
  const { roles } = useRoles();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const myRoles = currentUser?.roles || [];
  const myPerms = currentUser?.permissions || [];

  const handleAssignRole = async (userId: string, roleName: string) => {
    if (!roleName) return;
    if (!confirm(`Assign role ${roleName}?`)) return;

    setActionLoading(userId);
    try {
      await apiFetch("/admin/roles/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleName }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("Failed to assign role");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeRole = async (userId: string, roleName: string) => {
    if (!confirm(`Remove role ${roleName}?`)) return;

    setActionLoading(userId);
    try {
      await apiFetch("/admin/roles/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleName }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("Failed to remove role");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
        <Spinner size={24} />
        <p>Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center border rounded-xl border-dashed bg-muted/20">
        <p className="text-muted-foreground">No users found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Roles</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => {
              const isMe = currentUser?.id === u.id;
              const isProcessing = actionLoading === u.id;

              return (
                <tr key={u.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {u.name || "Unnamed"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {u.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {u.roles.length > 0 ? (
                        u.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded text-xs font-medium text-secondary-foreground border border-secondary"
                          >
                            {role}
                            {myPerms.includes("user:remove-role") &&
                              !isMe &&
                              (role !== "SUPER_ADMIN" ||
                                myRoles.includes("SUPER_ADMIN")) && (
                                <button
                                  onClick={() => handleRevokeRole(u.id, role)}
                                  className="ml-1 text-muted-foreground hover:text-destructive transition-colors focus:outline-none"
                                  disabled={isProcessing}
                                  title="Remove role"
                                >
                                  &times;
                                </button>
                              )}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs italic">
                          No roles
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {myPerms.includes("user:assign-role") && !isMe && (
                      <div className="flex items-center gap-2">
                        <select
                          className="h-8 max-w-[140px] rounded border border-input bg-transparent px-2 text-xs focus:ring-1 focus:ring-accent"
                          onChange={(e) => {
                            handleAssignRole(u.id, e.target.value);
                            e.target.value = ""; // Reset
                          }}
                          disabled={isProcessing}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            + Add Role
                          </option>
                          {roles
                            .filter(
                              (r) =>
                                !u.roles.includes(r.name) &&
                                (!r.isSystem || myRoles.includes("SUPER_ADMIN"))
                            )
                            .map((r) => (
                              <option key={r.id} value={r.name}>
                                {r.name}
                              </option>
                            ))}
                        </select>
                        {isProcessing && <Spinner size={12} />}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
