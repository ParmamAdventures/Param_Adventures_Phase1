"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import Image from "next/image";

export default function LoginPage() {
  const { login } = useAuth();
  const { config } = useSiteConfig();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Hero Image */}
      <div className="relative hidden w-1/2 overflow-hidden bg-black lg:flex">
        <div className="absolute inset-0 z-0">
          <Image
            src={
              config.auth_login_image ||
              "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2601&auto=format&fit=crop"
            }
            alt="Adventure Background"
            fill
            className="object-cover opacity-60"
            priority
            unoptimized
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 to-transparent" />

        <div className="relative z-20 flex w-full flex-col justify-between p-12 text-white">
          <Link
            href="/"
            className="mt-8 flex w-fit items-center gap-2 text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>

          <div className="mb-20 max-w-lg space-y-6">
            <h1 className="text-5xl leading-tight font-bold">
              Welcome back to the <span className="text-accent">wilderness.</span>
            </h1>
            <p className="text-lg text-gray-300">
              Continue your journey where you left off. Your next great adventure is just a login
              away.
            </p>
          </div>

          <p className="text-sm text-gray-500">© 2024 Param Adventures. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="relative flex w-full items-center justify-center overflow-hidden p-8 lg:w-1/2">
        {/* Mobile Background Image with Overlay */}
        <div className="absolute inset-0 z-0 lg:hidden">
          <Image
            src={
              config.auth_login_image ||
              "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2601&auto=format&fit=crop"
            }
            alt="Background"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          {/* Gradient overlay for readability */}
          <div className="bg-background/90 absolute inset-0 backdrop-blur-sm" />
        </div>

        <div className="absolute top-8 left-8 z-20 lg:hidden">
          <Link
            href="/"
            className="text-foreground/80 hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Home</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md space-y-8"
        >
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Sign in to your account</h2>
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-accent font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <div className="group relative">
                  <Mail className="text-muted-foreground group-focus-within:text-accent absolute top-3 left-3 h-5 w-5 transition-colors" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="border-input placeholder:text-muted-foreground focus-visible:ring-accent flex h-12 w-full rounded-md border bg-transparent px-3 py-2 pl-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none md:pl-10"
                    required
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm leading-none font-medium">Password</label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-muted-foreground hover:text-accent text-sm"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="group relative">
                  <Lock className="text-muted-foreground group-focus-within:text-accent absolute top-3 left-3 h-5 w-5 transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="border-input placeholder:text-muted-foreground focus-visible:ring-accent flex h-12 w-full rounded-md border bg-transparent px-3 py-2 pl-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none md:pl-10"
                    required
                    suppressHydrationWarning
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="animate-in fade-in slide-in-from-top-1 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-center text-sm font-medium text-red-500">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              className="h-12 w-full text-base font-semibold"
              disabled={isLoading}
              suppressHydrationWarning
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background text-muted-foreground px-2">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              type="button"
              onClick={() => (window.location.href = "/api/auth/google")}
              className="border-input hover:bg-accent/5 hover:border-accent/40 flex h-10 w-full items-center justify-center rounded-md border bg-transparent transition-colors"
              suppressHydrationWarning
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
            {/* GitHub Login - Coming Soon
            <button
              type="button"
              className="border-input hover:bg-accent/5 hover:border-accent/40 flex h-10 w-full items-center justify-center rounded-md border bg-transparent transition-colors opacity-50 cursor-not-allowed"
              disabled
            >
              <svg className="text-foreground mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                 ...
              </svg>
              GitHub
            </button>
            */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
