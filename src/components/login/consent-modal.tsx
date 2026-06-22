"use client";
// src/components/login/consent-modal.tsx
// Redesigned: checkbox with Terms & Conditions / Privacy Policy links,
// Privacy Notice box, and modal popups for T&C and Privacy Policy.
// No "View Summary" — excluded per design spec.

import { useState } from "react";

// ---------------------------------------------------------------------------
// Language Toggle Component
// ---------------------------------------------------------------------------
function LanguageToggle({
  value,
  onChange,
}: {
  value: "EN" | "PH";
  onChange: (val: "EN" | "PH") => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: "var(--c-surface2)",
        border: "1px solid var(--c-border)",
        borderRadius: "20px",
        padding: "2px",
        height: "26px",
      }}
    >
      <button
        type="button"
        onClick={() => onChange("EN")}
        style={{
          padding: "2px 8px",
          borderRadius: "16px",
          fontSize: "10px",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          backgroundColor: value === "EN" ? "var(--c-accent)" : "transparent",
          color: value === "EN" ? "#FFFFFF" : "var(--c-text-dim)",
          transition: "all 0.2s ease",
          lineHeight: 1.4,
        }}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onChange("PH")}
        style={{
          padding: "2px 8px",
          borderRadius: "16px",
          fontSize: "10px",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          backgroundColor: value === "PH" ? "var(--c-accent)" : "transparent",
          color: value === "PH" ? "#FFFFFF" : "var(--c-text-dim)",
          transition: "all 0.2s ease",
          lineHeight: 1.4,
        }}
      >
        PH
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Terms & Conditions Modal
// ---------------------------------------------------------------------------
const termsContent = {
  EN: {
    title: "Terms & Conditions",
    intro: "By accessing and using VCF: LVL UP!, you agree to the following terms and conditions:",
    items: [
      "You agree to provide accurate information.",
      "You will use this system for authorized purposes only.",
      "You agree to abide by the rules and guidelines of the tournaments.",
      "We reserve the right to suspend or terminate accounts that violate the system policies.",
      "Users are responsible for maintaining the confidentiality of their account credentials and for all activities performed using their account.",
    ],
    lastUpdated: "Last Updated: June 22, 2026 | Version 1.0",
    understand: "I understand.",
  },
  PH: {
    title: "Mga Tuntunin at Kondisyon",
    intro: "Sa pag-access at paggamit ng VCF: LVL UP!, sumasang-ayon ka sa mga sumusunod na tuntunin at kondisyon:",
    items: [
      "Sumasang-ayon ka na magbigay ng tumpak na impormasyon.",
      "Gagamitin mo lamang ang sistemang ito para sa mga awtorisadong layunin.",
      "Sumasang-ayon ka na sundin ang mga alituntunin at gabay ng mga paligsahan.",
      "Inilalaan namin ang karapatang suspindihin o wakasan ang mga account na lumalabag sa mga patakaran ng sistema.",
      "Ang mga gumagamit ay may pananagutan sa pagpapanatili ng pagiging kumpidensyal ng kanilang mga kredensyal sa account at para sa lahat ng aktibidad na ginawa gamit ang kanilang account.",
    ],
    lastUpdated: "Huling Na-update: Hunyo 22, 2026 | Bersyon 1.0",
    understand: "Naiintindihan ko.",
  }
};

function TermsModal({ onClose }: { onClose: () => void }) {
  const [lang, setLang] = useState<"EN" | "PH">("EN");
  const content = termsContent[lang];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-xl relative"
        style={{
          backgroundColor: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(255,70,85,0.06)",
          animation: "modalSlideIn 0.25s ease-out",
        }}
      >
        {/* Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "28px 28px 0 28px",
          }}
        >
          <h3
            className="font-head"
            style={{
              fontSize: "18px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--c-text)",
              margin: 0,
            }}
          >
            {content.title}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <LanguageToggle value={lang} onChange={setLang} />
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--c-text-dim)",
                cursor: "pointer",
                fontSize: "18px",
                lineHeight: 1,
                transition: "color 0.15s",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-text-dim)")}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: "20px 28px 28px 28px" }}>
          <div
            style={{
              maxHeight: "350px",
              overflowY: "auto",
              paddingRight: "8px",
            }}
          >
            <p style={{ fontSize: "13px", color: "var(--c-text-muted)", lineHeight: 1.7, marginBottom: "16px" }}>
              {content.intro}
            </p>

            <ul style={{ fontSize: "13px", color: "var(--c-text-muted)", lineHeight: 1.8, paddingLeft: "20px", margin: "0 0 16px 0" }}>
              {content.items.map((item, idx) => (
                <li key={idx} style={{ marginBottom: "8px" }}>{item}</li>
              ))}
            </ul>

            <div
              style={{
                fontSize: "11px",
                color: "var(--c-text-dim)",
                borderTop: "1px solid var(--c-border)",
                paddingTop: "12px",
                marginTop: "12px",
              }}
            >
              {content.lastUpdated}
            </div>
          </div>

          {/* Close button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <button
              onClick={onClose}
              className="text-white text-xs font-semibold uppercase tracking-widest px-6 py-2.5 rounded-lg transition-colors"
              style={{ backgroundColor: "#FF4655" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E53E4D")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FF4655")}
            >
              {content.understand}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Privacy Policy Modal
// ---------------------------------------------------------------------------
const privacyContent = {
  EN: {
    title: "Privacy Policy",
    intro: "We value your privacy. This policy explains how we collect, use, and protect your information.",
    sections: [
      {
        title: "1. Information We Collect",
        items: [
          "Personal Information (name, email, role)",
          "Account credentials and login activity",
          "Tournament participation data",
        ]
      },
      {
        title: "2. Why We Collect It",
        items: [
          "To provide and manage system services",
          "To communicate announcements",
          "To improve user experience",
          "To ensure security and prevent fraud",
        ]
      },
      {
        title: "3. Who Can Access It",
        items: [
          "System Developer (full access)",
          "Administrator (limited access)",
          "Organizer (event-related access only)",
        ]
      },
    ],
    sec4Title: "4. How Long We Keep It",
    sec4Body: "We keep your information as long as necessary for system operations or until your account is deleted.",
    lastUpdated: "Last Updated: June 22, 2026 | Version 1.0",
    understand: "I understand.",
  },
  PH: {
    title: "Patakaran sa Privacy",
    intro: "Pinahahalagahan namin ang iyong privacy. Ipinapaliwanag ng patakarang ito kung paano namin kinokolekta, ginagamit, at pinoprotektahan ang iyong impormasyon.",
    sections: [
      {
        title: "1. Impormasyong Aming Kinokolekta",
        items: [
          "Personal na Impormasyon (pangalan, email, papel)",
          "Kredensyal sa account at aktibidad sa pag-login",
          "Datos ng pakikilahok sa paligsahan",
        ]
      },
      {
        title: "2. Bakit Namin Ito Kinokolekta",
        items: [
          "Upang magbigay at mamahala ng mga serbisyo ng sistema",
          "Upang ipagbigay-alam ang mga anunsyo",
          "Upang mapabuti ang karanasan ng gumagamit",
          "Upang masiguro ang seguridad at maiwasan ang panloloko",
        ]
      },
      {
        title: "3. Sino ang Maaaring Maka-access",
        items: [
          "System Developer (buong access)",
          "Administrator (limitadong access)",
          "Organizer (access na may kaugnayan lamang sa kaganapan)",
        ]
      },
    ],
    sec4Title: "4. Gaano Katagal Namin Ito Iniingatan",
    sec4Body: "Iniiingatan namin ang iyong impormasyon hangga't kailangan para sa mga operasyon ng sistema o hanggang sa mabura ang iyong account.",
    lastUpdated: "Huling Na-update: Hunyo 22, 2026 | Bersyon 1.0",
    understand: "Naiintindihan ko.",
  }
};

function PrivacyPolicyModal({ onClose }: { onClose: () => void }) {
  const [lang, setLang] = useState<"EN" | "PH">("EN");
  const content = privacyContent[lang];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-xl relative"
        style={{
          backgroundColor: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(255,70,85,0.06)",
          animation: "modalSlideIn 0.25s ease-out",
        }}
      >
        {/* Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "28px 28px 0 28px",
          }}
        >
          <h3
            className="font-head"
            style={{
              fontSize: "18px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--c-text)",
              margin: 0,
            }}
          >
            {content.title}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <LanguageToggle value={lang} onChange={setLang} />
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--c-text-dim)",
                cursor: "pointer",
                fontSize: "18px",
                lineHeight: 1,
                transition: "color 0.15s",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-text-dim)")}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: "20px 28px 28px 28px" }}>
          <div
            style={{
              maxHeight: "350px",
              overflowY: "auto",
              paddingRight: "8px",
            }}
          >
            <p style={{ fontSize: "13px", color: "var(--c-text-muted)", lineHeight: 1.7, marginBottom: "16px" }}>
              {content.intro}
            </p>

            {content.sections.map((section, sIdx) => (
              <div key={sIdx}>
                <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--c-accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                  {section.title}
                </h4>
                <ul style={{ fontSize: "13px", color: "var(--c-text-muted)", lineHeight: 1.7, paddingLeft: "20px", margin: "0 0 16px 0" }}>
                  {section.items.map((item, iIdx) => (
                    <li key={iIdx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Section 4 */}
            <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--c-accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              {content.sec4Title}
            </h4>
            <p style={{ fontSize: "13px", color: "var(--c-text-muted)", lineHeight: 1.7, marginBottom: "16px" }}>
              {content.sec4Body}
            </p>

            <div
              style={{
                fontSize: "11px",
                color: "var(--c-text-dim)",
                borderTop: "1px solid var(--c-border)",
                paddingTop: "12px",
                marginTop: "12px",
              }}
            >
              {content.lastUpdated}
            </div>
          </div>

          {/* Close button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <button
              onClick={onClose}
              className="text-white text-xs font-semibold uppercase tracking-widest px-6 py-2.5 rounded-lg transition-colors"
              style={{ backgroundColor: "#FF4655" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E53E4D")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FF4655")}
            >
              {content.understand}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Consent Checkbox + Privacy Notice Section
// ---------------------------------------------------------------------------
// This is rendered inline in the login form (not as a popup).
// It contains:
// 1. Checkbox with T&C / Privacy Policy links
// 2. Privacy Notice box
// 3. T&C Modal and Privacy Policy Modal popups when links are clicked

interface ConsentSectionProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ConsentSection({ checked, onChange }: ConsentSectionProps) {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      {/* Checkbox row */}
      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          cursor: "pointer",
          marginBottom: "12px",
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{
            width: "16px",
            height: "16px",
            marginTop: "2px",
            accentColor: "var(--c-accent)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--c-text-muted)" }}>
          I have read, understood, and agree to the{" "}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTerms(true); }}
            style={{
              color: "var(--c-accent)",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: "inherit",
              fontWeight: 600,
            }}
          >
            Terms &amp; Conditions
          </button>{" "}
          and{" "}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPrivacy(true); }}
            style={{
              color: "var(--c-accent)",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: "inherit",
              fontWeight: 600,
            }}
          >
            Privacy Policy
          </button>{" "}
          of VCF: LVL UP!.
        </span>
      </label>

      {/* Privacy Notice box */}
      <div
        style={{
          backgroundColor: "rgba(255,70,85,0.04)",
          border: "1px solid rgba(255,70,85,0.15)",
          borderRadius: "10px",
          padding: "14px 16px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          {/* Shield icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L4 5.5V11C4 16.25 7.4 21.15 12 22.5C16.6 21.15 20 16.25 20 11V5.5L12 2Z"
              fill="rgba(255,70,85,0.15)"
              stroke="#FF4655"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M9 12L11 14L15 10" stroke="#FF4655" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#FF4655",
            }}
          >
            Privacy Notice
          </span>
        </div>

        {/* Body */}
        <p style={{ fontSize: "11px", color: "var(--c-text-muted)", lineHeight: 1.7, margin: "0 0 10px 0" }}>
          This system collects and processes personal information such as your name, email address, account role, login
          activity, and tournament participation records for authentication, event management, communication, and system
          administration purposes.
        </p>
        <p style={{ fontSize: "11px", color: "var(--c-text-muted)", lineHeight: 1.7, margin: 0 }}>
          This system complies with Republic Act No. 10173 (Data Privacy Act of 2012) and follows reasonable measures to
          protect personal information.
        </p>
      </div>

      {/* Modals */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
    </>
  );
}

// ---------------------------------------------------------------------------
// Legacy default export — kept for backward compat but no longer used
// ---------------------------------------------------------------------------
interface ConsentModalProps {
  onAccept: () => void;
  onClose: () => void;
}

export default function ConsentModal({ onAccept, onClose }: ConsentModalProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-xl relative"
        style={{
          backgroundColor: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          animation: "modalSlideIn 0.25s ease-out",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "transparent", border: "none", color: "var(--c-text-dim)",
            cursor: "pointer", fontSize: "18px", lineHeight: 1,
          }}
          aria-label="Close"
        >
          ✕
        </button>

        <div style={{ padding: "28px" }}>
          <h3 className="font-head" style={{ fontSize: "18px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--c-text)", marginBottom: "16px" }}>
            Data Privacy Consent
          </h3>

          <div style={{ backgroundColor: "var(--c-surface2)", border: "1px solid var(--c-border)", borderRadius: "8px", padding: "14px", marginBottom: "16px", maxHeight: "160px", overflowY: "auto" }}>
            <p style={{ fontSize: "12px", color: "var(--c-text-muted)", lineHeight: 1.7 }}>
              In compliance with the <strong style={{ color: "var(--c-text)" }}>Data Privacy Act of 2012 (Republic Act No. 10173)</strong>,
              I hereby voluntarily consent to the collection, processing, storage, and use of my personal information for
              the purpose of accessing and participating in <strong style={{ color: "var(--c-text)" }}>Faith-Based Youth eSports Events</strong>.
            </p>
          </div>

          <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", marginBottom: "20px" }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              style={{ width: "16px", height: "16px", marginTop: "2px", accentColor: "var(--c-accent)", cursor: "pointer" }} />
            <span style={{ fontSize: "12px", color: "var(--c-text-muted)", lineHeight: 1.5 }}>
              I have read, understood, and voluntarily agree to the Data Privacy notice above.
            </span>
          </label>

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={onClose}
              className="flex-1 text-xs uppercase tracking-widest py-2.5 rounded-lg"
              style={{ border: "1px solid var(--c-border)", color: "var(--c-text-dim)", background: "transparent" }}>
              Cancel
            </button>
            <button onClick={() => { if (agreed) onAccept(); }} disabled={!agreed}
              className="flex-1 text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors"
              style={{
                backgroundColor: agreed ? "var(--c-accent)" : "rgba(255,70,85,0.3)",
                color: agreed ? "#fff" : "rgba(255,255,255,0.4)",
                cursor: agreed ? "pointer" : "not-allowed",
              }}>
              I Agree &amp; Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
