"use client";

import React from "react";
import { Toast } from "./toast.types";
import { motion, AnimatePresence } from "framer-motion";

const styles: Record<string, string> = {
  success: "bg-[var(--semantic-success)] text-white",
  error: "bg-[var(--semantic-danger)] text-white",
  info: "bg-[var(--surface-elevated)] text-[var(--text)]",
};

/**
 * ToastViewport - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export function ToastViewport({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className={`rounded-lg px-4 py-3 shadow-lg ${styles[toast.type]}`}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ToastViewport;
