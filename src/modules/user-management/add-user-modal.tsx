"use client";
// src/modules/user-management/add-user-modal.tsx
import { useState } from "react";
import ModalBackdrop from "@/components/shared/modal-backdrop";

interface AddUserModalProps {
  onClose: () => void;
  onSave: (user: Record<string, string>) => void;
  saving?: boolean;
}

function validateEmail(email: string): string {
  if (!email) return "Email address is required.";
  if (/^[^a-zA-Z]/.test(email)) return "Email must start with a letter.";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(email)) return "Please enter a valid email address.";
  return "";
}

function validateName(value: string, fieldName: string): string {
  if (!value) return "";
  if (/^[^a-zA-Z]/.test(value)) return `${fieldName} must start with a letter.`;
  return "";
}

export default function AddUserModal({ onClose, onSave, saving }: AddUserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Organizer");
  // gamerType is always "free_agent" when role === Gamer — not shown in UI
  const [status, setStatus] = useState("Active");
  const [tempPassword, setTempPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [middleInitialError, setMiddleInitialError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSave = () => {
    setSubmitted(true);
    const eErr = validateEmail(email);
    const fnErr = validateName(firstName, "First name");
    const miErr = validateName(middleInitial, "Middle initial");
    const lnErr = validateName(lastName, "Last name");
    setEmailError(eErr);
    setFirstNameError(fnErr);
    setMiddleInitialError(miErr);
    setLastNameError(lnErr);
    if (!firstName || !lastName || eErr || fnErr || miErr || lnErr || !tempPassword) return;

    onSave({
      firstName,
      middleInitial,
      lastName,
      email,
      role,
      // Admins can only create free agents — gamerType is always hardcoded here
      gamerType: role === "Gamer" ? "free_agent" : "",
      status,
      tempPassword,
    });
    onClose();
  };

  const fieldError = (val: string) => submitted && !val;

  return (
    <ModalBackdrop onClose={onClose} title="Add User" subtitle="Create a new user account" maxWidth="520px">
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
              if (submitted) setFirstNameError(validateName(e.target.value, "First name"));
            }}
            className="dash-input"
            placeholder="Juan"
            style={fieldError(firstName) || firstNameError ? { borderColor: "#EF4444" } : {}}
          />
          {firstNameError && (
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {firstNameError}
            </p>
          )}
        </div>
        <div>
          <label className="dash-label">M.I.</label>
          <input
            value={middleInitial}
            onChange={(e) => {
              const val = e.target.value.slice(0, 2);
              setMiddleInitial(val);
              if (submitted) setMiddleInitialError(validateName(val, "Middle initial"));
            }}
            className="dash-input"
            placeholder="A"
            maxLength={2}
            style={middleInitialError ? { borderColor: "#EF4444" } : {}}
          />
          {middleInitialError && (
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {middleInitialError}
            </p>
          )}
        </div>
        <div>
          <label className="dash-label">
            Last Name <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <input
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (submitted) setLastNameError(validateName(e.target.value, "Last name"));
            }}
            className="dash-input"
            placeholder="Dela Cruz"
            style={fieldError(lastName) || lastNameError ? { borderColor: "#EF4444" } : {}}
          />
          {lastNameError && (
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {lastNameError}
            </p>
          )}
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
          placeholder="user@faithyouth.com"
          style={emailError ? { borderColor: "#EF4444" } : {}}
        />
        {emailError && (
          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {emailError}
          </p>
        )}
      </div>

      {/* Role + Status row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div>
          <label className="dash-label">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="dash-select">
            <option>Organizer</option>
            <option>Gamer</option>
          </select>
        </div>
        <div>
          <label className="dash-label">Account Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="dash-select">
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Gamer notice — shown when Gamer is selected, instead of the old dropdown */}
      {role === "Gamer" && (
        <div
          style={{
            backgroundColor: "rgba(0,245,212,0.05)",
            border: "1px solid rgba(0,245,212,0.15)",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#00F5D4">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span style={{ fontSize: "11px", color: "var(--c-text-muted)" }}>
            Gamer accounts created by Admin always start as{" "}
            <strong style={{ color: "#00F5D4" }}>Free Agent</strong>. An organizer can
            draft them to a team later.
          </span>
        </div>
      )}

      {/* Temporary Password */}
      <div style={{ marginBottom: "24px" }}>
        <label className="dash-label">
          Temporary Password <span style={{ color: "#EF4444" }}>*</span>
        </label>
        <input
          type="password"
          value={tempPassword}
          onChange={(e) => setTempPassword(e.target.value)}
          className="dash-input"
          placeholder="••••••••"
          style={fieldError(tempPassword) ? { borderColor: "#EF4444" } : {}}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button onClick={onClose} className="dash-btn-ghost text-xs px-5 py-2 rounded-lg" disabled={saving}>
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: saving ? "rgba(255,70,85,0.5)" : "#FF4655", cursor: saving ? "not-allowed" : "pointer" }}
          onMouseEnter={(e) => { if (!saving) (e.currentTarget).style.backgroundColor = "#E53E4D"; }}
          onMouseLeave={(e) => { if (!saving) (e.currentTarget).style.backgroundColor = "#FF4655"; }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </ModalBackdrop>
  );
}
