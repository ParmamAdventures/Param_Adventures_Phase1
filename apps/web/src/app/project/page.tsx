import { ScrollReveal } from "@/components/ui/ScrollReveal";
import TechStack from "@/components/project/TechStack";
import Link from "next/link";
import { ArrowLeft, Rocket, GitGraph, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ProjectShowcasePage() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header */}
        <section className="space-y-6">
          <Link href="/">
            <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-accent mb-4">
              <ArrowLeft size={16} className="mr-2" /> Back to Home
            </Button>
          </Link>
          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Project <span className="text-accent">Showcase</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Param Adventures is a modern full-stack application built to demonstrate advanced web development concepts. 
              It serves as a comprehensive portfolio piece highlighting capabilities in architecture, design, and functionality.
            </p>
          </ScrollReveal>
        </section>

        {/* Tech Stack */}
        <ScrollReveal width="100%">
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Layers size={24} />
              </div>
              <h2 className="text-2xl font-bold">Technology Stack</h2>
            </div>
            <TechStack />
          </section>
        </ScrollReveal>

        {/* Architecture & Features */}
        <ScrollReveal width="100%">
          <section className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <Rocket size={24} />
                </div>
                <h2 className="text-2xl font-bold">Key Implementations</h2>
              </div>
              <ul className="space-y-4">
                {[
                  "Role-Based Access Control (RBAC)",
                  "JWT Authentication (Access + Refresh Tokens)",
                  "Trip Management Admin Console",
                  "Responsive & Animated UI (Framer Motion)",
                  "Dynamic Guide Assignment System",
                  "Booking & Payment Workflows (Simulated)"
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-transparent hover:border-accent/20 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <GitGraph size={24} />
                </div>
                <h2 className="text-2xl font-bold">Monorepo Structure</h2>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card font-mono text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">/apps</span>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <span className="text-muted-foreground">├─</span>
                  <span className="font-bold text-accent">api</span>
                  <span className="text-xs text-muted-foreground ml-auto">Express + Prisma</span>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <span className="text-muted-foreground">└─</span>
                  <span className="font-bold text-accent">web</span>
                  <span className="text-xs text-muted-foreground ml-auto">Next.js 14</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-muted-foreground">/packages</span>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <span className="text-muted-foreground">└─ (Shared Types/Configs)</span>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>



      </div>
    </main>
  );
}
