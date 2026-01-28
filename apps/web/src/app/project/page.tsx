import { ScrollReveal } from "@/components/ui/ScrollReveal";
import TechStack from "@/components/project/TechStack";
import Link from "next/link";
import { ArrowLeft, Rocket, GitGraph, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ProjectShowcasePage() {
  return (
    <main className="bg-background min-h-screen px-6 pt-24 pb-12">
      <div className="mx-auto max-w-4xl space-y-16">
        {/* Header */}
        <section className="space-y-6">
          <Link href="/">
            <Button variant="ghost" className="hover:text-accent mb-4 pl-0 hover:bg-transparent">
              <ArrowLeft size={16} className="mr-2" /> Back to Home
            </Button>
          </Link>
          <ScrollReveal>
            <h1 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
              Project <span className="text-accent">Showcase</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              Param Adventures is a modern full-stack application built to demonstrate advanced web
              development concepts. It serves as a comprehensive portfolio piece highlighting
              capabilities in architecture, design, and functionality.
            </p>
          </ScrollReveal>
        </section>

        {/* Tech Stack */}
        <ScrollReveal width="100%">
          <section className="space-y-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-accent/10 text-accent rounded-lg p-2">
                <Layers size={24} />
              </div>
              <h2 className="text-2xl font-bold">Technology Stack</h2>
            </div>
            <TechStack />
          </section>
        </ScrollReveal>

        {/* Architecture & Features */}
        <ScrollReveal width="100%">
          <section className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
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
                  "Booking & Payment Workflows (Simulated)",
                  "Comprehensive Testing Suite (372 Tests)",
                  "End-to-End Testing with Playwright",
                  "CI/CD Pipeline with GitHub Actions",
                ].map((item) => (
                  <li
                    key={item}
                    className="bg-muted/30 hover:border-accent/20 flex items-center gap-3 rounded-lg border border-transparent p-3 transition-colors"
                  >
                    <span className="bg-accent h-1.5 w-1.5 rounded-full" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <GitGraph size={24} />
                </div>
                <h2 className="text-2xl font-bold">Monorepo Structure</h2>
              </div>
              <div className="border-border bg-card space-y-2 rounded-xl border p-6 font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">/apps</span>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <span className="text-muted-foreground">├─</span>
                  <span className="text-accent font-bold">api</span>
                  <span className="text-muted-foreground ml-auto text-xs">Express + Prisma</span>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <span className="text-muted-foreground">└─</span>
                  <span className="text-accent font-bold">web</span>
                  <span className="text-muted-foreground ml-auto text-xs">Next.js 14</span>
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
