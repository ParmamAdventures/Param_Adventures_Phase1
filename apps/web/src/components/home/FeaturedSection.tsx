import React, { ReactNode } from "react";

interface FeaturedSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function FeaturedSection({
  title,
  subtitle,
  children,
  action,
  className = "",
}: FeaturedSectionProps) {
  return (
    <section className={`mx-auto max-w-7xl space-y-12 px-6 py-16 md:px-8 md:py-24 ${className}`}>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <h2 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
          {subtitle && <p className="text-muted-foreground max-w-xl text-lg">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="animate-fade-in-up">{children}</div>
    </section>
  );
}
