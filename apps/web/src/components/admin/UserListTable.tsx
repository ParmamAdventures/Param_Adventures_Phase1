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

  const handleUpdateStatus = async (userId: string, status: string) => {
    let reason = "";
    if (status !== "ACTIVE") {
      reason = prompt("Provide a reason for this action:") || "";
      if (!reason && status === "BANNED") {
        alert("A reason is required for banning.");
        return;
      }
    }

    setActionLoading(userId);
    try {
      const res = await apiFetch(`/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });
      if (res.ok) onRefresh();
      else alert("Failed to update status");
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to DELETE this user? They will be banned and marked as deleted.")) return;

    setActionLoading(userId);
    try {
        const res = await apiFetch(`/admin/users/${userId}`, { method: "DELETE" });
        if (res.ok) onRefresh();
        else alert("Failed to delete user");
    } catch (e) {
        console.error(e);
        alert("Error deleting user");
    } finally {
        setActionLoading(null);
    }
  };

  const handleSuspend = async (userId: string) => {
    const reason = prompt("Reason for suspension (optional):");
    if (reason === null) return; // Cancelled

    setActionLoading(userId);
    try {
        const res = await apiFetch(`/admin/users/${userId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "SUSPENDED", reason })
        });
        if (res.ok) onRefresh();
        else alert("Failed to suspend user");
    } catch (e) {
        console.error(e);
        alert("Error suspending user");
    } finally {
        setActionLoading(null);
    }
  };

  const handleRestore = async (userId: string) => {
      setActionLoading(userId);
      try {
          const res = await apiFetch(`/admin/users/${userId}/unsuspend`, { method: "PATCH" });
          if (res.ok) onRefresh();
      } catch (e) {
          console.error(e);
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
              const isSuspendedOrBanned = u.status === "SUSPENDED" || u.status === "BANNED";
              const isDeleted = u.status === "BANNED" && u.statusReason === "DELETED_BY_ADMIN";

              return (
                <tr key={u.id} className={`hover:bg-muted/5 transition-colors ${isDeleted ? "opacity-50 grayscale" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground flex items-center gap-2">
                        {u.name || "Unnamed"}
                        {isDeleted && <span className="text-[10px] bg-red-100 text-red-800 px-1 rounded border border-red-200">DELETED</span>}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {u.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={u.status} />
                      {u.statusReason && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]" title={u.statusReason}>
                          {u.statusReason}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {/* ... roles ... */}
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
                    <div className="flex flex-col gap-2">
                      {/* Role Assignment */}
                      {myPerms.includes("user:assign-role") && !isMe && !isDeleted && (
                        <div className="flex items-center gap-2">
                          <select
                            className="h-8 w-full rounded border border-input bg-transparent px-2 text-xs focus:ring-1 focus:ring-accent"
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
                        </div>
                      )}
                      
                      {/* Status Actions */}
                      <div className="flex items-center gap-2">
                          {/* Suspend / Restore (user:edit) */}
                          {myPerms.includes("user:edit") && !isMe && !isDeleted && (
                             <>
                                {isSuspendedOrBanned ? (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 text-xs px-2 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                                        onClick={() => handleRestore(u.id)}
                                        disabled={isProcessing}
                                        title="Restore Access"
                                    >
                                        Restore
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 text-xs px-2 text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
                                        onClick={() => handleSuspend(u.id)}
                                        disabled={isProcessing}
                                        title="Suspend User"
                                    >
                                        Suspend
                                    </Button>
                                )}
                             </>
                          )}

                          {/* Delete (user:delete) */}
                          {myPerms.includes("user:delete") && !isMe && !isDeleted && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs px-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                onClick={() => handleDelete(u.id)}
                                disabled={isProcessing}
                                title="Delete User"
                              >
                                  Delete
                              </Button>
                          )}
                      </div>
                    </div>
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
