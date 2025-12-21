"use client";

import React, { useState } from "react";
import { apiFetch } from "../lib/api";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";

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
    setTimeout(() => router.push("/login"), 1500);
  }

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-white p-6">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="text-center space-y-4"
         >
           <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto ring-1 ring-green-500/50">
             <span className="text-3xl">✓</span>
           </div>
           <h2 className="text-2xl font-black uppercase tracking-wider">Access Granted</h2>
           <p className="text-muted-foreground animate-pulse">Redirecting to terminal...</p>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black text-white p-6">
      {/* Cinematic Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[150px]" />
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
          <div className="h-1 w-12 bg-purple-500 rounded-full mx-auto" />
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">Initialize New Identity</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Codename</label>
            <input
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Protocol</label>
            <input
              placeholder="explorer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Security Key</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
            />
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
            Create Identity
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground font-medium">
            Already authenticated?{" "}
            <Link href="/login" className="text-white hover:text-purple-400 transition-colors font-bold uppercase tracking-wide">
              Access Terminal
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
