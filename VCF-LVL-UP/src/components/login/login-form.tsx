"use client";
// src/components/login/login-form.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import RoleSelector from "@/components/login/role-selector";
import ConsentModal from "@/components/login/consent-modal";
import { UserRole } from "@/types/user";
import { useTheme } from "@/lib/theme-context";

const CONSENT_KEY = "vcf_consent_session";

// Must match the cookie name read by src/middleware.ts.
const ROLE_COOKIE_NAME = "vcf_role";
// 7 days, in seconds — a routing convenience window, not a security token
// lifetime. Firestore rules are the real auth boundary, so a slightly stale
// cookie has no security consequence: worst case the user is bounced to
// /login by the middleware and simply signs in again.
const ROLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/**
 * Sets the `vcf_role` cookie consumed by the Edge middleware (src/middleware.ts)
 * for server-side route guarding. Deliberately NOT httpOnly — it must be
 * writable from client-side JS, both here (on login) and in sidebar.tsx /
 * navbar.tsx (on sign-out). This cookie is a UX routing aid, not a security
 * token; do not treat its presence as proof of authentication anywhere else
 * in the app.
 */
function setRoleCookie(role: UserRole) {
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = [
    `${ROLE_COOKIE_NAME}=${role}`,
    "path=/",
    `max-age=${ROLE_COOKIE_MAX_AGE}`,
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

export default function LoginForm() {
  const router = useRouter();
  const { theme } = useTheme();
  // theme is declared but drives CSS vars — keep it to avoid removing the import
  void theme;

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    if (sessionStorage.getItem(CONSENT_KEY) === "true") {
      setConsentGiven(true);
    }
  }, []);

  const welcomeMessage = selectedRole
    ? `WELCOME BACK, ${selectedRole.toUpperCase()}!`
    : "WELCOME BACK!";

  const handleEmailBlur = () => {
    setTouched((t) => ({ ...t, email: true }));
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setTouched((t) => ({ ...t, password: true }));
    setPasswordErrors(validatePassword(password));
  };

  // ------------------------------------------------------------------
  // Core login — called after consent is confirmed
  // ------------------------------------------------------------------
  const doLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      // 1. Sign in with Firebase Auth
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;

      // 2. Fetch Firestore profile
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) {
        setError("Account setup incomplete. Please contact an administrator.");
        await auth.signOut();
        return;
      }

      const profile = snap.data() as { role: UserRole; status: string };

      // 3. Check account is active
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

      // 4. Verify the role the user selected matches what's stored
      if (selectedRole && profile.role !== selectedRole) {
        setError("The role you selected does not match your account. Please select the correct role.");
        await auth.signOut();
        return;
      }

      // 5. Update lastLogin timestamp (non-blocking — don't await, failure is OK)
      updateDoc(doc(db, "users", uid), { lastLogin: serverTimestamp() }).catch(() => {});

      // 6. Set the role-routing cookie for the Edge middleware BEFORE
      //    navigating, so the very first request to /{role} already carries
      //    a cookie that matches the destination route.
      setRoleCookie(profile.role);

      // 7. Route to the correct dashboard
      router.push(`/${profile.role}`);
    } catch (err: unknown) {
      // Map Firebase Auth error codes to human-friendly messages
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

    if (!selectedRole) { setError("Please select your role."); return; }
    if (eErr || pErr.length > 0) {
      setError("Please fix the errors above before continuing.");
      return;
    }

    setError("");
    if (!consentGiven) { setShowModal(true); return; }
    doLogin();
  };

  const handleConsentAccept = () => {
    sessionStorage.setItem(CONSENT_KEY, "true");
    setConsentGiven(true);
    setShowModal(false);
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

          {/* General error */}
          {error && (
            <p className="text-xs flex items-center gap-1" style={{ color: "#EF4444" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white font-semibold uppercase tracking-widest text-sm py-3 rounded-lg transition-colors"
            style={{
              backgroundColor: isLoading ? "rgba(255,70,85,0.5)" : "var(--c-accent)",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--c-accent-hover)";
            }}
            onMouseLeave={(e) => {
              if (!isLoading) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--c-accent)";
            }}
          >
            {isLoading ? "Signing in…" : "Login"}
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
            Reset Password
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
      </div>
    </>
  );
}