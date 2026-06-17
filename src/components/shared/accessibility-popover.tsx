"use client";
import React, { useState, useRef, useEffect } from "react";
import { useFontSize, FontSizeLevel } from "@/lib/font-size-context";
import { useAccessibility } from "@/lib/accessibility-context";
import { useTheme } from "@/lib/theme-context";

const FONT_SIZE_PERCENTAGES: Record<FontSizeLevel, string> = {
  1: "85%",
  2: "100%",
  3: "115%",
  4: "130%",
};

export default function AccessibilityPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const { fontSize, setFontSize } = useFontSize();
  const { highContrast, setHighContrast } = useAccessibility();
  const { theme } = useTheme();
  const popoverRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDecrease = () => {
    if (fontSize > 1) {
      setFontSize((fontSize - 1) as FontSizeLevel);
    }
  };

  const handleIncrease = () => {
    if (fontSize < 4) {
      setFontSize((fontSize + 1) as FontSizeLevel);
    }
  };

  const handleReset = () => {
    setFontSize(2); // Reset to 100%
  };

  return (
    <div className="relative" ref={popoverRef} style={{ fontSize: "14px" }}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Accessibility options"
        aria-label="Accessibility options"
        className="flex items-center justify-center rounded-lg border transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          width: "36px",
          height: "36px",
          backgroundColor: isDark ? "#1A1A1A" : "#F0F0F2",
          borderColor: isDark ? "#2E2E2E" : "#D4D4D8",
          color: "var(--c-text)",
          cursor: "pointer",
        }}
      >
        {/* Human / Accessibility Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="4" r="1.5" />
          <path d="M12 7.5V14M12 14v7M12 14H9.5M12 14h2.5M7 10h10" />
        </svg>
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Accessibility panel"
          style={{
            position: "absolute",
            top: "44px",
            right: 0,
            width: "280px",
            backgroundColor: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
            padding: "20px",
            zIndex: 100,
            color: "var(--c-text)",
            boxSizing: "border-box",
            textAlign: "left",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <span style={{ fontWeight: 700, fontSize: "16px", letterSpacing: "0.02em" }}>Accessibility</span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility panel"
              style={{
                background: "none",
                border: "none",
                color: "var(--c-text-dim)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* High Contrast Option */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "13px" }}>High Contrast</div>
              <div style={{ fontSize: "11px", color: "var(--c-text-dim)", marginTop: "2px" }}>Increase visual readability</div>
            </div>
            {/* Toggle Switch */}
            <label
              style={{
                position: "relative",
                display: "inline-block",
                width: "40px",
                height: "22px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: highContrast ? "var(--c-accent)" : (isDark ? "#2E2E2E" : "#D4D4D8"),
                  transition: ".2s",
                  borderRadius: "34px",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  content: '""',
                  height: "16px",
                  width: "16px",
                  left: highContrast ? "21px" : "3px",
                  bottom: "3px",
                  backgroundColor: "white",
                  transition: ".2s",
                  borderRadius: "50%",
                }}
              />
            </label>
          </div>

          {/* Text Size Option */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontWeight: 600, fontSize: "13px" }}>Text Size</span>
              <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--c-accent)" }}>
                {FONT_SIZE_PERCENTAGES[fontSize]}
              </span>
            </div>

            {/* Buttons Group */}
            <div style={{ display: "flex", gap: "8px", width: "100%" }}>
              <button
                onClick={handleDecrease}
                disabled={fontSize === 1}
                aria-label="Decrease font size"
                style={{
                  flex: 1,
                  height: "36px",
                  borderRadius: "8px",
                  border: "1px solid var(--c-border)",
                  backgroundColor: "var(--c-surface2)",
                  color: "var(--c-text)",
                  cursor: fontSize === 1 ? "not-allowed" : "pointer",
                  opacity: fontSize === 1 ? 0.5 : 1,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                }}
              >
                A-
              </button>

              <button
                onClick={handleReset}
                aria-label="Reset font size"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  border: "1px solid var(--c-border)",
                  backgroundColor: "var(--c-surface2)",
                  color: "var(--c-text)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Reset Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
              </button>

              <button
                onClick={handleIncrease}
                disabled={fontSize === 4}
                aria-label="Increase font size"
                style={{
                  flex: 2,
                  height: "36px",
                  borderRadius: "8px",
                  border: "1px solid var(--c-border)",
                  backgroundColor: "var(--c-surface2)",
                  color: "var(--c-text)",
                  cursor: fontSize === 4 ? "not-allowed" : "pointer",
                  opacity: fontSize === 4 ? 0.5 : 1,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                }}
              >
                A+
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
