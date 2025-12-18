"use client";

import React from "react";
import { apiFetch, setAccessToken } from "../../lib/api";

export default function AuthTest() {
  async function login() {
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test+1766053959.36329@example.com",
          password: "Password123!",
        }),
      });

      const data = await res.json();
      if (res.ok && data?.accessToken) {
        setAccessToken(data.accessToken);
        console.log("Access token set:", data.accessToken);
      } else {
        console.error("Login failed", data);
      }
    } catch (e) {
      console.error("Login error", e);
    }
  }

  async function me() {
    try {
      const res = await apiFetch("/auth/me");
      const data = await res.json();
      console.log("ME:", data);
    } catch (e) {
      console.error("ME error", e);
    }
  }

  async function logout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      setAccessToken(null);
      console.log("Logged out");
    } catch (e) {
      console.error("Logout error", e);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Auth Test</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={login}>Login</button>
        <button onClick={me}>Call /auth/me</button>
        <button onClick={logout}>Logout</button>
      </div>
      <p style={{ marginTop: 12 }}>
        Open DevTools → Network and Application (Cookies) to inspect tokens.
      </p>
    </div>
  );
}
