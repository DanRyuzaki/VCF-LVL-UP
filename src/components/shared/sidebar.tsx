"use client";
import Link from "next/link";
import { DynamicIcon, IconLogout } from "@/components/shared/icons";
import { UserRole } from "@/types/user";
import { ROLE_CONFIG } from "@/lib/roles";

interface SidebarProps {
  role: UserRole;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ role, activeSection, onSectionChange }: SidebarProps) {
  const config = ROLE_CONFIG[role];

  const initials = config.label
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Fixed sidebar — occupies full height from below navbar to viewport bottom */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "220px",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--c-surface)",
          borderRight: "1px solid var(--c-border)",
          zIndex: 40,
        }}
      >
        {/* ── NAV: flex-1 pushes profile to bottom ── */}
        <div style={{ flex: 1, overflowY: "auto", paddingTop: "16px", paddingBottom: "8px" }}>
          <div
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: "var(--c-text-dim)",
              padding: "0 20px",
              marginBottom: "8px",
            }}
          >
            Navigation
          </div>

          <nav>
            {config.sidebarItems.map((item: { section: string; icon: string; label: string }) => {
              const isActive = activeSection === item.section;
              return (
                <button
                  key={item.section}
                  onClick={() => onSectionChange(item.section)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    textAlign: "left",
                    borderLeft: `2px solid ${isActive ? "var(--c-accent)" : "transparent"}`,
                    color: isActive ? "var(--c-accent)" : "var(--c-text-muted)",
                    backgroundColor: isActive ? "rgba(255,70,85,0.06)" : "transparent",
                    transition: "all 0.15s ease",
                    cursor: "pointer",
                    letterSpacing: "0.03em",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "var(--c-text)";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(128,128,128,0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = "var(--c-text-muted)";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <DynamicIcon name={item.icon} size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── PROFILE: anchored at bottom by flex layout ── */}
        <div
          style={{
            borderTop: "1px solid var(--c-border)",
            padding: "16px 20px 20px 20px",
            width: "100%",
          }}
        >
          {/* Avatar row */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "13px",
                fontWeight: 700,
                flexShrink: 0,
                backgroundColor: "rgba(255,70,85,0.12)",
                border: "1.5px solid var(--c-accent)",
                color: "var(--c-accent)",
              }}
            >
              {initials}
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: config.color,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {config.label}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--c-text-dim)",
                  marginTop: "2px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Logged in as {config.label}
              </div>
            </div>
          </div>

          {/* Sign Out — full width matching sidebar padding */}
          <Link
            href="/login"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              padding: "8px 12px",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontWeight: 500,
              borderRadius: "6px",
              border: "1px solid var(--c-border)",
              color: "var(--c-text-dim)",
              textDecoration: "none",
              transition: "all 0.15s ease",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--c-text)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border2)";
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(128,128,128,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--c-text-dim)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)";
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            }}
          >
            <IconLogout size={12} />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Spacer div so page content doesn't hide under the fixed sidebar */}
      <div style={{ width: "220px", flexShrink: 0 }} aria-hidden="true" />
    </>
  );
}
