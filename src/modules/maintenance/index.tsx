"use client";
import { useState } from "react";
import ClearCacheModal      from "@/modules/maintenance/clear-cache-modal";
import BackupModal          from "@/modules/maintenance/backup-modal";
import HealthCheckModal     from "@/modules/maintenance/health-check-modal";
import ExportLogsModal      from "@/modules/maintenance/export-logs-modal";
import MaintenanceModeModal from "@/modules/maintenance/maintenance-mode-modal";
import RestartServicesModal from "@/modules/maintenance/restart-services-modal";

const tools = [
  {
    key: "clearCache",
    label: "Clear Cache",
    sub: "Flush system cache",
    accent: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="4" stroke="#ff4655" strokeWidth="1.8" />
        <line x1="12" y1="2"  x2="12" y2="5"  stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="12" y1="19" x2="12" y2="22" stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="2"  y1="12" x2="5"  y2="12" stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="19" y1="12" x2="22" y2="12" stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="4.93"  y1="4.93"  x2="7.05"  y2="7.05"  stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="4.93"  y1="19.07" x2="7.05"  y2="16.95" stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="16.95" y1="7.05"  x2="19.07" y2="4.93"  stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "backup",
    label: "Backup Data",
    sub: "Export Firestore snapshot",
    accent: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 6V12C4 16.42 7.48 20.58 12 22C16.52 20.58 20 16.42 20 12V6L12 2Z" stroke="#00d4ff" strokeWidth="1.7" strokeLinejoin="round" />
        <polyline points="8.5 12 11 14.5 15.5 10" stroke="#00d4ff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "healthCheck",
    label: "Health Check",
    sub: "Run system diagnostics",
    accent: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polyline points="2 12 6 12 8 6 10 18 13 9 15 14 17 12 22 12" stroke="#a855f7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "exportLogs",
    label: "Export Logs",
    sub: "Download system log file",
    accent: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#00d4ff" strokeWidth="1.7" />
        <line x1="7" y1="8"  x2="12" y2="8"  stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7" y1="12" x2="17" y2="12" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
        <polyline points="14 15 17 18 14 21" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="3" y1="18" x2="17" y2="18" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "maintenanceMode",
    label: "Maintenance Mode",
    sub: "Toggle maintenance screen",
    accent: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2V12" stroke="#ff4655" strokeWidth="2" strokeLinecap="round" />
        <path d="M6.34 5.64A8 8 0 1 0 17.66 5.64" stroke="#ff4655" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "restartServices",
    label: "Restart Services",
    sub: "Restart background services",
    accent: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4v6h6" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 20v-6h-6" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.93 15A9 9 0 0 0 19.07 9M4.93 15l-3 3M19.07 9l3-3" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function MaintenanceManagementModule() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tools.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveModal(t.key)}
            className="dash-card p-5 text-left transition-all"
            style={{ borderColor: t.accent ? "rgba(255,70,85,0.25)" : "var(--c-border)" }}
          >
            <div className="mb-3">{t.icon}</div>
            <div
              className="font-semibold text-sm mb-1"
              style={{ color: t.accent ? "var(--c-accent)" : "var(--c-text)" }}
            >
              {t.label}
            </div>
            <div className="text-xs" style={{ color: "var(--c-text-dim)" }}>{t.sub}</div>
          </button>
        ))}
      </div>

      {activeModal === "clearCache"      && <ClearCacheModal      onClose={() => setActiveModal(null)} />}
      {activeModal === "backup"          && <BackupModal          onClose={() => setActiveModal(null)} />}
      {activeModal === "healthCheck"     && <HealthCheckModal     onClose={() => setActiveModal(null)} />}
      {activeModal === "exportLogs"      && <ExportLogsModal      onClose={() => setActiveModal(null)} />}
      {activeModal === "maintenanceMode" && <MaintenanceModeModal onClose={() => setActiveModal(null)} />}
      {activeModal === "restartServices" && <RestartServicesModal onClose={() => setActiveModal(null)} />}
    </>
  );
}