"use client";

import Link from "next/link";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, actionLabel, actionLink, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-muted/30 p-4 rounded-full mb-2">
        {icon || (
          <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )}
      </div>
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">{description}</p>
      
      {actionLabel && actionLink && (
        <div className="pt-2">
          <Link href={actionLink}>
            <Button variant="primary">{actionLabel}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
