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
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: "8px" }}>

          {/* ── BRANDED SIDEBAR HEADER ── */}
          <div
            style={{
              padding: "20px 18px 16px 18px",
              borderBottom: "1px solid var(--c-border)",
              marginBottom: "4px",
            }}
          >
            {/* Icon + Title row */}
            <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
              {/* Esports Gamepad SVG Icon */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,70,85,0.10)",
                  border: "1.5px solid rgba(255,70,85,0.30)",
                  flexShrink: 0,
                  boxShadow: "0 0 12px rgba(255,70,85,0.15)",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Controller body */}
                  <path
                    d="M6 10C6 7.79 7.79 6 10 6H14C16.21 6 18 7.79 18 10V14C18 16.21 16.21 18 14 18H10C7.79 18 6 16.21 6 14V10Z"
                    stroke="#ff4655"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* D-pad vertical */}
                  <line x1="9" y1="10.5" x2="9" y2="13.5" stroke="#ff4655" strokeWidth="1.5" strokeLinecap="round" />
                  {/* D-pad horizontal */}
                  <line x1="7.5" y1="12" x2="10.5" y2="12" stroke="#ff4655" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Action buttons */}
                  <circle cx="15" cy="11" r="0.75" fill="#00d4ff" />
                  <circle cx="14" cy="13" r="0.75" fill="#a855f7" />
                  <circle cx="16" cy="13" r="0.75" fill="#ff4655" />
                  {/* Left bumper */}
                  <path d="M8 6.5C8 5.67 8.67 5 9.5 5H10.5" stroke="#ff4655" strokeWidth="1.2" strokeLinecap="round" />
                  {/* Right bumper */}
                  <path d="M16 6.5C16 5.67 15.33 5 14.5 5H13.5" stroke="#ff4655" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Title + Subtitle */}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'Rajdhani', 'Teko', 'Montserrat', sans-serif",
                    fontSize: "15px",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    lineHeight: 1.1,
                    background: "linear-gradient(90deg, #ff4655 0%, #ff6b7a 40%, #00d4ff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textShadow: "none",
                    filter: "drop-shadow(0 0 6px rgba(255,70,85,0.45))",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  VCF: LVL UP!
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', 'Rajdhani', sans-serif",
                    fontSize: "9.5px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--c-text-dim)",
                    marginTop: "3px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  eSports Management
                </div>
              </div>
            </div>
          </div>

          {/* ── NAVIGATION SECTION LABEL ── */}
          <div
            style={{
              fontSize: "9px",
              fontFamily: "'Inter', sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontWeight: 700,
              color: "var(--c-text-dim)",
              padding: "12px 20px 6px 20px",
              opacity: 0.6,
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
                    padding: "9px 20px",
                    fontSize: "13px",
                    fontFamily: "'Inter', 'Rajdhani', sans-serif",
                    fontWeight: isActive ? 700 : 500,
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
