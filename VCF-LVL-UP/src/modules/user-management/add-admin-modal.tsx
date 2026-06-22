"use client";
import { useState } from "react";
import ModalBackdrop from "@/components/shared/modal-backdrop";

interface AddAdminModalProps {
  onClose: () => void;
  onSave: (admin: Record<string, string>) => void;
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

export default function AddAdminModal({ onClose, onSave }: AddAdminModalProps) {
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
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

    onSave({ firstName, middleInitial, lastName, email, role: "Admin", status, tempPassword });
    onClose();
  };

  const fieldError = (val: string) => submitted && !val;

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
          placeholder="admin@faithyouth.com"
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        {/* Account Status */}
        <div>
          <label className="dash-label">Account Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="dash-select">
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Temporary Password */}
        <div>
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
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
        <button onClick={onClose} className="dash-btn-ghost text-xs px-5 py-2 rounded-lg">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: "#FF4655" }}
          onMouseEnter={(e) => ((e.currentTarget).style.backgroundColor = "#E53E4D")}
          onMouseLeave={(e) => ((e.currentTarget).style.backgroundColor = "#FF4655")}
        >
          Save
        </button>
      </div>
    </ModalBackdrop>
  );
}
