"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();
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
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black text-white p-6">
      {/* Cinematic Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass rounded-[32px] p-8 md:p-12 relative z-10 border border-white/10 shadow-2xl shadow-black/50"
      >
        <div className="space-y-6 text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">Param Adventures</h1>
          </Link>
          <div className="h-1 w-12 bg-accent rounded-full mx-auto" />
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">Welcome back, Explorer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
            <input
              placeholder="explorer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-medium"
              />
            </div>
            <div className="text-right">
              <a href="#" className="text-[10px] font-bold uppercase tracking-wider text-accent hover:opacity-80">Forgot Password?</a>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center"
            >
              {error}
            </motion.div>
          )}

          <Button 
            loading={loading}
            className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold rounded-xl text-lg shadow-lg shadow-white/5 transition-all hover:scale-[1.02]"
          >
            Access Terminal
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground font-medium">
            New to the agency?{" "}
            <Link href="/signup" className="text-white hover:text-accent transition-colors font-bold uppercase tracking-wide">
              Initialize Protocol
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
