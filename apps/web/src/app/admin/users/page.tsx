"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { useRoles } from "../../../hooks/useRoles";

type User = {
  id: string;
  email: string;
  name?: string | null;
  roles?: string[];
  status?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, loading: authLoading } = useAuth();
  const { roles } = useRoles();

  useEffect(() => {
    let mounted = true;
    apiFetch("/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (mounted) setUsers(data || []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || authLoading) return <p>Loading users...</p>;

  const myRoles: string[] =
    (currentUser as { roles?: string[] } | null)?.roles || [];
  const myPerms: string[] =
    (currentUser as { permissions?: string[] } | null)?.permissions || [];

  return (
    <div>
      <h2>Users</h2>

      <table border={1} cellPadding={6} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Status</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.name ?? "-"}</td>
              <td>{u.status ?? "-"}</td>
              <td>
                {(u.roles || []).length === 0 ? (
                  "-"
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 12 }}>
                    {(u.roles || []).map((role) => (
                      <li key={role}>
                        {role}
                        {myPerms.includes("user:remove-role") &&
                          currentUser?.id !== u.id &&
                          (role !== "SUPER_ADMIN" ||
                            myRoles.includes("SUPER_ADMIN")) && (
                            <button
                              style={{ marginLeft: 8 }}
                              onClick={async () => {
                                if (
                                  !confirm(
                                    `Remove role ${role} from ${u.email}?`
                                  )
                                )
                                  return;
                                await apiFetch("/admin/roles/revoke", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    userId: u.id,
                                    roleName: role,
                                  }),
                                });
                                window.location.reload();
                              }}
                            >
                              ❌
                            </button>
                          )}
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td>
                {myPerms.includes("user:assign-role") &&
                  currentUser?.id !== u.id && (
                    <select
                      defaultValue=""
                      onChange={async (e) => {
                        const roleName = e.target.value;
                        if (!roleName) return;
                        if (!confirm(`Assign role ${roleName} to ${u.email}?`))
                          return;
                        await apiFetch("/admin/roles/assign", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ userId: u.id, roleName }),
                        });
                        window.location.reload();
                      }}
                    >
                      <option value="">Assign role</option>
                      {roles
                        .filter(
                          (r) =>
                            !(u.roles || []).includes(r.name) &&
                            (!r.isSystem || myRoles.includes("SUPER_ADMIN"))
                        )
                        .map((r) => (
                          <option key={r.id} value={r.name}>
                            {r.name}
                          </option>
                        ))}
                    </select>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
