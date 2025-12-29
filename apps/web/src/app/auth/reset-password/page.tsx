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
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 mb-6">
                <p className="font-bold">Invalid Link</p>
                <p className="text-sm mt-1">This password reset link is missing dependencies.</p>
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
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
        <label htmlFor="pass" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 text-muted-foreground h-5 w-5" />
          <input
            id="pass"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            placeholder="Min 8 characters"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Confirm Password
        </label>
        <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-muted-foreground h-5 w-5" />
            <input
                id="confirm"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                placeholder="Confirm new password"
            />
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-500 font-bold bg-red-500/10 p-2 rounded text-center">
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
         <div>
            <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft size={14} className="mr-2" /> Back to Login
            </Link>
            <h1 className="text-3xl font-black tracking-tight">Set New Password</h1>
            <p className="text-muted-foreground mt-2">
                Choose a strong password for your account.
            </p>
        </div>
        
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
