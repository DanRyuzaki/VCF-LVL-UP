"use client";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme-context";

/* ── Session key — clears on every page refresh/tab close ── */
const SESSION_KEY = "vcf_consent_session";

/* ── Language content ── */
const CONTENT = {
  EN: {
    act: "Republic Act No. 10173",
    title: "Data Privacy Consent",
    subtitle: "Please read and agree before accessing the site.",
    body: (
      <>
        In compliance with the{" "}
        <strong style={{ color: "var(--c-text)" }}>
          Data Privacy Act of 2012 (Republic Act No. 10173)
        </strong>
        , I hereby voluntarily consent to the collection, processing, storage, and use of my
        personal information for the purpose of accessing and participating in{" "}
        <strong style={{ color: "var(--c-text)" }}>Faith-Based Youth eSports Events</strong>.
        I understand that my information will be handled securely and used only for legitimate
        system operations and event management purposes. The data collected may include but is
        not limited to: name, email address, in-game details, team assignments, and participation
        records. This data will not be shared with third parties without prior consent.
      </>
    ),
    checkbox: "I have read, understood, and voluntarily agree to the Data Privacy notice above.",
    decline: "Decline",
    agree: "I Agree & Continue",
  },
  PH: {
    act: "Republika Act Blg. 10173",
    title: "Pahintulot sa Privacy ng Data",
    subtitle: "Mangyaring basahin at sumang-ayon bago ma-access ang site.",
    body: (
      <>
        Alinsunod sa{" "}
        <strong style={{ color: "var(--c-text)" }}>
          Batas sa Privacy ng Data ng 2012 (Republika Act Blg. 10173)
        </strong>
        , ako ay kusang-loob na nagbibigay ng pahintulot sa koleksyon, pagpoproseso,
        pag-iimbak, at paggamit ng aking personal na impormasyon para sa layunin ng
        pag-access at pakikilahok sa{" "}
        <strong style={{ color: "var(--c-text)" }}>
          Mga Faith-Based Youth eSports Events
        </strong>
        . Naiintindihan ko na ang aking impormasyon ay mahahawakan nang ligtas at gagamitin
        lamang para sa mga lehitimong operasyon ng sistema at mga layuning pamamahala ng
        kaganapan. Ang nakolektang data ay maaaring kabilang ang sumusunod: pangalan, email
        address, mga detalye sa laro, pagtatalaga ng koponan, at mga rekord ng pakikilahok.
        Ang data na ito ay hindi ibabahagi sa mga ikatlong partido nang walang pahintulot.
      </>
    ),
    checkbox:
      "Nabasa ko, naunawaan, at kusang-loob na sumasang-ayon sa paunawa ng Privacy ng Data sa itaas.",
    decline: "Tanggihan",
    agree: "Sumasang-ayon & Magpatuloy",
  },
};

/* ── Sun icon ── */
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22" />
    </svg>
  );
}

/* ── Moon icon ── */
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

/* ── Main component ── */
export default function DataPrivacyModal() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [visible, setVisible]   = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const [lang, setLang]         = useState<"EN" | "PH">("EN");

  /* Show every time the page loads (sessionStorage resets on refresh) */
  useEffect(() => {
    const accepted = sessionStorage.getItem(SESSION_KEY);
    if (!accepted) {
      setVisible(true);
      setTimeout(() => setAnimateIn(true), 50);
    }
  }, []);

  const handleAccept = () => {
    if (!agreed) return;
    /* Mark accepted for this session only */
    sessionStorage.setItem(SESSION_KEY, "true");
    /* Also persist to localStorage so login page knows */
    localStorage.setItem("vcf_data_privacy_accepted", "true");
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 350);
  };

  const handleDecline = () => {
    window.history.back();
  };

  if (!visible) return null;

  const c = CONTENT[lang];

  /* ── Shared button style helpers ── */
  const controlBtn = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "32px",
    borderRadius: "8px",
    border: `1px solid ${active ? "var(--c-accent)" : "var(--c-border)"}`,
    backgroundColor: active ? "rgba(255,70,85,0.12)" : "var(--c-surface2)",
    color: active ? "var(--c-accent)" : "var(--c-text-dim)",
    fontSize: "0.625rem",
    fontWeight: 700,
    letterSpacing: "1.5px",
    textTransform: "uppercase" as const,
    cursor: "pointer",
    padding: "0 10px",
    transition: "all 0.2s ease",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        backgroundColor: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        opacity: animateIn ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    >
      {/* ── Modal card ── */}
      <div
        style={{
          backgroundColor: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: "16px",
          padding: "32px",
          width: "100%",
          maxWidth: "480px",
          position: "relative",
          transform: animateIn ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease",
          opacity: animateIn ? 1 : 0,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,70,85,0.08)",
        }}
      >
        {/* ── Red top accent bar ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "60px",
            height: "3px",
            backgroundColor: "var(--c-accent)",
            borderRadius: "0 0 4px 4px",
          }}
        />

        {/* ── Top-right controls: Language + Theme ── */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {/* Language pill toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              backgroundColor: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              padding: "3px",
            }}
          >
            <button
              id="lang-toggle-en"
              onClick={() => setLang("EN")}
              title="Switch to English"
              style={{
                ...controlBtn(lang === "EN"),
                border: "none",
                borderRadius: "6px",
                backgroundColor: lang === "EN" ? "var(--c-accent)" : "transparent",
                color: lang === "EN" ? "#fff" : "var(--c-text-dim)",
                padding: "0 8px",
                height: "26px",
                fontSize: "10px",
              }}
            >
              EN
            </button>
            <button
              id="lang-toggle-ph"
              onClick={() => setLang("PH")}
              title="Switch to Filipino"
              style={{
                ...controlBtn(lang === "PH"),
                border: "none",
                borderRadius: "6px",
                backgroundColor: lang === "PH" ? "var(--c-accent)" : "transparent",
                color: lang === "PH" ? "#fff" : "var(--c-text-dim)",
                padding: "0 8px",
                height: "26px",
                fontSize: "10px",
              }}
            >
              PH
            </button>
          </div>

          {/* Theme toggle */}
          <button
            id="consent-theme-toggle"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              border: `1px solid ${isDark ? "#2E2E2E" : "#D4D4D8"}`,
              backgroundColor: isDark ? "#1A1A1A" : "#F0F0F2",
              color: isDark ? "#FFD700" : "#F59E0B",
              cursor: "pointer",
              transition: "all 0.2s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            {isDark ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>

        {/* ── Shield icon ── */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: "rgba(255,70,85,0.1)",
            border: "1px solid rgba(255,70,85,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="var(--c-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        {/* ── Header ── */}
        <div style={{ marginBottom: "20px", paddingRight: "100px" }}>
          <div
            style={{
              fontSize: "0.625rem",
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: "var(--c-accent)",
              marginBottom: "6px",
              transition: "none",
            }}
          >
            {c.act}
          </div>
          <h2
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "1.375rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "var(--c-text)",
              marginBottom: "4px",
            }}
          >
            {c.title}
          </h2>
          <p style={{ fontSize: "0.75rem", color: "var(--c-text-dim)" }}>{c.subtitle}</p>
        </div>

        {/* ── Consent text box ── */}
        <div
          style={{
            backgroundColor: "var(--c-surface2)",
            border: "1px solid var(--c-border)",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "20px",
            maxHeight: "160px",
            overflowY: "auto",
          }}
        >
          <p style={{ fontSize: "0.75rem", lineHeight: "1.8", color: "var(--c-text-muted)" }}>
            {c.body}
          </p>
        </div>

        {/* ── Checkbox ── */}
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            marginBottom: "24px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            id="landing-consent-checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{
              marginTop: "2px",
              width: "16px",
              height: "16px",
              cursor: "pointer",
              accentColor: "var(--c-accent)",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: "0.75rem", lineHeight: "1.6", color: "var(--c-text-muted)" }}>
            {c.checkbox}
          </span>
        </label>

        {/* ── Action buttons ── */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            id="landing-consent-decline"
            onClick={handleDecline}
            style={{
              flex: 1,
              border: "1px solid var(--c-border)",
              color: "var(--c-text-dim)",
              fontSize: "0.6875rem",
              textTransform: "uppercase",
              letterSpacing: "2px",
              padding: "12px",
              borderRadius: "8px",
              background: "transparent",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--c-text-dim)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--c-text-muted)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--c-border)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--c-text-dim)";
            }}
          >
            {c.decline}
          </button>

          <button
            id="landing-consent-accept"
            onClick={handleAccept}
            disabled={!agreed}
            style={{
              flex: 2,
              backgroundColor: agreed ? "var(--c-accent)" : "rgba(255,70,85,0.2)",
              color: agreed ? "#ffffff" : "rgba(255,255,255,0.35)",
              fontSize: "0.6875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "2px",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              cursor: agreed ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (agreed)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "var(--c-accent-hover)";
            }}
            onMouseLeave={(e) => {
              if (agreed)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--c-accent)";
            }}
          >
            {c.agree}
          </button>
        </div>
      </div>
    </div>
  );
}
