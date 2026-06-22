"use client";
// src/components/login/login-form.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ConsentSection } from "@/components/login/consent-modal";
import { UserRole } from "@/types/user";
import { useTheme } from "@/lib/theme-context";

const CONSENT_KEY = "vcf_consent_accepted";
const POLICY_VERSION = "1.0"; // bump when policy changes to re-prompt

// Must match the cookie name read by src/middleware.ts.
const ROLE_COOKIE_NAME = "vcf_role";
const ROLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function setRoleCookie(role: UserRole, rememberMe: boolean) {
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = [
    `${ROLE_COOKIE_NAME}=${role}`,
    "path=/",
    // Remembered: persists for 7 days like the Firebase session does.
    // Not remembered: omit max-age entirely so it's a session cookie that
    // disappears when the browser closes, matching browserSessionPersistence.
    rememberMe ? `max-age=${ROLE_COOKIE_MAX_AGE}` : "",
    "samesite=lax",
    isHttps ? "secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

function validateEmail(email: string): string {
  if (!email) return "Email address is required.";
  if (/^[^a-zA-Z]/.test(email)) return "Email must start with a letter.";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(email)) return "Please enter a valid email address (e.g. you@domain.com).";
  return "";
}

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (!password) { errors.push("Password is required."); return errors; }
  return errors;
}

/**
 * Writes a consent acceptance record to Firestore for audit/compliance.
 */
async function storeConsentRecord(uid: string) {
  try {
    const now = new Date();
    const deviceInfo = typeof navigator !== "undefined"
      ? `${navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Firefox") ? "Firefox" : navigator.userAgent.includes("Safari") ? "Safari" : "Browser"} / ${navigator.platform || "Unknown"}`
      : "Unknown";

    await setDoc(doc(db, "consent_records", uid), {
      userId: uid,
      policyVersion: POLICY_VERSION,
      dateAccepted: now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      timeAccepted: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      deviceBrowser: deviceInfo,
      timestamp: serverTimestamp(),
      acceptedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Failed to store consent record:", err);
    // Non-blocking — don't prevent login
  }
}

export default function LoginForm() {
  const router = useRouter();
  const { theme } = useTheme();
  void theme;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState({ email: false, password: false });

  // Restore consent from localStorage (persists across sessions)
  useEffect(() => {
    const storedVersion = localStorage.getItem(CONSENT_KEY);
    if (storedVersion === POLICY_VERSION) {
      setConsentGiven(true);
    }
  }, []);

  const handleConsentChange = (checked: boolean) => {
    setConsentGiven(checked);
    if (checked) {
      localStorage.setItem(CONSENT_KEY, POLICY_VERSION);
    } else {
      localStorage.removeItem(CONSENT_KEY);
    }
  };

  const welcomeMessage = "WELCOME BACK!";

  const handleEmailBlur = () => {
    setTouched((t) => ({ ...t, email: true }));
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setTouched((t) => ({ ...t, password: true }));
    setPasswordErrors(validatePassword(password));
  };

  // ------------------------------------------------------------------
  // Core login
  // ------------------------------------------------------------------
  const doLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Persistence must be set BEFORE signInWithEmailAndPassword — Firebase
      // applies whatever persistence is currently configured to the session
      // created by the next sign-in call.
      //   - rememberMe → browserLocalPersistence: survives browser restarts.
      //   - not remembered → browserSessionPersistence: cleared when the
      //     browser/tab is closed, so the user is signed out next visit.
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const credential = await signInWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;

      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) {
        setError("Account setup incomplete. Please contact an administrator.");
        await auth.signOut();
        return;
      }

      const profile = snap.data() as { role: UserRole; status: string };

      if (profile.status === "inactive") {
        setError("Your account is inactive. Please contact an administrator.");
        await auth.signOut();
        return;
      }
      if (profile.status === "suspended") {
        setError("Your account has been suspended. Please contact an administrator.");
        await auth.signOut();
        return;
      }

      // Role is read straight from the user's Firestore document — never
      // from a client-side choice. The account's role in the database is
      // the single source of truth for where the user is routed.

      // Store consent record in Firestore (non-blocking)
      storeConsentRecord(uid);

      // Update lastLogin timestamp (non-blocking)
      updateDoc(doc(db, "users", uid), { lastLogin: serverTimestamp() }).catch(() => {});

      setRoleCookie(profile.role, rememberMe);
      router.push(`/${profile.role}`);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError("Incorrect email or password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please wait a moment and try again.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Please check your connection.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordErrors(pErr);

    if (eErr || pErr.length > 0) {
      setError("Please fix the errors above before continuing.");
      return;
    }

    if (!consentGiven) {
      setError("You must agree to the Terms & Conditions and Privacy Policy before logging in.");
      return;
    }

    setError("");
    doLogin();
  };

  const inputStyle = (hasError: boolean) => ({
    width: "100%",
    backgroundColor: "var(--c-surface2)",
    border: `1px solid ${hasError ? "#EF4444" : "var(--c-border)"}`,
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "0.875rem",
    color: "var(--c-text)",
    outline: "none",
    transition: "border-color 0.2s",
  });

  const canLogin = consentGiven && !isLoading;

  return (
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
          <span style={{ color: "var(--c-text)" }}>VCF: </span>
          <span style={{ color: "var(--c-accent)" }}>LVL UP!</span>
        </div>
        <h2
          className="font-head text-xl font-bold uppercase tracking-[2px] mb-1"
          style={{ color: "var(--c-text)" }}
        >
          {welcomeMessage}
        </h2>
        <p className="text-xs" style={{ color: "var(--c-text-dim)" }}>
          Sign in with your account
        </p>
      </div>

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
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
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
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: "var(--c-text-dim)" }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {touched.password && passwordErrors.length > 0 && (
            <p id="password-errors" className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#EF4444" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {password.length === 0 ? "Password is required." : "Password is incorrect."}
            </p>
          )}
        </div>

        {/* ── Remember Me ── */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{
              width: "16px",
              height: "16px",
              accentColor: "var(--c-accent)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: "12px", color: "var(--c-text-muted)" }}>
            Remember me on this device
          </span>
        </label>

        {/* ── Consent Section (checkbox + T&C/Privacy links + Privacy Notice) ── */}
        <div style={{ marginTop: "8px" }}>
          <ConsentSection checked={consentGiven} onChange={handleConsentChange} />
        </div>

        {/* General error */}
        {error && (
          <p className="text-xs flex items-center gap-1" style={{ color: "#EF4444" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
          </p>
        )}

        {/* Submit — disabled unless consent given */}
        <button
          type="submit"
          disabled={!canLogin}
          className="w-full text-white font-semibold uppercase tracking-widest text-sm py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor: !canLogin ? "rgba(255,70,85,0.35)" : "var(--c-accent)",
            cursor: !canLogin ? "not-allowed" : "pointer",
            color: !canLogin ? "rgba(255,255,255,0.5)" : "#FFFFFF",
          }}
          onMouseEnter={(e) => {
            if (canLogin) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--c-accent-hover)";
          }}
          onMouseLeave={(e) => {
            if (canLogin) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--c-accent)";
          }}
        >
          {isLoading ? "Signing in…" : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Login
            </>
          )}
        </button>

        {/* Reset Password */}
        <a
          href="/login/reset-password"
          className="block w-full text-center font-semibold uppercase tracking-widest text-xs py-2.5 rounded-lg transition-all"
          style={{
            color: "var(--c-text-dim)",
            border: "1px solid var(--c-border)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--c-accent)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--c-accent)";
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,70,85,0.06)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--c-text-dim)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)";
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          }}
        >
          ↻ Reset Password
        </a>
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

      {/* Footer — cookie & privacy contact */}
      <div
        style={{
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: "1px solid var(--c-border)",
          textAlign: "center",
        }}
      >
        <div style={{ display: "inline-block", textAlign: "left", maxWidth: "100%" }}>
          <p style={{ fontSize: "10px", color: "var(--c-text-dim)", lineHeight: 1.6, marginBottom: "6px", display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, flexShrink: 0, marginTop: "2px" }}>
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              <circle cx="8" cy="14" r="1" fill="currentColor" stroke="none" />
              <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
              <circle cx="7" cy="9" r="1" fill="currentColor" stroke="none" />
              <circle cx="16" cy="15" r="1" fill="currentColor" stroke="none" />
            </svg>
            <span>
              This system uses session cookies to maintain secure authentication and user access.
            </span>
          </p>
          <p style={{ fontSize: "10px", color: "var(--c-text-dim)", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: "6px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, flexShrink: 0, marginTop: "2px" }}>
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 0-2.06 0L2 7" />
            </svg>
            <span>
              Questions about your data privacy? Contact:{" "}
              <a href="mailto:privacy@vcf-lvlup.web.app" style={{ color: "var(--c-accent)", textDecoration: "none", fontWeight: 600 }}>
                privacy@vcf-lvlup.web.app
              </a>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}