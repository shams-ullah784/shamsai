"use client";

import { useTheme } from "./Providers";
import { MoonIcon, SunIcon } from "./Icons";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const toLight = theme === "dark";
  return (
    <button
      type="button"
      className={`icon-btn theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label={toLight ? "Switch to light mode" : "Switch to dark mode"}
      title={toLight ? "Light mode" : "Dark mode"}
    >
      <span className="theme-icon" style={{ display: "grid" }}>
        {toLight ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}
