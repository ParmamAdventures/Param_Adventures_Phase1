"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

/**
 * PermissionRoute - Route protection/access control component.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Protected content
 * @param {string|string[]} [props.requiredRole] - Required role(s)
 * @param {Function} [props.fallback] - Fallback component
 * @returns {React.ReactElement} Protected route component
 */
export default function PermissionRoute({
  permission,
  children,
}: {
  permission: string | string[];
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading) {
      if (!user) router.replace("/login");
      else {
        const perms: string[] = (user as { permissions?: string[] } | null)?.permissions || [];
        
        const hasPermission = Array.isArray(permission) 
          ? permission.some(p => perms.includes(p))
          : perms.includes(permission);

        if (!hasPermission) router.replace("/dashboard");
      }
    }
  }, [isLoading, user, permission, router]);

  if (isLoading) return <p>Loading...</p>;
  if (!user) return null;

  const perms: string[] = (user as { permissions?: string[] } | null)?.permissions || [];
  const hasPermission = Array.isArray(permission) 
    ? permission.some(p => perms.includes(p))
    : perms.includes(permission);

  if (!hasPermission) return null;

  return <>{children}</>;
}
