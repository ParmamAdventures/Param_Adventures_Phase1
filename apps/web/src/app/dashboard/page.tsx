"use client";

import React from "react";
import ProtectedRoute from "../../components/ProtectedRoute";

import AuthStatus from "../../components/AuthStatus";

export default function Page() {
  return (
    <ProtectedRoute>
      <div style={{ padding: 20 }}>
        <AuthStatus />
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard. This page is protected.</p>
      </div>
    </ProtectedRoute>
  );
}
