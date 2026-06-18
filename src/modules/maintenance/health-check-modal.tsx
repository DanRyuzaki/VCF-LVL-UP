"use client";
import ModalBackdrop from "@/components/shared/modal-backdrop";

interface HealthCheckModalProps {
  onClose: () => void;
}

type HealthStatus = "healthy" | "warning" | "error";

const services: { name: string; status: HealthStatus; latency: string; detail: string }[] = [
  { name: "Front-End", status: "healthy", latency: "42ms", detail: "All pages rendering correctly" },
  { name: "Authentication Service", status: "healthy", latency: "128ms", detail: "Firebase Auth responding normally" },
  { name: "Database Connection", status: "healthy", latency: "85ms", detail: "Firestore read/write operational" },
  { name: "Storage Status", status: "warning", latency: "340ms", detail: "Storage usage at 78% capacity" },
  { name: "API Status", status: "healthy", latency: "96ms", detail: "All endpoints responding" },
];

function statusColor(s: HealthStatus) {
  if (s === "healthy") return "#00F5D4";
  if (s === "warning") return "#EAB308";
  return "#FF4655";
}

function statusBg(s: HealthStatus) {
  if (s === "healthy") return "rgba(0,245,212,0.12)";
  if (s === "warning") return "rgba(234,179,8,0.12)";
  return "rgba(255,70,85,0.12)";
}

function overallHealth(items: typeof services): HealthStatus {
  if (items.some((s) => s.status === "error")) return "error";
  if (items.some((s) => s.status === "warning")) return "warning";
  return "healthy";
}

export default function HealthCheckModal({ onClose }: HealthCheckModalProps) {
  const overall = overallHealth(services);

  return (
    <ModalBackdrop onClose={onClose} title="Health Check" subtitle="System diagnostics overview" maxWidth="560px">
      {/* Overall status card */}
      <div
        style={{
          backgroundColor: statusBg(overall),
          border: `1px solid ${statusColor(overall)}30`,
          borderRadius: "10px",
          padding: "20px",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <div style={{ marginBottom: "8px" }}>
          {overall === "healthy" ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00F5D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : overall === "warning" ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF4655" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </div>
        <div className="font-head" style={{ fontSize: "16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: statusColor(overall) }}>
          Overall System Health: {overall}
        </div>
      </div>

      {/* Service cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
        {services.map((svc) => (
          <div
            key={svc.name}
            style={{
              backgroundColor: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Status dot */}
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: statusColor(svc.status),
                  boxShadow: `0 0 8px ${statusColor(svc.status)}50`,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--c-text)" }}>{svc.name}</div>
                <div style={{ fontSize: "11px", color: "var(--c-text-dim)", marginTop: "2px" }}>{svc.detail}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
              <span style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--c-text-dim)" }}>{svc.latency}</span>
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ backgroundColor: statusBg(svc.status), color: statusColor(svc.status) }}
              >
                {svc.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Close */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onClose} className="dash-btn-ghost text-xs px-5 py-2 rounded-lg">Close</button>
      </div>
    </ModalBackdrop>
  );
}
