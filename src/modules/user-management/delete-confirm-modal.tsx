"use client";
import { useState } from "react";
import ModalBackdrop from "@/components/shared/modal-backdrop";

interface UserToDelete {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created: string;
}

interface DeleteConfirmModalProps {
  usersToDelete: UserToDelete[];
  onClose: () => void;
  onConfirm: (reason: string, password: string) => void;
}

export default function DeleteConfirmModal({ usersToDelete, onClose, onConfirm }: DeleteConfirmModalProps) {
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isMultiple = usersToDelete.length > 1;
  const namesText = isMultiple
    ? `${usersToDelete.length} selected users (${usersToDelete.slice(0, 3).map(u => u.name).join(", ")}${usersToDelete.length > 3 ? "..." : ""})`
    : usersToDelete[0]?.name;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Reason for Deletion is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    onConfirm(reason, password);
  };

  return (
    <ModalBackdrop onClose={onClose} title="Confirm User Deletion" maxWidth="480px">
      {/* Warning icon */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "16px" }}>
        <svg width="48" height="48" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="28" cy="28" r="26" stroke="#FF4655" strokeWidth="1.5" opacity="0.3" />
          <circle cx="28" cy="28" r="22" fill="rgba(255,70,85,0.06)" stroke="#FF4655" strokeWidth="1.5" />
          <path
            d="M28 18V32"
            stroke="#FF4655"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="28" cy="37" r="1.5" fill="#FF4655" />
        </svg>
      </div>

      <p
        style={{
          textAlign: "center",
          fontSize: "14px",
          color: "var(--c-text-muted)",
          lineHeight: 1.6,
          marginBottom: "20px",
        }}
      >
        Are you sure you want to permanently delete{" "}
        <strong style={{ color: "var(--c-text)" }}>{namesText}</strong>?
        <br />
        <span style={{ fontSize: "12px", color: "var(--c-text-dim)" }}>
          This action cannot be undone. All associated data will be permanently removed.
        </span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Reason for Deletion */}
        <div>
          <label className="dash-label">
            Reason for Deletion: <span style={{ color: "#FF4655" }}>* (required)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            placeholder="Please enter the reason for removing this account..."
            rows={3}
            className="dash-input"
            style={{ resize: "none" }}
            required
          />
        </div>

        {/* Password Confirmation */}
        <div>
          <label className="dash-label">
            Before deleting, enter your password to confirm: <span style={{ color: "#FF4655" }}>*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Enter your admin password"
            className="dash-input"
            required
          />
        </div>

        {error && (
          <p className="text-xs font-semibold" style={{ color: "#FF4655" }}>
            ⚠️ {error}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", paddingTop: "12px" }}>
          <button type="button" onClick={onClose} className="dash-btn-ghost text-xs px-5 py-2.5 rounded-lg">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!reason.trim() || !password}
            className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2.5 rounded-lg transition-colors"
            style={{
              backgroundColor: (!reason.trim() || !password) ? "var(--c-border)" : "#FF4655",
              cursor: (!reason.trim() || !password) ? "not-allowed" : "pointer"
            }}
            onMouseEnter={(e) => {
              if (reason.trim() && password) e.currentTarget.style.backgroundColor = "#E53E4D";
            }}
            onMouseLeave={(e) => {
              if (reason.trim() && password) e.currentTarget.style.backgroundColor = "#FF4655";
            }}
          >
            Confirm Delete
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}
