"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await apiFetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      // Always show success message for security reasons (email enumeration protection)
      setMessage(data.message || "If an account exists, a reset link has been sent.");
      setEmail("");
    } catch (err) {
      // Fallback error, though API usually returns success
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm transition-colors"
          >
            <ArrowLeft size={14} className="mr-2" /> Back to Login
          </Link>
          <h1 className="text-3xl font-black tracking-tight">Forgot Password?</h1>
          <p className="text-muted-foreground mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {message ? (
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-center text-sm text-green-600 dark:text-green-400">
            <p className="mb-2 font-bold">Check your inbox</p>
            <p>{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-2.5 left-3 h-5 w-5" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border focus:ring-accent/50 focus:border-accent w-full rounded-lg border py-2 pr-4 pl-10 transition-all focus:ring-2 focus:outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {error && (
              <div className="rounded bg-red-500/10 p-2 text-xs font-bold text-red-500">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
