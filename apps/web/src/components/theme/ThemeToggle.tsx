"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";
import Button from "../ui/Button";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Button variant="ghost" onClick={toggle} aria-label="Toggle theme">
        {theme === "dark" ? "Light" : "Dark"}
      </Button>
    </div>
  );
}
