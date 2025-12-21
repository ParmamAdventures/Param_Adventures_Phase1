import React, { ReactNode } from "react";

interface FeaturedSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function FeaturedSection({ title, subtitle, children, action, className = "" }: FeaturedSectionProps) {
  return (
    <section className={`py-16 md:py-24 px-6 md:px-8 max-w-7xl mx-auto space-y-12 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-xl">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        {children}
      </div>
    </section>
  );
}
