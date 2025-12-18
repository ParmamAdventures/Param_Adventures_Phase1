import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export type Role = {
  id: string;
  name: string;
  isSystem: boolean;
  permissions?: string[];
};

export function useRoles() {
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

  return { roles, loading };
}
