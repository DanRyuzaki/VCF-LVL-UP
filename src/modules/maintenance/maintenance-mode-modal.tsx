"use client";
import { useState } from "react";
import ModalBackdrop from "@/components/shared/modal-backdrop";

interface MaintenanceModeModalProps {
  onClose: () => void;
}

export default function MaintenanceModeModal({ onClose }: MaintenanceModeModalProps) {
  const [enabled, setEnabled] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleToggle = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setEnabled((prev) => !prev);
    setConfirming(false);
  };

  return (
    <ModalBackdrop onClose={onClose} title="Maintenance Mode" subtitle="Control system access restrictions" maxWidth="460px">
      {/* Current status card */}
      <div
        style={{
          backgroundColor: enabled ? "rgba(255,70,85,0.06)" : "rgba(0,245,212,0.06)",
          border: `1px solid ${enabled ? "rgba(255,70,85,0.2)" : "rgba(0,245,212,0.2)"}`,
          borderRadius: "10px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        {/* Toggle icon */}
        <div style={{ marginBottom: "12px" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={enabled ? "#FF4655" : "#00F5D4"} strokeWidth="1.8" strokeLinecap="round" style={{ display: "inline-block" }}>
            <path d="M12 2V12" />
            <path d="M6.34 5.64A8 8 0 1 0 17.66 5.64" />
          </svg>
        </div>
        <div className="font-head" style={{ fontSize: "16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: enabled ? "#FF4655" : "#00F5D4", marginBottom: "4px" }}>
          Maintenance Mode: {enabled ? "Enabled" : "Disabled"}
        </div>
        <div style={{ fontSize: "11px", color: "var(--c-text-dim)" }}>
          {enabled ? "Only Developer accounts can access the system" : "All users have normal system access"}
        </div>
      </div>

      {/* Warning */}
      <div
        style={{
          backgroundColor: "rgba(234,179,8,0.06)",
          border: "1px solid rgba(234,179,8,0.2)",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span style={{ fontSize: "11px", color: "var(--c-text-muted)", lineHeight: 1.6 }}>
          {enabled
            ? "While maintenance mode is enabled, all non-Developer users will see a Maintenance Notice page and cannot access any system features."
            : "Enabling maintenance mode will restrict system access to Developer accounts only. All other users will see a Maintenance Notice page."}
        </span>
      </div>

      {/* Confirmation prompt */}
      {confirming && (
        <div
          style={{
            backgroundColor: "var(--c-surface2)",
            border: "1px solid var(--c-border)",
            borderRadius: "8px",
            padding: "14px 16px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "13px", color: "var(--c-text)", marginBottom: "4px" }}>
            Are you sure you want to <strong>{enabled ? "disable" : "enable"}</strong> maintenance mode?
          </p>
          <p style={{ fontSize: "11px", color: "var(--c-text-dim)" }}>
            Click the button again to confirm.
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button
          onClick={() => { setConfirming(false); onClose(); }}
          className="dash-btn-ghost text-xs px-5 py-2 rounded-lg"
        >
          Close
        </button>
        <button
          onClick={handleToggle}
          className="text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: enabled ? "#00F5D4" : "#FF4655",
            color: enabled ? "#0A0A0A" : "#FFFFFF",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget).style.backgroundColor = enabled ? "#00D4B8" : "#E53E4D";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget).style.backgroundColor = enabled ? "#00F5D4" : "#FF4655";
          }}
        >
          {confirming
            ? `Confirm ${enabled ? "Disable" : "Enable"}`
            : enabled
            ? "Disable Maintenance Mode"
            : "Enable Maintenance Mode"}
        </button>
      </div>
    </ModalBackdrop>
  );
}
