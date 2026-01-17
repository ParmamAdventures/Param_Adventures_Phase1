"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "light", toggle: () => {} });

/**
 * ThemeProvider - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const getInitial = (): Theme => {
    try {
      const saved = (localStorage.getItem("theme") as Theme) || null;
      const systemDark =
        typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
      return saved ?? (systemDark ? "dark" : "light");
    } catch {
      return "light";
    }
  };

  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    // sync DOM dataset for theming; avoid setting state here to prevent cascading renders
    try {
      document.documentElement.dataset.theme = theme;
    } catch {
      // ignore
    }
  }, [theme]);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      // ignore
    }
    document.documentElement.dataset.theme = next;
  };

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
