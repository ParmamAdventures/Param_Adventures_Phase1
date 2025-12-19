"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    try {
      const saved = (localStorage.getItem("theme") as Theme) || null;
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const next = saved ?? (systemDark ? "dark" : "light");
      setTheme(next);
      document.documentElement.dataset.theme = next;
    } catch (e) {
      // ignore (SSR safety)
    }
  }, []);

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

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
