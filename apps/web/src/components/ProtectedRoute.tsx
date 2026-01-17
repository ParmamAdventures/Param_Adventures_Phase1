"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute - Route protection/access control component.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Protected content
 * @param {string|string[]} [props.requiredRole] - Required role(s)
 * @param {Function} [props.fallback] - Fallback component
 * @returns {React.ReactElement} Protected route component
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) return <p>Loading...</p>;
  if (!user) return null; // redirecting

  return <>{children}</>;
}
