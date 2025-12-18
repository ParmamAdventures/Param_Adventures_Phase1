"use client";

import React, { useState } from "react";
import { apiFetch } from "../lib/api";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await apiFetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      setError("Registration failed");
      return;
    }

    setSuccess(true);
    // optional: redirect to login after a short delay
    setTimeout(() => router.push("/login"), 900);
  }

  if (success) {
    return <p>Registration successful. Redirecting to login...</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20 }}>
      <h1>Signup</h1>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button>Create account</button>
    </form>
  );
}
