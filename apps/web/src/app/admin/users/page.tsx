"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

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

  if (loading) return <p>Loading users...</p>;

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
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.name ?? "-"}</td>
              <td>{u.status ?? "-"}</td>
              <td>{(u.roles || []).join(", ") || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
