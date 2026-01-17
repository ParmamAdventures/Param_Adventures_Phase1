"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";

/**
 * AuthStatus - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export default function AuthStatus() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) return <p>Loading session...</p>;
  if (!user) return <p>Not logged in</p>;

  return (
    <div>
      <p>Logged in as {user.email}</p>
      <Button variant="ghost" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}
