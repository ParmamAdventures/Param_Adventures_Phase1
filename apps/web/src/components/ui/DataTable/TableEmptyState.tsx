import React from "react";
import { Button } from "../Button";

interface TableEmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function TableEmptyState({
  message,
  actionLabel,
  onAction,
  icon,
}: TableEmptyStateProps) {
  return (
    <div className="bg-muted/5 hover:bg-muted/10 flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed p-16 text-center transition-all">
      <div className="bg-muted/20 mb-2 flex h-16 w-16 items-center justify-center rounded-full">
        {icon || (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground/50"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" />
            <path d="M8 7h6" />
            <path d="M8 11h8" />
          </svg>
        )}
      </div>
      <p className="text-muted-foreground text-lg font-medium">{message}</p>
      {actionLabel && onAction && (
        <Button variant="subtle" onClick={onAction} className="rounded-full px-8">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
