"use client";

import { BLOG_TEMPLATES } from "@/data/blogTemplates";
import { cn } from "@/lib/utils";

type Props = {
  onSelect: (content: any, theme?: string) => void;
  className?: string;
};

export function TemplateSelector({ onSelect, className }: Props) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {BLOG_TEMPLATES.map((template) => (
        <div
          key={template.id}
          className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
          onClick={() => onSelect(template.content, template.theme)}
        >
          <div className="space-y-2">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
              {template.name}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {template.description}
            </p>
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Use Template</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>
      ))}
    </div>
  );
}
