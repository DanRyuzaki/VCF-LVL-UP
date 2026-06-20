"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { useState, useRef, useEffect } from "react";
import AccessibilityPopover from "./accessibility-popover";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";

// Must match the cookie name set by login-form.tsx and read by src/middleware.ts.
const ROLE_COOKIE_NAME = "vcf_role";

/**
 * Clears the `vcf_role` cookie that the Edge middleware (src/middleware.ts)
 * reads for route guarding. Setting max-age=0 deletes the cookie immediately.
 * Must run on every sign-out path — including this landing-page navbar's
 * sign-out — or the middleware will keep seeing a stale role cookie and may
 * let a signed-out browser back into a dashboard route until it expires.
 */
function clearRoleCookie() {
  document.cookie = `${ROLE_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-label="Dark mode — click for Light mode">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Light mode — click for Dark mode">
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

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
    </svg>
  );
}

function SignOutConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-6 shadow-xl"
        style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-border)" }}
      >
        <h2
          className="font-head text-base font-bold uppercase tracking-widest mb-1"
          style={{ color: "var(--c-text)" }}
        >
          Sign Out
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--c-text-dim)" }}>
          Are you sure you want to sign out?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--c-border)",
              color: "var(--c-text-dim)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--c-text-dim)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)")}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors"
            style={{ backgroundColor: "var(--c-accent)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--c-accent-hover)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--c-accent)")}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { profile, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDashboard =
    pathname.startsWith("/gamer") ||
    pathname.startsWith("/organizer") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/developer");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isDashboard) return null;

  const isDark = theme === "dark";

  const handleSignOut = async () => {
    clearRoleCookie();
    await auth.signOut();           // ✅ matches pattern used across the codebase
    setShowSignOutConfirm(false);
    setDropdownOpen(false);
    router.push("/");
  };

  const dashboardPath = profile ? `/${profile.role}` : "/login";

  const initials = profile
    ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
    : "";

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "";

  return (
    <>
      {showSignOutConfirm && (
        <SignOutConfirmModal
          onConfirm={handleSignOut}
          onCancel={() => setShowSignOutConfirm(false)}
        />
      )}

      <nav
        style={{ backgroundColor: "var(--c-surface)", borderBottom: "1px solid var(--c-border)" }}
        className="sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-head text-xl font-bold tracking-widest uppercase">
              <span style={{ color: "var(--c-text)" }}>VCF: </span>
              <span style={{ color: "var(--c-accent)" }}>LVL UP!</span>
            </span>
          </Link>

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
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--c-text)")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--c-text-dim)")}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">

            {!loading && (
              profile ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-2 rounded-md transition-colors"
                    style={{
                      backgroundColor: "var(--c-surface2)",
                      border: "1px solid var(--c-border)",
                      color: "var(--c-text)",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--c-accent)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)")}
                  >
                    <span
                      className="flex items-center justify-center rounded-full text-white text-[10px] font-bold"
                      style={{ width: 24, height: 24, backgroundColor: "var(--c-accent)", flexShrink: 0 }}
                    >
                      {initials || <UserIcon />}
                    </span>
                    <span className="hidden sm:inline">{fullName}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.5 }}>
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-44 rounded-lg shadow-lg py-1 z-50"
                      style={{ backgroundColor: "var(--c-surface2)", border: "1px solid var(--c-border)" }}
                    >
                      <div className="px-3 py-2" style={{ borderBottom: "1px solid var(--c-border)" }}>
                        <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--c-text-dim)" }}>
                          Signed in as
                        </p>
                        <p className="text-xs font-semibold mt-0.5 capitalize" style={{ color: "var(--c-accent)" }}>
                          {profile.role}
                        </p>
                      </div>
                      <Link
                        href={dashboardPath}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs transition-colors w-full"
                        style={{ color: "var(--c-text)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--c-surface)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
                      >
                        Go to Dashboard
                      </Link>
                      <button
                        onClick={() => { setDropdownOpen(false); setShowSignOutConfirm(true); }}
                        className="flex items-center gap-2 px-3 py-2 text-xs transition-colors w-full text-left"
                        style={{ color: "#EF4444" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--c-surface)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-md transition-colors"
                  style={{ backgroundColor: "var(--c-accent)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--c-accent-hover)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--c-accent)")}
                >
                  Login
                </Link>
              )
            )}

            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="flex items-center justify-center rounded-lg border transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                width: "36px", height: "36px",
                backgroundColor: isDark ? "#1A1A1A" : "#F0F0F2",
                borderColor: isDark ? "#2E2E2E" : "#D4D4D8",
                color: isDark ? "#FFD700" : "#F59E0B",
              }}
            >
              {isDark ? <MoonIcon /> : <SunIcon />}
            </button>

            <AccessibilityPopover />
          </div>
        </div>
      </nav>
    </>
  );
}