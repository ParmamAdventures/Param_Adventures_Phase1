"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}

/**
 * Select - Dropdown select component.
 * @param {Object} props - Component props
 * @param {Array} [props.options] - Available options
 * @param {string|number} [props.value] - Selected value
 * @param {Function} [props.onChange] - Change handler
 * @param {string} [props.placeholder] - Placeholder text
 * @returns {React.ReactElement} Select element
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  triggerClassName = "",
  disabled = false,
  name,
  required,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Hidden input for form submission compatibility */}
      {name && <input type="hidden" name={name} value={value} required={required} />}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        suppressHydrationWarning
        className={`flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 text-left text-lg font-bold backdrop-blur-md transition-all duration-200 ${disabled ? "cursor-not-allowed opacity-50" : "hover:border-[var(--accent)]/50 focus:border-[var(--accent)]"} ${triggerClassName || "h-14 px-3"}`}
      >
        <span className={!value ? "text-muted-foreground font-normal" : ""}>{selectedLabel}</span>
        <ChevronDown
          size={20}
          className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 shadow-xl ring-1 ring-black/5 backdrop-blur-xl"
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
                    option.value === value
                      ? "bg-[var(--accent)]/10 font-semibold text-[var(--accent)]"
                      : "text-[var(--text)] hover:bg-[var(--text)]/5"
                  } `}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value && <Check size={16} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
