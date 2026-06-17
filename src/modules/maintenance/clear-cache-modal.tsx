"use client";
import { useState } from "react";
import ModalBackdrop from "@/components/shared/modal-backdrop";

interface ClearCacheModalProps {
  onClose: () => void;
}

export default function ClearCacheModal({ onClose }: ClearCacheModalProps) {
  const [cacheSize, setCacheSize] = useState("24.7 MB");
  const [lastCleanup, setLastCleanup] = useState("Jun 05, 2025 — 09:15 AM");
  const [cleared, setCleared] = useState(false);

  const handleClear = () => {
    setCleared(true);
    setCacheSize("0 B");
    setLastCleanup(new Date().toLocaleString("en-PH", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).replace(",", " —"));
  };

  return (
    <ModalBackdrop onClose={onClose} title="Clear Cache" subtitle="Flush temporary system files" maxWidth="460px">
      {/* Success notification */}
      {cleared && (
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
          <span style={{ fontSize: "12px", color: "#00F5D4", fontWeight: 500 }}>Cache cleared successfully!</span>
        </div>
      )}

      {/* Info cards */}
      <div
        style={{
          backgroundColor: "var(--c-surface2)",
          border: "1px solid var(--c-border)",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid var(--c-border)" }}>
          <span style={{ fontSize: "12px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Current Cache Size</span>
          <span className="font-head" style={{ fontSize: "18px", fontWeight: 700, color: cleared ? "#00F5D4" : "var(--c-accent)" }}>{cacheSize}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Last Cleanup</span>
          <span style={{ fontSize: "13px", color: "var(--c-text-muted)" }}>{lastCleanup}</span>
        </div>
      </div>

      {/* Warning */}
      {!cleared && (
        <div
          style={{
            backgroundColor: "rgba(234,179,8,0.06)",
            border: "1px solid rgba(234,179,8,0.2)",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "24px",
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
            This action will clear all temporary system files, cached assets, and session data. Active user sessions will not be affected.
          </span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button onClick={onClose} className="dash-btn-ghost text-xs px-5 py-2 rounded-lg">
          {cleared ? "Close" : "Cancel"}
        </button>
        {!cleared && (
          <button
            onClick={handleClear}
            className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: "#FF4655" }}
            onMouseEnter={(e) => ((e.currentTarget).style.backgroundColor = "#E53E4D")}
            onMouseLeave={(e) => ((e.currentTarget).style.backgroundColor = "#FF4655")}
          >
            Clear Cache
          </button>
        )}
      </div>
    </ModalBackdrop>
  );
}
