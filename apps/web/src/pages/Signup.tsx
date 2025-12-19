"use client";

import React, { useState } from "react";
import { apiFetch } from "../lib/api";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import ErrorBlock from "../components/ui/ErrorBlock";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await apiFetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      setError("Registration failed");
      setLoading(false);
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
        disabled={loading}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      {error && <ErrorBlock>{error}</ErrorBlock>}

      <Button loading={loading}>Create account</Button>
    </form>
  );
}
