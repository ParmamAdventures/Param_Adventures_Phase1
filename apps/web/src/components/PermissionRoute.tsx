"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function PermissionRoute({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else {
        const perms: string[] = (user as { permissions?: string[] } | null)?.permissions || [];
        if (!perms.includes(permission)) router.replace("/dashboard");
      }
    }
  }, [loading, user, permission, router]);

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  const perms: string[] = (user as { permissions?: string[] } | null)?.permissions || [];
  if (!perms.includes(permission)) return null;

  return <>{children}</>;
}
