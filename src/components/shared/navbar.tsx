"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme-context";

/* ── Moon SVG (shown in Dark mode → click to go Light) ── */
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

/* ── Sun SVG (shown in Light mode → click to go Dark) ── */
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
      <line x1="12" y1="1"  x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

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
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span
            className="font-head text-xl font-bold tracking-widest uppercase"
            style={{ color: "var(--c-accent)" }}
          >
            VCF-LVL-UP
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { href: "#tournaments",   label: "Tournaments" },
            { href: "#announcements", label: "Announcements" },
            { href: "#matches",       label: "Matches" },
            { href: "#livestream",    label: "Livestream" },
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

        {/* Right side: Login + Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Login Button */}
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

          {/* ── Theme Toggle Button (right of Login) ── */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              backgroundColor: isDark ? "#1A1A1A" : "#F0F0F2",
              borderColor: isDark ? "#2E2E2E" : "#D4D4D8",
              color: isDark ? "#FFD700" : "#F59E0B",
            }}
          >
            {isDark ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>
    </nav>
  );
}
