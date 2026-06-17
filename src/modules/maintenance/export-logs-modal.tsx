"use client";
import { useState } from "react";
import ModalBackdrop from "@/components/shared/modal-backdrop";

interface ExportLogsModalProps {
  onClose: () => void;
}

export default function ExportLogsModal({ onClose }: ExportLogsModalProps) {
  const [logType, setLogType] = useState("system");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState("csv");
  const [exported, setExported] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleExport = () => {
    const typeLabel = logType === "system" ? "system_logs" : logType === "error" ? "error_logs" : "activity_logs";
    const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const name = `${typeLabel}_${dateStr}.${format}`;
    setFileName(name);
    setExported(true);
  };

  return (
    <ModalBackdrop onClose={onClose} title="Export Logs" subtitle="Download system log files" maxWidth="480px">
      {/* Success notification */}
      {exported && (
        <div
          style={{
            backgroundColor: "rgba(0,245,212,0.08)",
            border: "1px solid rgba(0,245,212,0.25)",
            borderRadius: "8px",
            padding: "14px 16px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00F5D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ fontSize: "12px", color: "#00F5D4", fontWeight: 600 }}>Export Ready!</span>
          </div>
          <div style={{ fontSize: "11px", color: "var(--c-text-muted)", marginLeft: "26px" }}>
            File: <span style={{ fontFamily: "monospace", color: "var(--c-text)" }}>{fileName}</span>
          </div>
        </div>
      )}

      {/* Log Type */}
      <div style={{ marginBottom: "16px" }}>
        <label className="dash-label">Log Type</label>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { key: "system", label: "System Logs" },
            { key: "error", label: "Error Logs" },
            { key: "activity", label: "Activity Logs" },
          ].map((lt) => (
            <button
              key={lt.key}
              onClick={() => { setLogType(lt.key); setExported(false); }}
              className={`dash-filter-btn ${logType === lt.key ? "active" : ""}`}
              style={{ flex: 1, textAlign: "center", padding: "8px 4px" }}
            >
              {lt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div>
          <label className="dash-label">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setExported(false); }}
            className="dash-input"
          />
        </div>
        <div>
          <label className="dash-label">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setExported(false); }}
            className="dash-input"
          />
        </div>
      </div>

      {/* Export Format */}
      <div style={{ marginBottom: "24px" }}>
        <label className="dash-label">Export Format</label>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { key: "csv", label: "CSV" },
            { key: "xlsx", label: "Excel" },
            { key: "pdf", label: "PDF" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => { setFormat(f.key); setExported(false); }}
              className={`dash-filter-btn ${format === f.key ? "active" : ""}`}
              style={{ flex: 1, textAlign: "center", padding: "8px 4px" }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button onClick={onClose} className="dash-btn-ghost text-xs px-5 py-2 rounded-lg">
          Close
        </button>
        <button
          onClick={handleExport}
          className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: "#FF4655" }}
          onMouseEnter={(e) => ((e.currentTarget).style.backgroundColor = "#E53E4D")}
          onMouseLeave={(e) => ((e.currentTarget).style.backgroundColor = "#FF4655")}
        >
          Export
        </button>
      </div>
    </ModalBackdrop>
  );
}
