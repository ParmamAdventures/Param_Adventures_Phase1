"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, footer, className = "" }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-background w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 ${className}`}>
        <div className="p-5 border-b flex items-center justify-between bg-[var(--card)] shrink-0">
            <h3 className="text-lg font-bold tracking-tight">{title}</h3>
            <button 
                onClick={onClose} 
                className="p-2 hover:bg-accent/10 rounded-full transition-colors text-muted-foreground hover:text-foreground"
            >
                <X size={20} />
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto min-h-0 flex-1">
            {children}
        </div>

        {footer && (
          <div className="p-4 border-t bg-[var(--card)] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
