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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
        const res = await apiFetch("/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Registration failed");
        }

        setSuccess(true);
        // optional: redirect to login after a short delay
        setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
        setError(err.message || "Something went wrong.");
    } finally {
        setLoading(false);
    }
  }

  // Success View
  if (success) {
     return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 max-w-md w-full bg-surface border border-border rounded-2xl p-8 shadow-2xl text-center space-y-6"
            >
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4">
                    <PartyPopper size={32} />
                </div>
                <h2 className="text-3xl font-bold">Welcome Aboard!</h2>
                <p className="text-muted-foreground text-lg">
                    Your account has been created successfully. Redirecting you to login...
                </p>
                <div className="w-full h-1 bg-accent/20 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2 }}
                        className="h-full bg-accent"
                    />
                </div>
            </motion.div>
        </div>
     );
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Right Side - Hero Image (Swapped position for variety) */}
      <div className="hidden lg:flex w-1/2 relative bg-black overflow-hidden order-2">
        <div className="absolute inset-0 z-0">
           <Image 
            src={config.auth_signup_image || "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2670&auto=format&fit=crop"}
            alt="Starry Night Camping"
            fill
            className="object-cover opacity-60"
            unoptimized
            priority
           />
        </div>
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 to-transparent z-10" />
        
        <div className="relative z-20 flex flex-col justify-end p-12 w-full text-white h-full">
            <div className="space-y-6 max-w-lg mb-20">
                <h1 className="text-5xl font-bold leading-tight">
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative order-1 overflow-hidden">
        {/* Mobile Background Image with Overlay */}
        <div className="absolute inset-0 lg:hidden z-0">
            <Image 
                src={config.auth_signup_image || "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2670&auto=format&fit=crop"}
                alt="Background"
                fill
                className="object-cover"
                unoptimized
                priority
            />
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
        </div>

        <div className="absolute top-8 left-8 z-20">
             <Link href="/" className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors">
                <ArrowLeft size={20} />
                <span>Home</span>
            </Link>
        </div>

        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md space-y-8 relative z-10"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-4">
                {/* Name Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Full Name</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                             className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent md:pl-10 pl-10"
                            required
                            suppressHydrationWarning
                        />
                    </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                             className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent md:pl-10 pl-10"
                            required
                            suppressHydrationWarning
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                        <input
                            type="password"
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                             className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent md:pl-10 pl-10"
                            required
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-medium animate-in fade-in slide-in-from-top-1">
                    {error}
                </div>
            )}

            <Button 
                variant="primary" 
                className="w-full h-12 text-base font-semibold"
                disabled={loading}
                suppressHydrationWarning
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
           
           <div className="text-center text-xs text-muted-foreground mt-6">
                By clicking continue, you agree to our <Link href="#" className="underline hover:text-foreground">Terms of Service</Link> and <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>.
           </div>
        </motion.div>
      </div>
    </div>
  );
}
