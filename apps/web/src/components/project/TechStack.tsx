"use client";

import React from "react";
import { Code2, Database, Layout, Server, ShieldCheck, Palette, Layers } from "lucide-react";

const technologies = [
  {
    name: "Next.js 14",
    icon: <Layout className="text-white" />,
    color: "bg-black",
    description: "App Router  & Server Actions",
  },
  {
    name: "TypeScript",
    icon: <Code2 className="text-blue-600" />,
    color: "bg-blue-100",
    description: "Strict Type Safety",
  },
  {
    name: "Tailwind CSS",
    icon: <Palette className="text-cyan-500" />,
    color: "bg-cyan-50",
    description: "Modern Styling Engine",
  },
  {
    name: "Prisma ORM",
    icon: <Database className="text-teal-600" />,
    color: "bg-teal-100",
    description: "Database Access",
  },
  {
    name: "Express API",
    icon: <Server className="text-green-600" />,
    color: "bg-green-100",
    description: "Backend Services",
  },
  {
    name: "PostgreSQL",
    icon: <Database className="text-indigo-600" />,
    color: "bg-indigo-100",
    description: "Relational Data",
  },
  {
    name: "JWT Auth",
    icon: <ShieldCheck className="text-orange-600" />,
    color: "bg-orange-100",
    description: "Secure Authentication",
  },
  {
    name: "Turborepo",
    icon: <Layers className="text-pink-600" />,
    color: "bg-pink-100",
    description: "Monorepo Management",
  },
];

/**
 * TechStack - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export default function TechStack() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {technologies.map((tech) => (
        <div
          key={tech.name}
          className="border-border bg-card hover:border-accent/50 group flex items-center gap-3 rounded-xl border p-4 transition-colors"
        >
          <div
            className={`h-10 w-10 rounded-lg ${tech.color} flex shrink-0 items-center justify-center`}
          >
            {tech.icon}
          </div>
          <div>
            <h4 className="group-hover:text-accent text-sm font-bold transition-colors">
              {tech.name}
            </h4>
            <p className="text-muted-foreground text-xs">{tech.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
