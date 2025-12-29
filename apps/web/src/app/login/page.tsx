"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteConfig } from "@/hooks/useSiteConfig";

export default function LoginPage() {
  const { login } = useAuth();
  const { config } = useSiteConfig();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex w-1/2 relative bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
           <img 
            src={config.auth_login_image || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2601&auto=format&fit=crop"}
            alt="Adventure Background"
            className="w-full h-full object-cover opacity-60"
           />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
        
        <div className="relative z-20 flex flex-col justify-between p-12 w-full text-white">
            <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors w-fit">
                <ArrowLeft size={20} />
                <span>Back to Home</span>
            </Link>

            <div className="space-y-6 max-w-lg mb-20">
                <h1 className="text-5xl font-bold leading-tight">
                    Welcome back to the <span className="text-accent">wilderness.</span>
                </h1>
                <p className="text-lg text-gray-300">
                    Continue your journey where you left off. Your next great adventure is just a login away.
                </p>
            </div>
            
            <p className="text-sm text-gray-500">© 2024 Param Adventures. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Mobile Background Image with Overlay */}
        <div className="absolute inset-0 lg:hidden z-0">
            <img 
                src={config.auth_login_image || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2601&auto=format&fit=crop"}
                alt="Background"
                className="w-full h-full object-cover"
            />
            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
        </div>

        <div className="absolute top-8 left-8 lg:hidden z-20">
             <Link href="/" className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors">
                <ArrowLeft size={20} />
                <span>Home</span>
            </Link>
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-8 relative z-10"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Sign in to your account</h2>
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-accent hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
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
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium leading-none">Password</label>
                        <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-accent">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                             className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent md:pl-10 pl-10"
                            required
                            suppressHydrationWarning
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
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
          </div>
           
           <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  className="flex items-center justify-center h-10 w-full rounded-md border border-input bg-transparent hover:bg-accent/5 hover:border-accent/40 transition-colors"
                  suppressHydrationWarning
                >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                </button>
                <button 
                  type="button" 
                  className="flex items-center justify-center h-10 w-full rounded-md border border-input bg-transparent hover:bg-accent/5 hover:border-accent/40 transition-colors"
                  suppressHydrationWarning
                >
                     <svg className="h-5 w-5 mr-2 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-1.034-.012-1.924-2.783.603-3.08-1.188-3.08-1.188-1.34-1.34-3.08-1.34-3.08-1.34-1.94-.85.34-1.15.34-1.15 1.5.34 3.08 1.15 3.08 1.15 1.34.85 2.15.34 3.08.34.85-1.34 2.15-2.15 3.08-3.08-1.94-.34-3.92-1.15-3.92-3.08 0-.85.34-1.15.34-1.15-.34-.85-.34-2.15 0-3.08 0 0 1.15-.34 3.08 1.15.85-.34 2.15-.34 3.08-.34.85 0 2.15.34 3.08.34 1.94-1.5 3.08-1.15 3.08-1.15.34.85.34 2.15 0 3.08.34 1.15.34 2.15.34 3.08 0 1.94-1.94 2.74-3.92 3.08.85.85 1.62 2.53 1.62 5.11 0 3.69-.03 6.67-.03 7.58 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.523-4.477-10-10-10"/>
                    </svg>
                    GitHub
                </button>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
