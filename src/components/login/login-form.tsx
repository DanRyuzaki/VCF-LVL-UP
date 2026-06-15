"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RoleSelector from "@/components/login/role-selector";
import ConsentModal from "@/components/login/consent-modal";
import { UserRole } from "@/types/user";

/* ── Validation Helpers ─────────────────────────────────── */

function validateEmail(email: string): string {
  if (!email) return "Email address is required.";
  // RFC 5322-ish email regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(email)) return "Please enter a valid email address (e.g. you@domain.com).";
  return "";
}

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (!password) { errors.push("Password is required."); return errors; }
  return errors;
}

/* ── Component ──────────────────────────────────────────── */

export default function LoginForm() {
  const router = useRouter();
  const [selectedRole, setSelectedRole]   = useState<UserRole | null>(null);
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [consentGiven, setConsentGiven]   = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [error, setError]                 = useState("");

  // Inline validation errors (shown on blur or submit)
  const [emailError, setEmailError]       = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [touched, setTouched]             = useState({ email: false, password: false });

  const welcomeMessage = selectedRole
    ? `WELCOME BACK, ${selectedRole.toUpperCase()}!`
    : "WELCOME BACK!";

  const pwErrors   = validatePassword(password);

  /* ─ Handlers ─ */
  const handleEmailBlur = () => {
    setTouched((t) => ({ ...t, email: true }));
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setTouched((t) => ({ ...t, password: true }));
    setPasswordErrors(validatePassword(password));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    setEmailError(eErr);
    setPasswordErrors(pErr);

    if (!selectedRole) { setError("Please select your role."); return; }
    if (eErr || pErr.length > 0) {
      setError("Please fix the errors above before continuing.");
      return;
    }

    setError("");
    if (!consentGiven) { setShowModal(true); return; }
    router.push(`/${selectedRole}`);
  };

  const handleConsentAccept = () => {
    setConsentGiven(true);
    setShowModal(false);
    router.push(`/${selectedRole}`);
  };

  /* ─ Styles ─ */
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
      {showModal && (
        <ConsentModal onAccept={handleConsentAccept} onClose={() => setShowModal(false)} />
      )}

      <div
        className="border rounded-xl p-8 w-full max-w-md"
        style={{
          backgroundColor: "var(--c-surface)",
          borderColor: "var(--c-border)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div
            className="font-head text-2xl font-bold tracking-widest uppercase mb-1"
            style={{ color: "var(--c-accent)" }}
          >
            VCF-LVL-UP
          </div>
          <h2
            className="font-head text-xl font-bold uppercase tracking-[2px] mb-1"
            style={{ color: "var(--c-text)" }}
          >
            {welcomeMessage}
          </h2>
          <p className="text-xs" style={{ color: "var(--c-text-dim)" }}>
            Select your role to continue
          </p>
        </div>

        {/* Role Selector */}
        <RoleSelector selected={selectedRole} onSelect={setSelectedRole} />

        <form onSubmit={handleLogin} className="space-y-4" noValidate>

          {/* ── Email ── */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-[10px] uppercase tracking-[1.5px] mb-1.5 font-semibold"
              style={{ color: "var(--c-text-dim)" }}
            >
              Email Address{" "}
              <span style={{ color: "#EF4444" }} aria-label="required">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                if (touched.email) setEmailError(validateEmail(e.target.value));
              }}
              onBlur={handleEmailBlur}
              placeholder="you@faithyouth.com"
              autoComplete="email"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
              style={inputStyle(!!emailError)}
              onFocus={(e) =>
                ((e.target as HTMLInputElement).style.borderColor = emailError ? "#EF4444" : "var(--c-accent)")
              }
            />
            {emailError && (
              <p id="email-error" className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#EF4444" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {emailError}
              </p>
            )}
          </div>

          {/* ── Password ── */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-[10px] uppercase tracking-[1.5px] mb-1.5 font-semibold"
              style={{ color: "var(--c-text-dim)" }}
            >
              Password{" "}
              <span style={{ color: "#EF4444" }} aria-label="required">*</span>
            </label>

            {/* Password input + show/hide toggle */}
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                  if (touched.password) setPasswordErrors(validatePassword(e.target.value));
                }}
                onBlur={handlePasswordBlur}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={passwordErrors.length > 0}
                aria-describedby={passwordErrors.length > 0 ? "password-errors" : undefined}
                style={{ ...inputStyle(passwordErrors.length > 0 && touched.password), paddingRight: "42px" }}
                onFocus={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor =
                    passwordErrors.length > 0 && touched.password ? "#EF4444" : "var(--c-accent)")
                }
              />
              {/* Show/hide password */}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: "var(--c-text-dim)" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Password error message */}
            {touched.password && passwordErrors.length > 0 && (
              <p id="password-errors" className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#EF4444" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {password.length === 0 ? "Password is required." : "Password is incorrect."}
              </p>
            )}
          </div>

          {/* Consent note */}
          <div
            className="rounded-lg p-3 border"
            style={{
              backgroundColor: "var(--c-surface2)",
              borderColor: "var(--c-border)",
            }}
          >
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
              By logging in you agree to our Data Privacy policy in compliance with{" "}
              <span style={{ color: "var(--c-text-muted)" }}>RA 10173</span>. You will be prompted to confirm
              your consent before proceeding.
            </p>
          </div>

          {/* General error */}
          {error && (
            <p className="text-xs flex items-center gap-1" style={{ color: "#EF4444" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error}
            </p>
          )}

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
            Login
          </button>
        </form>

        <div className="text-center mt-5">
          <a
            href="/"
            className="text-xs transition-colors"
            style={{ color: "var(--c-text-dim)" }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "var(--c-text-muted)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "var(--c-text-dim)")
            }
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </>
  );
}
