"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import Button from "../ui/Button";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Button variant="ghost" onClick={toggle} aria-label="Toggle theme">
        {mounted ? (
          <>
            <span
              style={{
                display: "inline-block",
                transition: "transform 200ms ease, opacity 200ms ease",
                transform:
                  theme === "dark"
                    ? "rotate(40deg) scale(0.95)"
                    : "rotate(0deg) scale(1)",
              }}
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </span>
            <span style={{ marginLeft: 8 }}>
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </>
        ) : (
          <span style={{ width: 28, height: 20, display: "inline-block" }} />
        )}
      </Button>
    </div>
  );
}
