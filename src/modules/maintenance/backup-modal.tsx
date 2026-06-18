"use client";
import { useState } from "react";
import ModalBackdrop from "@/components/shared/modal-backdrop";

interface BackupModalProps {
  onClose: () => void;
}

const initialBackups = [
  { id: "bk_003", date: "Jun 10, 2025 — 02:00 AM", size: "148 MB", status: "completed", type: "Automatic" },
  { id: "bk_002", date: "Jun 03, 2025 — 02:00 AM", size: "142 MB", status: "completed", type: "Automatic" },
  { id: "bk_001", date: "May 28, 2025 — 11:30 AM", size: "138 MB", status: "completed", type: "Manual" },
];

export default function BackupModal({ onClose }: BackupModalProps) {
  const [backups, setBackups] = useState(initialBackups);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleCreate = () => {
    setCreating(true);
    setTimeout(() => {
      const newBackup = {
        id: `bk_${String(backups.length + 1).padStart(3, "0")}`,
        date: new Date().toLocaleString("en-PH", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).replace(",", " —"),
        size: "152 MB",
        status: "completed",
        type: "Manual",
      };
      setBackups((prev) => [newBackup, ...prev]);
      setCreating(false);
      setSuccessMsg("Backup created successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 1500);
  };

  return (
    <ModalBackdrop onClose={onClose} title="Backup Data" subtitle="Manage Firestore data backups" maxWidth="600px">
      {/* Success notification */}
      {successMsg && (
        <div
          style={{
            backgroundColor: "rgba(0,245,212,0.08)",
            border: "1px solid rgba(0,245,212,0.25)",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00F5D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ fontSize: "12px", color: "#00F5D4", fontWeight: 500 }}>{successMsg}</span>
        </div>
      )}

      {/* Last backup info */}
      <div
        style={{
          backgroundColor: "var(--c-surface2)",
          border: "1px solid var(--c-border)",
          borderRadius: "8px",
          padding: "14px 16px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "11px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Last Backup</div>
          <div style={{ fontSize: "13px", color: "var(--c-text)" }}>{backups[0]?.date || "No backups"}</div>
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
          style={{ backgroundColor: "rgba(0,245,212,0.15)", color: "#00F5D4" }}
        >
          {backups[0]?.status || "—"}
        </span>
      </div>

      {/* Actions bar */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: creating ? "var(--c-surface3)" : "#FF4655", color: creating ? "var(--c-text-dim)" : "#FFFFFF", cursor: creating ? "not-allowed" : "pointer" }}
        >
          {creating ? (
            <>
              <span className="animate-pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--c-text-dim)", display: "inline-block" }} />
              Creating...
            </>
          ) : (
            "Create New Backup"
          )}
        </button>
        <button
          onClick={() => { setSuccessMsg("Backup download started!"); setTimeout(() => setSuccessMsg(""), 3000); }}
          className="dash-btn-ghost text-xs px-4 py-2 rounded-lg"
        >
          Download Backup
        </button>
      </div>

      {/* Backup history table */}
      <div className="dash-section-title" style={{ marginBottom: "8px" }}>Backup History</div>
      <div
        style={{
          backgroundColor: "var(--c-surface2)",
          border: "1px solid var(--c-border)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "var(--c-surface3)" }}>
            <tr>
              {["Date", "Size", "Type", "Status"].map((h) => (
                <th key={h} className="dash-th" style={{ padding: "10px 12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {backups.map((b) => (
              <tr key={b.id} style={{ borderTop: "1px solid var(--c-border)" }}>
                <td style={{ padding: "10px 12px", fontSize: "12px", color: "var(--c-text)" }}>{b.date}</td>
                <td style={{ padding: "10px 12px", fontSize: "12px", color: "var(--c-text-muted)" }}>{b.size}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: b.type === "Manual" ? "rgba(139,92,246,0.15)" : "var(--c-surface3)",
                      color: b.type === "Manual" ? "#8B5CF6" : "var(--c-text-dim)",
                    }}
                  >
                    {b.type}
                  </span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                    style={{ backgroundColor: "rgba(0,245,212,0.15)", color: "#00F5D4" }}
                  >
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Close */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
        <button onClick={onClose} className="dash-btn-ghost text-xs px-5 py-2 rounded-lg">Close</button>
      </div>
    </ModalBackdrop>
  );
}
