"use client";
import { useState } from "react";
import ModalBackdrop from "@/components/shared/modal-backdrop";

interface AddUserModalProps {
  onClose: () => void;
  onSave: (user: Record<string, string>) => void;
}

function validateEmail(email: string): string {
  if (!email) return "Email address is required.";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(email)) return "Please enter a valid email address.";
  return "";
}

export default function AddUserModal({ onClose, onSave }: AddUserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Organizer");
  const [gamerType, setGamerType] = useState("Free Agent");
  const [status, setStatus] = useState("Active");
  const [tempPassword, setTempPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSave = () => {
    setSubmitted(true);
    const eErr = validateEmail(email);
    setEmailError(eErr);
    if (!firstName || !lastName || eErr || !tempPassword) return;

    onSave({
      firstName,
      middleInitial,
      lastName,
      email,
      role: role === "Gamer" ? `Gamer (${gamerType})` : role,
      status,
      tempPassword,
    });
    onClose();
  };

  const fieldError = (val: string) => submitted && !val;

  return (
    <ModalBackdrop onClose={onClose} title="Add User" subtitle="Create a new user account" maxWidth="520px">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: "12px", marginBottom: "16px" }}>
        <div>
          <label className="dash-label">
            First Name <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="dash-input"
            placeholder="Juan"
            style={fieldError(firstName) ? { borderColor: "#EF4444" } : {}}
          />
        </div>
        <div>
          <label className="dash-label">M.I.</label>
          <input
            value={middleInitial}
            onChange={(e) => setMiddleInitial(e.target.value.slice(0, 2))}
            className="dash-input"
            placeholder="A"
            maxLength={2}
          />
        </div>
        <div>
          <label className="dash-label">
            Last Name <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="dash-input"
            placeholder="Dela Cruz"
            style={fieldError(lastName) ? { borderColor: "#EF4444" } : {}}
          />
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

      {/* Role */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div>
          <label className="dash-label">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="dash-select">
            <option>Organizer</option>
            <option>Gamer</option>
          </select>
        </div>

        {role === "Gamer" && (
          <div>
            <label className="dash-label">Gamer Type</label>
            <select value={gamerType} onChange={(e) => setGamerType(e.target.value)} className="dash-select">
              <option>Free Agent</option>
              <option>Drafted Gamer</option>
            </select>
          </div>
        )}

        {role !== "Gamer" && (
          <div>
            <label className="dash-label">Account Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="dash-select">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        )}
      </div>

      {role === "Gamer" && (
        <div style={{ marginBottom: "16px" }}>
          <label className="dash-label">Account Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="dash-select">
            <option>Active</option>
            <option>Inactive</option>
          </select>
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
