"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

type Role = {
  id: string;
  name: string;
  isSystem: boolean;
  permissions: string[];
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiFetch("/admin/roles")
      .then((r) => r.json())
      .then((data) => {
        if (mounted) setRoles(data || []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p>Loading roles...</p>;

  return (
    <div>
      <h2>Roles</h2>

      {roles.map((r) => (
        <div key={r.id} style={{ marginBottom: 12 }}>
          <strong>
            {r.name} {r.isSystem && "(System)"}
          </strong>
          <ul>
            {(r.permissions || []).map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
