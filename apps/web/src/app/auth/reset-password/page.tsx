"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Lock } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="text-center">
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-600 dark:text-red-400">
          <p className="font-bold">Invalid Link</p>
          <p className="mt-1 text-sm">This password reset link is missing dependencies.</p>
        </div>
        <Link href="/auth/forgot-password">
          <Button variant="ghost">Request new link</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await apiFetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setMessage("Password successfully reset! You can now log in.");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (message) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-green-600">Password Reset!</h2>
        <p className="text-muted-foreground">You will be redirected to login shortly.</p>
        <Button onClick={() => router.push("/login")} variant="subtle" className="mt-4">
          Go to Login Now
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div className="space-y-2">
        <label
          htmlFor="pass"
          className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
        >
          New Password
        </label>
        <div className="relative">
          <Lock className="text-muted-foreground absolute top-2.5 left-3 h-5 w-5" />
          <input
            id="pass"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background border-border focus:ring-accent/50 focus:border-accent w-full rounded-lg border py-2 pr-4 pl-10 transition-all focus:ring-2 focus:outline-none"
            placeholder="Min 8 characters"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirm"
          className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
        >
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="text-muted-foreground absolute top-2.5 left-3 h-5 w-5" />
          <input
            id="confirm"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-background border-border focus:ring-accent/50 focus:border-accent w-full rounded-lg border py-2 pr-4 pl-10 transition-all focus:ring-2 focus:outline-none"
            placeholder="Confirm new password"
          />
        </div>
      </div>

      {error && (
        <div className="rounded bg-red-500/10 p-2 text-center text-xs font-bold text-red-500">
          {error}
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        Reset Password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm transition-colors"
          >
            <ArrowLeft size={14} className="mr-2" /> Back to Login
          </Link>
          <h1 className="text-3xl font-black tracking-tight">Set New Password</h1>
          <p className="text-muted-foreground mt-2">Choose a strong password for your account.</p>
        </div>

        <Suspense
          fallback={<div className="flex h-64 items-center justify-center">Loading...</div>}
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
