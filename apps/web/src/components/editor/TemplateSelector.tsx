"use client";

import { BLOG_TEMPLATES } from "@/data/blogTemplates";
import { cn } from "@/lib/utils";

type ContentValue = string | number | boolean | null | Record<string, unknown> | ContentValue[];

type Props = {
  onSelect: (content: ContentValue, theme?: string) => void;
  className?: string;
};

/**
 * TemplateSelector - Dropdown select component.
 * @param {Object} props - Component props
 * @param {Array} [props.options] - Available options
 * @param {string|number} [props.value] - Selected value
 * @param {Function} [props.onChange] - Change handler
 * @param {string} [props.placeholder] - Placeholder text
 * @returns {React.ReactElement} Select element
 */
export function TemplateSelector({ onSelect, className }: Props) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {BLOG_TEMPLATES.map((template) => (
        <div
          key={template.id}
          className="group border-border bg-card hover:border-primary/50 relative flex cursor-pointer flex-col justify-between rounded-xl border p-6 shadow-sm transition-all hover:shadow-md"
          onClick={() => onSelect(template.content, template.theme)}
        >
          <div className="space-y-2">
            <h3 className="group-hover:text-primary text-lg font-bold transition-colors">
              {template.name}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{template.description}</p>
          </div>

          <div className="text-primary mt-4 flex items-center gap-2 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
            <span>Use Template</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
