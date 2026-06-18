"use client";
import React from "react";
import { useTheme } from "@/lib/theme-context";
import AccessibilityPopover from "./accessibility-popover";

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

interface DashboardHeaderProps {
  role: string;
}

export default function DashboardHeader({ role }: DashboardHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Capitalize role name (e.g. gamer -> GAMER)
  const roleTitle = role.toUpperCase();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "60px",
        padding: "0 32px",
        backgroundColor: "var(--c-surface)",
        borderBottom: "1px solid var(--c-border)",
        boxSizing: "border-box",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left side: Role Badge / Portal Indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 800,
            fontSize: "13px",
            letterSpacing: "0.15em",
            color: "var(--c-text-dim)",
          }}
        >
          {roleTitle} PORTAL
        </span>
        <span
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            backgroundColor: "var(--c-accent)",
          }}
        />
      </div>

      {/* Right side: Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="flex items-center justify-center rounded-lg border transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            width: "36px",
            height: "36px",
            backgroundColor: isDark ? "#1A1A1A" : "#F0F0F2",
            borderColor: isDark ? "#2E2E2E" : "#D4D4D8",
            color: isDark ? "#FFD700" : "#F59E0B",
            cursor: "pointer",
          }}
        >
          {isDark ? <MoonIcon /> : <SunIcon />}
        </button>

        {/* Accessibility button */}
        <AccessibilityPopover />
      </div>
    </header>
  );
}
