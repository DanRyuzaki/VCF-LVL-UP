"use client";
// src/modules/user-management/add-admin-modal.tsx
import { useState } from "react";
import ModalBackdrop from "@/components/shared/modal-backdrop";
import {
  validateFirstLastName,
  validateMiddleInitial,
  validateEmail,
  validatePassword,
  getPasswordStrength,
  containsProfanity,
  checkDuplicateEmail,
} from "./validation-utils";

interface AddAdminModalProps {
  onClose: () => void;
  onSave: (admin: Record<string, string>) => Promise<{ success: boolean; error?: string }>;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StrengthMeter({ password }: { password: string }) {
  const { label, color, percent } = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div style={{ marginTop: "8px" }}>
      <div
        style={{
          height: "4px",
          backgroundColor: "var(--c-surface3)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: "2px",
            transition: "width 0.3s ease, background-color 0.3s ease",
          }}
        />
      </div>
      <p style={{ fontSize: "11px", fontWeight: 600, color, marginTop: "4px", textAlign: "right" }}>
        {label}
      </p>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      {message}
    </p>
  );
}

function EyeToggle({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--c-text-dim)",
        padding: "4px",
        display: "flex",
        alignItems: "center",
        transition: "color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-text)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-text-dim)")}
      aria-label={visible ? "Hide password" : "Show password"}
      title={visible ? "Hide password" : "Show password"}
    >
      {visible ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
          <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
type ModalStep = "form" | "confirm" | "success";

export default function AddAdminModal({ onClose, onSave }: AddAdminModalProps) {
  // Form fields
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Active");
  const [tempPassword, setTempPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Errors
  const [firstNameError, setFirstNameError] = useState("");
  const [middleInitialError, setMiddleInitialError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Modal flow state
  const [step, setStep] = useState<ModalStep>("form");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const runValidation = async (): Promise<boolean> => {
    const fnErr = validateFirstLastName(firstName, "First name");
    const miErr = validateMiddleInitial(middleInitial);
    const lnErr = validateFirstLastName(lastName, "Last name");
    const emErr = validateEmail(email);
    const pwdErrs = validatePassword(tempPassword, { email, firstName, lastName });

    const fnProf = !fnErr ? containsProfanity(firstName) : "";
    const lnProf = !lnErr ? containsProfanity(lastName) : "";

    setFirstNameError(fnErr || fnProf);
    setMiddleInitialError(miErr);
    setLastNameError(lnErr || lnProf);
    setEmailError(emErr);
    setPasswordErrors(pwdErrs);

    if (fnErr || fnProf || miErr || lnErr || lnProf || emErr || pwdErrs.length > 0) return false;

    const dupErr = await checkDuplicateEmail(email);
    if (dupErr) {
      setEmailError(dupErr);
      return false;
    }

    return true;
  };

  const handleSaveClick = async () => {
    setSubmitted(true);
    setSaveError("");
    const valid = await runValidation();
    if (!valid) return;
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setSaving(true);
    setSaveError("");

    const result = await onSave({
      firstName: firstName.trim(),
      middleInitial: middleInitial.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      role: "Admin",
      status,
      tempPassword,
    });

    setSaving(false);

    if (result.success) {
      setStep("success");
    } else {
      setSaveError(result.error || "Failed to create admin account. Please try again.");
      setStep("form");
    }
  };

  const fieldError = (val: string) => submitted && !val;
  const fullName = `${firstName.trim()}${middleInitial ? ` ${middleInitial.trim()}.` : ""} ${lastName.trim()}`.trim();

  // ===========================================================================
  // STEP 3: Success Modal
  // ===========================================================================
  if (step === "success") {
    return (
      <ModalBackdrop onClose={onClose} maxWidth="480px">
        <div style={{ textAlign: "center", paddingTop: "8px" }}>
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 16px" }}>
            <circle cx="36" cy="36" r="34" stroke="#00F5D4" strokeWidth="1.5" opacity="0.25" />
            <circle cx="36" cy="36" r="28" fill="rgba(0,245,212,0.08)" stroke="#00F5D4" strokeWidth="1.5" />
            <path d="M24 36L32 44L48 28" stroke="#00F5D4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#00F5D4", marginBottom: "4px" }}>
            ✅ Account Created Successfully
          </h3>
          <p style={{ fontSize: "12px", color: "var(--c-text-dim)", marginBottom: "20px" }}>
            The new admin account has been created.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "var(--c-surface2)",
            border: "1px solid var(--c-border)",
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "20px",
          }}
        >
          {[
            { label: "Name", value: fullName },
            { label: "Role", value: "Admin" },
            { label: "Email", value: email },
            { label: "Temporary Password", value: tempPassword },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid var(--c-border)",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                {item.label}
              </span>
              <span style={{
                fontSize: "13px",
                fontWeight: 600,
                color: item.label === "Temporary Password" ? "#F59E0B" : "var(--c-text)",
                fontFamily: item.label === "Temporary Password" ? "monospace" : "inherit",
              }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "12px", color: "var(--c-text-muted)", textAlign: "center", marginBottom: "20px", lineHeight: 1.5 }}>
          Please provide these credentials to the user.
        </p>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={onClose}
            className="text-white text-xs font-semibold uppercase tracking-widest px-6 py-2.5 rounded-lg transition-colors"
            style={{ backgroundColor: "#FF4655" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E53E4D")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FF4655")}
          >
            Back
          </button>
        </div>
      </ModalBackdrop>
    );
  }

  // ===========================================================================
  // STEP 2: Confirmation Modal
  // ===========================================================================
  if (step === "confirm") {
    return (
      <ModalBackdrop onClose={() => setStep("form")} title="Create User Account?" subtitle="Please review the details below" maxWidth="480px">
        <div
          style={{
            backgroundColor: "var(--c-surface2)",
            border: "1px solid var(--c-border)",
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "24px",
          }}
        >
          {[
            { label: "Name", value: fullName },
            { label: "Role", value: "Admin" },
            { label: "Email", value: email },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid var(--c-border)",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                {item.label}
              </span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--c-text)" }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {saveError && (
          <div style={{ marginBottom: "16px", padding: "10px 14px", backgroundColor: "rgba(255,70,85,0.08)", border: "1px solid rgba(255,70,85,0.2)", borderRadius: "8px", fontSize: "12px", color: "#FF4655" }}>
            {saveError}
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button onClick={() => setStep("form")} className="dash-btn-ghost text-xs px-5 py-2 rounded-lg" disabled={saving}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: saving ? "rgba(255,70,85,0.5)" : "#FF4655", cursor: saving ? "not-allowed" : "pointer" }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "#E53E4D"; }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "#FF4655"; }}
          >
            {saving ? "Creating…" : "Confirm Create"}
          </button>
        </div>
      </ModalBackdrop>
    );
  }

  // ===========================================================================
  // STEP 1: Form
  // ===========================================================================
  return (
    <ModalBackdrop onClose={onClose} title="Add Admin" subtitle="Create a new Admin account" maxWidth="520px">
      {/* Role notice */}
      <div
        style={{
          backgroundColor: "rgba(255,70,85,0.06)",
          border: "1px solid rgba(255,70,85,0.15)",
          borderRadius: "8px",
          padding: "10px 14px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF4655">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <span style={{ fontSize: "11px", color: "var(--c-text-muted)" }}>
          Developers can only create <strong style={{ color: "#FF4655" }}>Admin</strong> accounts.
        </span>
      </div>

      {/* Save error banner */}
      {saveError && (
        <div style={{ marginBottom: "16px", padding: "10px 14px", backgroundColor: "rgba(255,70,85,0.08)", border: "1px solid rgba(255,70,85,0.2)", borderRadius: "8px", fontSize: "12px", color: "#FF4655" }}>
          {saveError}
          <button onClick={() => setSaveError("")} style={{ float: "right", background: "none", border: "none", color: "#FF4655", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Name row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: "12px", marginBottom: "16px" }}>
        <div>
          <label className="dash-label">
            First Name <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <input
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (submitted) {
                const err = validateFirstLastName(e.target.value, "First name");
                setFirstNameError(err || containsProfanity(e.target.value));
              }
            }}
            className="dash-input"
            placeholder="Juan"
            style={fieldError(firstName) || firstNameError ? { borderColor: "#EF4444" } : {}}
          />
          <FieldError message={firstNameError || (fieldError(firstName) ? "First name is required." : "")} />
        </div>
        <div>
          <label className="dash-label">M.I.</label>
          <input
            value={middleInitial}
            onChange={(e) => {
              const val = e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 2);
              setMiddleInitial(val);
              if (submitted) setMiddleInitialError(validateMiddleInitial(val));
            }}
            className="dash-input"
            placeholder="A"
            maxLength={2}
            style={middleInitialError ? { borderColor: "#EF4444" } : {}}
          />
          <FieldError message={middleInitialError} />
        </div>
        <div>
          <label className="dash-label">
            Last Name <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <input
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (submitted) {
                const err = validateFirstLastName(e.target.value, "Last name");
                setLastNameError(err || containsProfanity(e.target.value));
              }
            }}
            className="dash-input"
            placeholder="Dela Cruz"
            style={fieldError(lastName) || lastNameError ? { borderColor: "#EF4444" } : {}}
          />
          <FieldError message={lastNameError || (fieldError(lastName) ? "Last name is required." : "")} />
        </div>
      </div>

      {/* Email */}
      <div style={{ marginBottom: "16px" }}>
        <label className="dash-label">
          Email Address <span style={{ color: "#EF4444" }}>*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (submitted) setEmailError(validateEmail(e.target.value));
          }}
          className="dash-input"
          placeholder="admin@faithyouth.com"
          style={emailError ? { borderColor: "#EF4444" } : {}}
        />
        <FieldError message={emailError} />
      </div>

      {/* Status + Password row */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          {/* Account Status */}
          <div>
            <label className="dash-label">Account Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="dash-select">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div />
        </div>
      </div>

      {/* Temporary Password — full width */}
      <div style={{ marginBottom: "24px" }}>
        <label className="dash-label">
          Temporary Password <span style={{ color: "#EF4444" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            value={tempPassword}
            onChange={(e) => {
              setTempPassword(e.target.value);
              if (submitted) setPasswordErrors(validatePassword(e.target.value, { email, firstName, lastName }));
            }}
            className="dash-input"
            placeholder="••••••••"
            style={{
              ...(fieldError(tempPassword) || passwordErrors.length > 0 ? { borderColor: "#EF4444" } : {}),
              paddingRight: "40px",
            }}
          />
          <EyeToggle visible={showPassword} onClick={() => setShowPassword(!showPassword)} />
        </div>
        <StrengthMeter password={tempPassword} />
        {passwordErrors.length > 0 && (
          <div style={{ marginTop: "6px" }}>
            {passwordErrors.map((err, i) => (
              <FieldError key={i} message={err} />
            ))}
          </div>
        )}
        {submitted && !tempPassword && passwordErrors.length === 0 && (
          <FieldError message="Temporary password is required." />
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
        <button onClick={onClose} className="dash-btn-ghost text-xs px-5 py-2 rounded-lg">
          Cancel
        </button>
        <button
          onClick={handleSaveClick}
          disabled={saving}
          className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: saving ? "rgba(255,70,85,0.5)" : "#FF4655", cursor: saving ? "not-allowed" : "pointer" }}
          onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "#E53E4D"; }}
          onMouseLeave={(e) => { if (!saving) e.currentTarget.style.backgroundColor = "#FF4655"; }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </ModalBackdrop>
  );
}
