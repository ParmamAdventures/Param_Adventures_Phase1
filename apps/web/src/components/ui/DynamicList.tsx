"use client";

import { useState } from "react";
import Button from "./Button";

type DynamicListProps = {
  items: string[];
  onChange: (items: string[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
};

export default function DynamicList({
  items = [],
  onChange,
  label,
  placeholder = "Add item...",
  disabled = false,
}: DynamicListProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    onChange([...items, inputValue.trim()]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {label && <label className="text-foreground block text-sm font-semibold">{label}</label>}

      <div className="flex gap-2">
        <input
          disabled={disabled}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="border-input focus:border-primary bg-background text-foreground placeholder:text-muted-foreground flex-1 rounded-lg border px-4 py-2 transition-colors outline-none"
        />
        <Button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !inputValue.trim()}
          variant="subtle"
          className="px-4"
        >
          Add
        </Button>
      </div>

      {items.length > 0 && (
        <ul className="mt-2 space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="bg-muted/40 border-border group flex items-center justify-between rounded-lg border p-3"
            >
              <span className="text-foreground text-sm">{item}</span>
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={disabled}
                className="text-muted-foreground p-1 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
