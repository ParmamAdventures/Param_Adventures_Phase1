"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, Lock, User, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import Image from "next/image";

export default function SignupPage() {
  const { config } = useSiteConfig();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  function validatePassword(pwd: string): string | null {
    if (pwd.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(pwd)) return "Password must contain at least one special character";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        let errorMessage = data.error || data.message || "Registration failed";
        if (data.details) {
          const details = Object.entries(data.details)
            .map(
              ([field, msgs]: [string, unknown]) =>
                `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`,
            )
            .join(" | ");
          errorMessage = `${errorMessage} (${details})`;
        }
        throw new Error(errorMessage);
      }

      setSuccess(true);
      // optional: redirect to login after a short delay
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  // Success View
  if (success) {
    return (
      <div className="bg-background relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
        {/* Background Decoration */}
        <div className="absolute inset-0 z-0">
          <div className="bg-accent/20 absolute top-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full blur-[120px]" />
          <div className="absolute right-[-10%] bottom-[-20%] h-[50%] w-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-surface border-border relative z-10 w-full max-w-md space-y-6 rounded-2xl border p-8 text-center shadow-2xl"
        >
          <div className="bg-accent/10 text-accent mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <PartyPopper size={32} />
          </div>
          <h2 className="text-3xl font-bold">Welcome Aboard!</h2>
          <p className="text-muted-foreground text-lg">
            Your account has been created successfully. Redirecting you to login...
          </p>
          <div className="bg-accent/20 h-1 w-full overflow-hidden rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2 }}
              className="bg-accent h-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Right Side - Hero Image (Swapped position for variety) */}
      <div className="relative order-2 hidden w-1/2 overflow-hidden bg-black lg:flex">
        <div className="absolute inset-0 z-0">
          <Image
            src={
              config.auth_signup_image ||
              "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2670&auto=format&fit=crop"
            }
            alt="Starry Night Camping"
            fill
            className="object-cover opacity-60"
            unoptimized
            priority
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-l from-black/80 to-transparent" />

        <div className="relative z-20 flex h-full w-full flex-col justify-end p-12 text-white">
          <div className="mb-20 max-w-lg space-y-6">
            <h1 className="text-5xl leading-tight font-bold">
              Start your <span className="text-blue-400">legend.</span>
            </h1>
            <p className="text-lg text-gray-300">
              Join a community of explorers, dreamers, and doers. The mountains are calling.
            </p>
          </div>
          <p className="text-sm text-gray-500">© 2024 Param Adventures. All rights reserved.</p>
        </div>
      </div>

      {/* Left Side - Form */}
      <div className="relative order-1 flex w-full items-center justify-center overflow-hidden p-8 lg:w-1/2">
        {/* Mobile Background Image with Overlay */}
        <div className="absolute inset-0 z-0 lg:hidden">
          <Image
            src={
              config.auth_signup_image ||
              "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2670&auto=format&fit=crop"
            }
            alt="Background"
            fill
            className="object-cover"
            unoptimized
            priority
          />
          <div className="bg-background/90 absolute inset-0 backdrop-blur-sm" />
        </div>

        <div className="absolute top-8 left-8 z-20 mt-8">
          <Link
            href="/"
            className="text-foreground/80 hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Home</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 w-full max-w-md space-y-8"
        >
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-accent font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-sm leading-none font-medium">Full Name</label>
                <div className="group relative">
                  <User className="text-muted-foreground group-focus-within:text-accent absolute top-3 left-3 h-5 w-5 transition-colors" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="border-input placeholder:text-muted-foreground focus-visible:ring-accent flex h-12 w-full rounded-md border bg-transparent px-3 py-2 pl-10 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none md:pl-10"
                    required
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm leading-none font-medium">Email</label>
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
                <label className="text-sm leading-none font-medium">Password</label>
                <div className="group relative">
                  <Lock className="text-muted-foreground group-focus-within:text-accent absolute top-3 left-3 h-5 w-5 transition-colors" />
                  <input
                    type="password"
                    placeholder="Create a strong password"
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-muted-foreground mt-6 text-center text-xs">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="hover:text-foreground underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:text-foreground underline">
              Privacy Policy
            </Link>
            .
          </div>
        </motion.div>
      </div>
    </div>
  );
}
