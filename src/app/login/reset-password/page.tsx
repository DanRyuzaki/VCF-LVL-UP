"use client";
import { useState } from "react";
import { useTheme } from "@/lib/theme-context";

/* ── Mock "database" of known emails ── */
const KNOWN_EMAILS = [
  "marco@faith.com",
  "john@faith.com",
  "ana@faith.com",
  "ben@faith.com",
  "liza@faith.com",
];

function validateEmail(email: string): string {
  if (!email) return "Email address is required.";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(email)) return "Please enter a valid email address (e.g. you@domain.com).";
  return "";
}

/* ── Gaming-themed Success Icon (Green Shield Check) ── */
function SuccessIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer glow ring */}
      <circle cx="40" cy="40" r="38" stroke="#00F5D4" strokeWidth="1.5" opacity="0.3" />
      <circle cx="40" cy="40" r="34" stroke="#00F5D4" strokeWidth="1" opacity="0.15" />
      {/* Shield body */}
      <path
        d="M40 10L18 20V36C18 50.36 27.84 63.54 40 68C52.16 63.54 62 50.36 62 36V20L40 10Z"
        fill="rgba(0,245,212,0.08)"
        stroke="#00F5D4"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Inner hexagon accent */}
      <path
        d="M40 22L28 28V38C28 47.5 33.2 56.2 40 60C46.8 56.2 52 47.5 52 38V28L40 22Z"
        fill="rgba(0,245,212,0.12)"
        stroke="#00F5D4"
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity="0.6"
      />
      {/* Check mark */}
      <polyline
        points="31,40 37,47 50,32"
        stroke="#00F5D4"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Sparkle accents */}
      <circle cx="22" cy="18" r="1.5" fill="#00F5D4" opacity="0.5" />
      <circle cx="58" cy="18" r="1" fill="#00F5D4" opacity="0.4" />
      <circle cx="15" cy="40" r="1" fill="#00F5D4" opacity="0.3" />
      <circle cx="65" cy="40" r="1.5" fill="#00F5D4" opacity="0.35" />
    </svg>
  );
}

/* ── Gaming-themed Error Icon (Sad Shield) ── */
function ErrorIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer glow ring */}
      <circle cx="40" cy="40" r="38" stroke="#FF4655" strokeWidth="1.5" opacity="0.3" />
      <circle cx="40" cy="40" r="34" stroke="#FF4655" strokeWidth="1" opacity="0.15" />
      {/* Shield body */}
      <path
        d="M40 10L18 20V36C18 50.36 27.84 63.54 40 68C52.16 63.54 62 50.36 62 36V20L40 10Z"
        fill="rgba(255,70,85,0.08)"
        stroke="#FF4655"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Sad face - eyes */}
      <circle cx="33" cy="36" r="2.5" fill="#FF4655" />
      <circle cx="47" cy="36" r="2.5" fill="#FF4655" />
      {/* Sad mouth (frown arc) */}
      <path
        d="M32 50C34 46 38 44 40 44C42 44 46 46 48 50"
        stroke="#FF4655"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Crack lines for "broken" feel */}
      <line x1="40" y1="10" x2="38" y2="22" stroke="#FF4655" strokeWidth="1" opacity="0.3" />
      <line x1="38" y1="22" x2="42" y2="28" stroke="#FF4655" strokeWidth="1" opacity="0.25" />
      {/* Sparkle accents */}
      <circle cx="22" cy="18" r="1.5" fill="#FF4655" opacity="0.4" />
      <circle cx="58" cy="18" r="1" fill="#FF4655" opacity="0.35" />
      <circle cx="15" cy="40" r="1" fill="#FF4655" opacity="0.25" />
      <circle cx="65" cy="40" r="1.5" fill="#FF4655" opacity="0.3" />
    </svg>
  );
}

/* ── Result Modal ── */
function ResultModal({ type, onClose }: { type: "success" | "error"; onClose: () => void }) {
  const isSuccess = type === "success";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        animation: "rpFadeIn 0.2s ease-out",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "420px",
          backgroundColor: "var(--c-surface)",
          border: `1px solid ${isSuccess ? "rgba(0,245,212,0.25)" : "rgba(255,70,85,0.25)"}`,
          borderRadius: "12px",
          boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 60px ${isSuccess ? "rgba(0,245,212,0.08)" : "rgba(255,70,85,0.08)"}`,
          animation: "rpSlideIn 0.3s ease-out",
          textAlign: "center",
          padding: "40px 32px 32px",
        }}
      >
        {/* Icon */}
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center" }}>
          {isSuccess ? <SuccessIcon /> : <ErrorIcon />}
        </div>

        {/* Title */}
        <h3
          className="font-head"
          style={{
            fontSize: "20px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: isSuccess ? "#00F5D4" : "#FF4655",
            marginBottom: "12px",
          }}
        >
          {isSuccess ? "Password Reset Link Sent" : "Email Address Not Found"}
        </h3>

        {/* Message */}
        <p style={{ fontSize: "13px", lineHeight: 1.7, color: "var(--c-text-muted)", marginBottom: "28px" }}>
          {isSuccess
            ? "A password reset confirmation link has been sent to your email inbox. If you do not receive it, please check your Spam folder."
            : "The email address you entered was not found in the database. Please try again."}
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            fontSize: "13px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            cursor: "pointer",
            transition: "background-color 0.15s",
            backgroundColor: isSuccess ? "#00F5D4" : "#FF4655",
            color: isSuccess ? "#0A0A0A" : "#FFFFFF",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget).style.backgroundColor = isSuccess ? "#00D4B8" : "#E53E4D";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget).style.backgroundColor = isSuccess ? "#00F5D4" : "#FF4655";
          }}
        >
          {isSuccess ? "Back to Login" : "Try Again"}
        </button>
      </div>

      <style jsx>{`
        @keyframes rpFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes rpSlideIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   RESET PASSWORD PAGE
   ══════════════════════════════════════════════════ */
export default function ResetPasswordPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [touched, setTouched] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error" | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const err = validateEmail(email);
    setEmailError(err);
    if (err) return;

    // Check against mock "database"
    if (KNOWN_EMAILS.includes(email.toLowerCase())) {
      setModalType("success");
    } else {
      setModalType("error");
    }
  };

  const handleModalClose = () => {
    if (modalType === "success") {
      window.location.href = "/login";
    }
    setModalType(null);
  };

  const inputStyle = (hasError: boolean) => ({
    width: "100%",
    backgroundColor: "var(--c-surface2)",
    border: `1px solid ${hasError ? "#EF4444" : "var(--c-border)"}`,
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    color: "var(--c-text)",
    outline: "none",
    transition: "border-color 0.2s",
  });

  return (
    <>
      {modalType && <ResultModal type={modalType} onClose={handleModalClose} />}

      <div
        className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
        style={{ backgroundColor: "var(--c-page-bg)" }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px]"
            style={{ backgroundColor: "rgba(255,70,85,0.06)" }}
          />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div
            className="border rounded-xl p-8 w-full max-w-md"
            style={{
              backgroundColor: "var(--c-surface)",
              borderColor: "var(--c-border)",
            }}
          >
            {/* Logo */}
            <div className="text-center mb-6">
              <div className="font-head text-2xl font-bold tracking-widest uppercase mb-1">
                <span style={{ color: isDark ? "#FFFFFF" : "#000000" }}>VCF: </span>
                <span style={{ color: "var(--c-accent)" }}>LVL UP!</span>
              </div>
              <h2
                className="font-head text-xl font-bold uppercase tracking-[2px] mb-1"
                style={{ color: "var(--c-text)" }}
              >
                RESET PASSWORD
              </h2>
              <p className="text-xs" style={{ color: "var(--c-text-dim)" }}>
                Enter your email to receive a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-[10px] uppercase tracking-[1.5px] mb-1.5 font-semibold"
                  style={{ color: "var(--c-text-dim)" }}
                >
                  Email Address{" "}
                  <span style={{ color: "#EF4444" }} aria-label="required">*</span>
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched) setEmailError(validateEmail(e.target.value));
                  }}
                  onBlur={() => {
                    setTouched(true);
                    setEmailError(validateEmail(email));
                  }}
                  placeholder="you@faithyouth.com"
                  autoComplete="email"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "reset-email-error" : undefined}
                  style={inputStyle(!!emailError)}
                  onFocus={(e) =>
                    ((e.target as HTMLInputElement).style.borderColor = emailError ? "#EF4444" : "var(--c-accent)")
                  }
                />
                {emailError && (
                  <p id="reset-email-error" className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#EF4444" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    {emailError}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full text-white font-semibold uppercase tracking-widest text-sm py-3 rounded-lg transition-colors"
                style={{ backgroundColor: "var(--c-accent)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--c-accent-hover)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--c-accent)")
                }
              >
                Submit
              </button>
            </form>

            {/* Back to Login */}
            <div className="text-center mt-5">
              <a
                href="/login"
                className="text-xs transition-colors"
                style={{ color: "var(--c-text-dim)" }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "var(--c-text-muted)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "var(--c-text-dim)")
                }
              >
                ← Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
