"use client";
import { useState } from "react";
import ModalBackdrop from "@/components/shared/modal-backdrop";

interface SuspendModalProps {
  userName: string;
  userRole: string;
  onClose: () => void;
  /** async — modal stays open on error, closes only on success */
  onConfirm: (reason: string) => Promise<void>;
}

export default function SuspendModal({ userName, userRole, onClose, onConfirm }: SuspendModalProps) {
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setSubmitted(true);
    if (!reason.trim()) return;
    setWorking(true);
    setError("");
    try {
      await onConfirm(reason);
      // parent closes modal on success via setSuspendTarget(null)
    } catch {
      setError("Failed to suspend account. Please try again.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose} title="Suspend Account" subtitle="This will restrict the user's access to the system" maxWidth="460px">
      {/* Warning banner */}
      <div style={{ backgroundColor: "rgba(255,70,85,0.06)", border: "1px solid rgba(255,70,85,0.2)", borderRadius: "8px", padding: "14px 16px", marginBottom: "20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4655" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <div style={{ fontSize: "12px", color: "var(--c-text-muted)", lineHeight: 1.6 }}>
          Suspending this account will immediately prevent the user from accessing the system.
        </div>
      </div>

      {/* User info */}
      <div style={{ backgroundColor: "var(--c-surface2)", border: "1px solid var(--c-border)", borderRadius: "8px", padding: "14px 16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>User</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--c-text)" }}>{userName}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "11px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Current Role</span>
          <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--c-text-muted)" }}>{userRole}</span>
        </div>
      </div>

      {/* Reason */}
      <div style={{ marginBottom: "24px" }}>
        <label className="dash-label">Reason for Suspension <span style={{ color: "#EF4444" }}>*</span></label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Enter the reason for suspension..."
          style={{ width: "100%", backgroundColor: "var(--c-surface3)", border: `1px solid ${submitted && !reason.trim() ? "#EF4444" : "var(--c-border)"}`, borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "var(--c-text)", outline: "none", resize: "vertical", fontFamily: "'Inter', sans-serif", transition: "border-color 0.2s" }}
          onFocus={(e) => { if (reason.trim() || !submitted) e.currentTarget.style.borderColor = "var(--c-accent)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = submitted && !reason.trim() ? "#EF4444" : "var(--c-border)"; }}
        />
        {submitted && !reason.trim() && (
          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#EF4444" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
            A reason is required to suspend an account.
          </p>
        )}
      </div>

      {/* Save error */}
      {error && <p className="text-xs mb-3" style={{ color: "#FF4655" }}>{error}</p>}

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button onClick={onClose} disabled={working} className="dash-btn-ghost text-xs px-5 py-2 rounded-lg">Cancel</button>
        <button
          onClick={handleConfirm}
          disabled={working}
          className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: working ? "rgba(255,70,85,0.5)" : "#FF4655", cursor: working ? "not-allowed" : "pointer" }}
          onMouseEnter={(e) => { if (!working) e.currentTarget.style.backgroundColor = "#E53E4D"; }}
          onMouseLeave={(e) => { if (!working) e.currentTarget.style.backgroundColor = "#FF4655"; }}
        >
          {working ? "Suspending…" : "Confirm Suspend"}
        </button>
      </div>
    </ModalBackdrop>
  );
}
