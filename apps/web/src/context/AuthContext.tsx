"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch, setAccessToken, getAccessToken } from "../lib/api";
import { User } from "../types/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * React component for UI presentation and user interaction.
 * @param {Object} props - Component props
 * @returns {React.ReactElement} Component element
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      try {
        // Try to refresh first (refresh token is cookie-based). If a
        // refresh cookie exists the backend should return a new access token.
        try {
          const r = await apiFetch("/auth/refresh", { method: "POST" });
          if (r.ok) {
            const d = await r.json();
            const data = d.data || d;
            if (data?.accessToken) setAccessToken(data.accessToken);
          }
        } catch {
          // ignore refresh errors
        }

        // If no token after refresh attempt, we are guest. Don't call /auth/me to avoid 401 noise.
        const token = getAccessToken();
        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const res = await apiFetch("/auth/me");
        if (res.ok) {
          const d = await res.json();
          setUser(d.data || d);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    hydrate();
  }, []);

  async function login(email: string, password: string) {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      const errorMsg =
        typeof data.error === "object"
          ? data.error.message
          : data.message || data.error || "Login failed";
      throw new Error(errorMsg);
    }

    const d = await res.json();
    const data = d.data || d;
    setAccessToken(data.accessToken);
    setUser(data.user);
  }

  async function logout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }
  async function refreshUser() {
    try {
      const res = await apiFetch("/auth/me");
      if (res.ok) {
        const d = await res.json();
        setUser(d.data || d);
      }
    } catch (e) {
      console.error("Failed to refresh user", e);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>{children}</AuthContext.Provider>
  );
}

/**
 * React component for UI presentation and user interaction.
 * @param {Object} props - Component props
 * @returns {React.ReactElement} Component element
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
