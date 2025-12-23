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

export function Select({ value, onChange, options, placeholder = "Select...", className = "", triggerClassName = "", disabled = false, name, required }: SelectProps) {
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
        className={`w-full flex items-center justify-between
          bg-[var(--card)]/50 backdrop-blur-md border border-[var(--border)]
          rounded-2xl text-left font-bold text-lg
          transition-all duration-200
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-[var(--accent)]/50 focus:border-[var(--accent)]"}
          ${triggerClassName || "h-14 px-3"}`}
      >
        <span className={!value ? "text-muted-foreground font-normal" : ""}>
          {selectedLabel}
        </span>
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
            className="absolute z-50 w-full mt-2 overflow-hidden
              bg-[var(--surface)]/80 backdrop-blur-xl border border-[var(--border)]
              rounded-xl shadow-xl ring-1 ring-black/5"
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
                  className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors
                    ${option.value === value 
                        ? "bg-[var(--accent)]/10 text-[var(--accent)] font-semibold" 
                        : "text-[var(--text)] hover:bg-[var(--text)]/5"
                    }
                  `}
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
