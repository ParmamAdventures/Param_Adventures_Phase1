"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthStatus() {
  const { user, loading, logout } = useAuth();

  if (loading) return <p>Loading session...</p>;
  if (!user) return <p>Not logged in</p>;

  return (
    <div>
      <p>Logged in as {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
