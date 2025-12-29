"use client";

import React from "react";
import { 
  Code2, 
  Database, 
  Layout, 
  Server, 
  ShieldCheck, 
  Palette,
  Layers
} from "lucide-react";

const technologies = [
  { name: "Next.js 14", icon: <Layout className="text-white" />, color: "bg-black", description: "App Router  & Server Actions" },
  { name: "TypeScript", icon: <Code2 className="text-blue-600" />, color: "bg-blue-100", description: "Strict Type Safety" },
  { name: "Tailwind CSS", icon: <Palette className="text-cyan-500" />, color: "bg-cyan-50", description: "Modern Styling Engine" },
  { name: "Prisma ORM", icon: <Database className="text-teal-600" />, color: "bg-teal-100", description: "Database Access" },
  { name: "Express API", icon: <Server className="text-green-600" />, color: "bg-green-100", description: "Backend Services" },
  { name: "PostgreSQL", icon: <Database className="text-indigo-600" />, color: "bg-indigo-100", description: "Relational Data" },
  { name: "JWT Auth", icon: <ShieldCheck className="text-orange-600" />, color: "bg-orange-100", description: "Secure Authentication" },
  { name: "Turborepo", icon: <Layers className="text-pink-600" />, color: "bg-pink-100", description: "Monorepo Management" },
];

export default function TechStack() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {technologies.map((tech) => (
        <div 
          key={tech.name} 
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-accent/50 transition-colors group"
        >
          <div className={`w-10 h-10 rounded-lg ${tech.color} flex items-center justify-center shrink-0`}>
            {tech.icon}
          </div>
          <div>
            <h4 className="font-bold text-sm group-hover:text-accent transition-colors">{tech.name}</h4>
            <p className="text-xs text-muted-foreground">{tech.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
