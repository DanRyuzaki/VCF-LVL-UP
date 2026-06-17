"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { useFontSize, FontSizeLevel } from "@/lib/font-size-context";
import { useState, useRef, useEffect } from "react";

const FONT_SIZE_LABELS: Record<FontSizeLevel, string> = {
  1: "Small",
  2: "Normal",
  3: "Large",
  4: "Huge",
};

function FontSizeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Font size controls"
    >
      <path d="M4 18L9 5L14 18" />
      <path d="M6 14H12" />
      <path d="M18 18V13a2 2 0 0 0-2-2h-1M15 18h4" />
      <circle cx="17" cy="16" r="2" />
    </svg>
  );
}


function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-label="Dark mode — click for Light mode"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}


function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Light mode — click for Dark mode"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isDashboard =
    pathname.startsWith("/gamer") ||
    pathname.startsWith("/organizer") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/developer");

  if (isDashboard) return null;

  const isDark = theme === "dark";

  return (
    <nav
      style={{
        backgroundColor: "var(--c-surface)",
        borderBottom: "1px solid var(--c-border)",
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between">
        { }
        <Link href="/" className="flex items-center gap-2">
          <span className="font-head text-xl font-bold tracking-widest uppercase">
            <span style={{ color: "var(--c-text)" }}>VCF: </span>
            <span style={{ color: "var(--c-accent)" }}>LVL UP!</span>
          </span>
        </Link>

        { }
        <div className="hidden md:flex items-center gap-6">
          {[
            { href: "#tournaments", label: "Tournaments" },
            { href: "#announcements", label: "Announcements" },
            { href: "#matches", label: "Matches" },
            { href: "#livestream", label: "Livestream" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-xs uppercase tracking-widest transition-colors"
              style={{ color: "var(--c-text-dim)" }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--c-text)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "var(--c-text-dim)")
              }
            >
              {label}
            </a>
          ))}
        </div>

        { }
        <div className="flex items-center gap-3">
          { }
          <Link
            href="/login"
            className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-md transition-colors"
            style={{
              backgroundColor: "var(--c-accent)",
            }}
            onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor =
              "var(--c-accent-hover)")
            }
            onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor =
              "var(--c-accent)")
            }
          >
            Login
          </Link>

          { }
          <button
            id="theme-toggle-btn"
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
            }}
          >
            {isDark ? <MoonIcon /> : <SunIcon />}
          </button>

          { }
          <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
              id="font-size-toggle-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title="Adjust Font Size"
              aria-label="Adjust Font Size"
              className="flex items-center justify-center rounded-lg border transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: isDark ? "#1A1A1A" : "#F0F0F2",
                borderColor: isDark ? "#2E2E2E" : "#D4D4D8",
                color: isDark ? "#00F5D4" : "#00C4AA",
              }}
            >
              <FontSizeIcon />
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-0 border shadow-xl flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                style={{
                  marginTop: "8px",
                  padding: "16px",
                  borderRadius: "12px",
                  minWidth: "238px",
                  gap: "14px",
                  backgroundColor: isDark ? "#121212" : "#FFFFFF",
                  borderColor: isDark ? "#2E2E2E" : "#E4E4E7",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div
                  className="flex justify-between items-center font-bold uppercase tracking-widest"
                  style={{
                    color: "var(--c-text-dim)",
                    fontSize: "10px",
                  }}
                >
                  <span>Font Size</span>
                  <span style={{ color: "var(--c-accent)" }}>{FONT_SIZE_LABELS[fontSize]}</span>
                </div>

                <div
                  className="flex justify-between items-center"
                  style={{
                    gap: "8px",
                    paddingTop: "2px",
                    paddingBottom: "2px",
                  }}
                >
                  {([1, 2, 3, 4] as FontSizeLevel[]).map((level) => {
                    const isActive = fontSize === level;
                    const innerFontSize = { 1: "11px", 2: "13px", 3: "16px", 4: "19px" }[level];
                    return (
                      <button
                        key={level}
                        onClick={() => setFontSize(level)}
                        className="flex flex-col items-center gap-1.5 group"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          outline: "none",
                          padding: "0",
                          flex: 1,
                        }}
                      >
                        <div
                          className="flex items-center justify-center rounded-xl border transition-all duration-200"
                          style={{
                            width: "42px",
                            height: "42px",
                            backgroundColor: isActive
                              ? "var(--c-accent)"
                              : isDark
                              ? "#1A1A1A"
                              : "#F0F0F2",
                            borderColor: isActive
                              ? "var(--c-accent)"
                              : isDark
                              ? "#2E2E2E"
                              : "#D4D4D8",
                            color: isActive ? "#FFFFFF" : "var(--c-text)",
                            boxShadow: isActive ? "0 0 10px rgba(255, 70, 85, 0.4)" : "none",
                          }}
                        >
                          <span
                            style={{
                              fontSize: innerFontSize,
                              fontWeight: "bold",
                              transition: "transform 0.15s ease",
                            }}
                            className="group-hover:scale-110"
                          >
                            A
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "8px",
                            fontWeight: 800,
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                            color: isActive ? "var(--c-accent)" : "var(--c-text-dim)",
                          }}
                        >
                          {FONT_SIZE_LABELS[level]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
