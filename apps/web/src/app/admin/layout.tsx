"use client";

import React from "react";
import Link from "next/link";
import PermissionRoute from "../../components/PermissionRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionRoute permission="user:list">
      <div style={{ padding: 16 }}>
        <h1>Admin Dashboard</h1>

        <nav style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <Link href="/admin/users">Users</Link>
          <Link href="/admin/roles">Roles</Link>
          <Link href="/trips/internal">Trips</Link>
        </nav>

        <hr />

        <div>{children}</div>
      </div>
    </PermissionRoute>
  );
}
