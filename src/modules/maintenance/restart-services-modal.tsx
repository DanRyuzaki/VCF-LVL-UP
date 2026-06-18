"use client";
import { useState } from "react";
import ModalBackdrop from "@/components/shared/modal-backdrop";

interface RestartServicesModalProps {
  onClose: () => void;
}

interface ServiceInfo {
  name: string;
  status: "running" | "restarting" | "stopped";
  lastRestart: string;
}

const initialServices: ServiceInfo[] = [
  { name: "Authentication Service", status: "running", lastRestart: "Jun 10, 2025 — 03:15 AM" },
  { name: "Database Service", status: "running", lastRestart: "Jun 10, 2025 — 03:15 AM" },
  { name: "Storage Service", status: "running", lastRestart: "Jun 08, 2025 — 11:45 PM" },
];

function statusColor(s: string) {
  if (s === "running") return "#00F5D4";
  if (s === "restarting") return "#EAB308";
  return "#FF4655";
}

export default function RestartServicesModal({ onClose }: RestartServicesModalProps) {
  const [services, setServices] = useState<ServiceInfo[]>(initialServices);
  const [successMsg, setSuccessMsg] = useState("");

  const now = () =>
    new Date()
      .toLocaleString("en-PH", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
      .replace(",", " —");

  const restartService = (name: string) => {
    setServices((prev) =>
      prev.map((s) => (s.name === name ? { ...s, status: "restarting" as const } : s))
    );
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) =>
          s.name === name ? { ...s, status: "running" as const, lastRestart: now() } : s
        )
      );
      setSuccessMsg(`${name} restarted successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 1500);
  };

  const restartAll = () => {
    setServices((prev) => prev.map((s) => ({ ...s, status: "restarting" as const })));
    setTimeout(() => {
      const ts = now();
      setServices((prev) =>
        prev.map((s) => ({ ...s, status: "running" as const, lastRestart: ts }))
      );
      setSuccessMsg("All services restarted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 2000);
  };

  return (
    <ModalBackdrop onClose={onClose} title="Restart Services" subtitle="Manage background services" maxWidth="520px">
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

      {/* Service list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
        {services.map((svc) => (
          <div
            key={svc.name}
            style={{
              backgroundColor: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Status dot */}
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: statusColor(svc.status),
                    boxShadow: `0 0 6px ${statusColor(svc.status)}50`,
                    animation: svc.status === "restarting" ? "pulse-dot 1s ease-in-out infinite" : "none",
                  }}
                />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--c-text)" }}>{svc.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: svc.status === "running" ? "rgba(0,245,212,0.12)" : svc.status === "restarting" ? "rgba(234,179,8,0.12)" : "rgba(255,70,85,0.12)",
                    color: statusColor(svc.status),
                  }}
                >
                  {svc.status}
                </span>
                <button
                  onClick={() => restartService(svc.name)}
                  disabled={svc.status === "restarting"}
                  className="dash-btn-ghost text-xs px-3 py-1 rounded"
                  style={{ cursor: svc.status === "restarting" ? "not-allowed" : "pointer", opacity: svc.status === "restarting" ? 0.4 : 1 }}
                >
                  Restart
                </button>
              </div>
            </div>
            <div style={{ fontSize: "10px", color: "var(--c-text-dim)", marginLeft: "18px" }}>
              Last restart: {svc.lastRestart}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button onClick={onClose} className="dash-btn-ghost text-xs px-5 py-2 rounded-lg">
          Close
        </button>
        <button
          onClick={restartAll}
          disabled={services.some((s) => s.status === "restarting")}
          className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: services.some((s) => s.status === "restarting") ? "var(--c-surface3)" : "#FF4655",
            color: services.some((s) => s.status === "restarting") ? "var(--c-text-dim)" : "#FFFFFF",
            cursor: services.some((s) => s.status === "restarting") ? "not-allowed" : "pointer",
          }}
        >
          Restart All Services
        </button>
      </div>
    </ModalBackdrop>
  );
}
