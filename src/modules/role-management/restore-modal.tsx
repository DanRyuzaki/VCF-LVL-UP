"use client";
import ModalBackdrop from "@/components/shared/modal-backdrop";

interface RestoreModalProps {
  userName: string;
  userRole: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RestoreModal({ userName, userRole, onClose, onConfirm }: RestoreModalProps) {
  return (
    <ModalBackdrop onClose={onClose} title="Restore Account" subtitle="Re-enable access for this user" maxWidth="440px">
      {/* Success hint banner */}
      <div
        style={{
          backgroundColor: "rgba(0,245,212,0.06)",
          border: "1px solid rgba(0,245,212,0.2)",
          borderRadius: "8px",
          padding: "14px 16px",
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00F5D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <div style={{ fontSize: "12px", color: "var(--c-text-muted)", lineHeight: 1.6 }}>
          Restoring this account will set the status to <strong style={{ color: "#00F5D4" }}>Active</strong> and re-enable the user&apos;s access to the system.
        </div>
      </div>

      {/* User info */}
      <div
        style={{
          backgroundColor: "var(--c-surface2)",
          border: "1px solid var(--c-border)",
          borderRadius: "8px",
          padding: "14px 16px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>User</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--c-text)" }}>{userName}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Current Role</span>
          <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--c-text-muted)" }}>{userRole}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "11px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>New Status</span>
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
            style={{ backgroundColor: "rgba(0,245,212,0.15)", color: "#00F5D4" }}
          >
            Active
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button onClick={onClose} className="dash-btn-ghost text-xs px-5 py-2 rounded-lg">
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className="text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: "#00F5D4", color: "#0A0A0A" }}
          onMouseEnter={(e) => ((e.currentTarget).style.backgroundColor = "#00D4B8")}
          onMouseLeave={(e) => ((e.currentTarget).style.backgroundColor = "#00F5D4")}
        >
          Restore
        </button>
      </div>
    </ModalBackdrop>
  );
}
