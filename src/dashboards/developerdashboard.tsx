"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/sidebar";
import StatCard from "@/components/shared/stat-card";
import PageHeader from "@/components/shared/page-header";
import DashboardHeader from "@/components/shared/dashboard-header";
import UserManagementModule from "@/modules/user-management";
import SuspendModal from "@/modules/role-management/suspend-modal";
import RestoreModal from "@/modules/role-management/restore-modal";
import ClearCacheModal from "@/modules/maintenance/clear-cache-modal";
import BackupModal from "@/modules/maintenance/backup-modal";
import HealthCheckModal from "@/modules/maintenance/health-check-modal";
import ExportLogsModal from "@/modules/maintenance/export-logs-modal";
import MaintenanceModeModal from "@/modules/maintenance/maintenance-mode-modal";
import RestartServicesModal from "@/modules/maintenance/restart-services-modal";

const systemLogs = [
  { time: "2025-06-12 14:02:11", type: "INFO", msg: "User login: marco@faith.com [Organizer]" },
  { time: "2025-06-12 14:01:55", type: "INFO", msg: "Bracket generated: MLBB S4 — 8 teams" },
  { time: "2025-06-12 13:58:30", type: "WARN", msg: "Announcement submission queued — awaiting approval" },
  { time: "2025-06-12 13:45:22", type: "ERROR", msg: "Firebase Auth timeout — retry successful" },
  { time: "2025-06-12 13:40:01", type: "INFO", msg: "Match result submitted: Team Blaze 2-0 Team Storm" },
  { time: "2025-06-12 13:22:44", type: "INFO", msg: "Player drafted: Ana Lim → Team Frost" },
  { time: "2025-06-12 13:15:09", type: "WARN", msg: "Slow page load detected: /organizer/brackets (2.4s)" },
  { time: "2025-06-12 12:59:55", type: "INFO", msg: "User logout: admin@faith.com" },
];

function logTypeColor(type: string) {
  if (type === "ERROR") return "#FF4655";
  if (type === "WARN") return "#EAB308";
  return "#00F5D4";
}

function SystemLogsSection() {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter === "ALL" ? systemLogs : systemLogs.filter((l) => l.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["ALL", "INFO", "WARN", "ERROR"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`dash-filter-btn ${filter === f ? "active" : ""}`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="dash-table-wrap">
        <div className="p-4 font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
          {filtered.map((log, i) => (
            <div
              key={i}
              className="flex gap-4 py-1"
              style={{ borderBottom: "1px solid var(--c-border)" }}
            >
              <span className="shrink-0" style={{ color: "var(--c-text-dim)" }}>{log.time}</span>
              <span className="w-12 shrink-0 font-bold" style={{ color: logTypeColor(log.type) }}>{log.type}</span>
              <span style={{ color: "var(--c-text-muted)" }}>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorReportsSection() {
  const errors = [
    { time: "13:45:22", error: "Firebase Auth timeout", page: "/login", severity: "High" },
    { time: "13:15:09", error: "Slow render: Bracket tree", page: "/organizer/brackets", severity: "Medium" },
    { time: "10:22:01", error: "Missing livestream embed", page: "/gamer/livestream", severity: "Low" },
  ];
  const sevStyle = (s: string) => {
    if (s === "High") return "bg-[#FF4655]/20 text-[#FF4655]";
    if (s === "Medium") return "bg-yellow-400/20 text-yellow-400";
    return "text-[#808080]";
  };
  const sevBg = (s: string) => s === "Low" ? "var(--c-surface3)" : undefined;

  return (
    <div className="dash-table-wrap">
      <table className="w-full border-collapse">
        <thead className="dash-thead">
          <tr>{["Time", "Error", "Page", "Severity"].map((h) => <th key={h} className="dash-th">{h}</th>)}</tr>
        </thead>
        <tbody>
          {errors.map((e, i) => (
            <tr key={i} className="dash-tr">
              <td className="dash-td-dim font-mono">{e.time}</td>
              <td className="dash-td">{e.error}</td>
              <td className="dash-td-muted font-mono">{e.page}</td>
              <td className="dash-td">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${sevStyle(e.severity)}`} style={sevBg(e.severity) ? { backgroundColor: sevBg(e.severity) } : {}}>{e.severity}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RoleManagementSection() {
  const [users, setUsers] = useState([
    { name: "John Dela Cruz", role: "Gamer", status: "active" },
    { name: "Ben Torres", role: "Gamer", status: "suspended" },
    { name: "Liza Cruz", role: "Gamer", status: "active" },
  ]);
  const [suspendTarget, setSuspendTarget] = useState<{ name: string; role: string } | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<{ name: string; role: string } | null>(null);

  const handleSuspend = (reason: string) => {
    if (!suspendTarget) return;
    setUsers((prev) =>
      prev.map((u) => (u.name === suspendTarget.name ? { ...u, status: "suspended" } : u))
    );
    setSuspendTarget(null);
  };

  const handleRestore = () => {
    if (!restoreTarget) return;
    setUsers((prev) =>
      prev.map((u) => (u.name === restoreTarget.name ? { ...u, status: "active" } : u))
    );
    setRestoreTarget(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="dash-card p-5">
          <div className="dash-section-title">Assign / Change Role</div>
          <div className="space-y-3">
            <div>
              <label className="dash-label">Select User</label>
              <select className="dash-select"><option>Marco Reyes</option><option>Anna Cruz</option><option>John Dela Cruz</option></select>
            </div>
            <div>
              <label className="dash-label">New Role</label>
              <select className="dash-select"><option>Admin</option><option>Organizer</option><option>Gamer</option></select>
            </div>
            <button className="w-full bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors">Update Role</button>
          </div>
        </div>

        <div className="dash-card p-5">
          <div className="dash-section-title">Account Actions</div>
          {users.map((u) => (
            <div key={u.name} className="dash-row-item">
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--c-text)" }}>{u.name}</div>
                <div className="text-xs" style={{ color: "var(--c-text-dim)" }}>{u.role} · {u.status}</div>
              </div>
              {u.status === "active"
                ? <button
                    onClick={() => setSuspendTarget({ name: u.name, role: u.role })}
                    className="dash-btn-ghost text-xs px-3 py-1 rounded"
                    style={{ color: "var(--c-text-dim)" }}
                    onMouseEnter={(e) => { (e.currentTarget).style.color = "#FF4655"; (e.currentTarget).style.borderColor = "#FF4655"; }}
                    onMouseLeave={(e) => { (e.currentTarget).style.color = "var(--c-text-dim)"; (e.currentTarget).style.borderColor = "var(--c-border)"; }}
                  >Suspend</button>
                : <button
                    onClick={() => setRestoreTarget({ name: u.name, role: u.role })}
                    className="bg-[#00F5D4]/20 text-[#00F5D4] hover:bg-[#00F5D4]/30 text-xs font-semibold px-3 py-1 rounded transition-colors"
                  >Restore</button>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Suspend Modal */}
      {suspendTarget && (
        <SuspendModal
          userName={suspendTarget.name}
          userRole={suspendTarget.role}
          onClose={() => setSuspendTarget(null)}
          onConfirm={handleSuspend}
        />
      )}

      {/* Restore Modal */}
      {restoreTarget && (
        <RestoreModal
          userName={restoreTarget.name}
          userRole={restoreTarget.role}
          onClose={() => setRestoreTarget(null)}
          onConfirm={handleRestore}
        />
      )}
    </>
  );
}

function MaintenanceSection() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const tools = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="4" stroke="#ff4655" strokeWidth="1.8" />
          <line x1="12" y1="2" x2="12" y2="5" stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="12" y1="19" x2="12" y2="22" stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="2" y1="12" x2="5" y2="12" stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="19" y1="12" x2="22" y2="12" stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" stroke="#ff4655" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
      label: "Clear Cache", sub: "Flush system cache", key: "clearCache",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 6V12C4 16.42 7.48 20.58 12 22C16.52 20.58 20 16.42 20 12V6L12 2Z" stroke="#00d4ff" strokeWidth="1.7" strokeLinejoin="round" />
          <polyline points="8.5 12 11 14.5 15.5 10" stroke="#00d4ff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: "Backup Data", sub: "Export Firestore snapshot", key: "backup",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="2 12 6 12 8 6 10 18 13 9 15 14 17 12 22 12" stroke="#a855f7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: "Health Check", sub: "Run system diagnostics", key: "healthCheck",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="#00d4ff" strokeWidth="1.7" />
          <line x1="7" y1="8" x2="12" y2="8" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="7" y1="12" x2="17" y2="12" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
          <polyline points="14 15 17 18 14 21" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="3" y1="18" x2="17" y2="18" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      label: "Export Logs", sub: "Download system log file", key: "exportLogs",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2V12" stroke="#ff4655" strokeWidth="2" strokeLinecap="round" />
          <path d="M6.34 5.64A8 8 0 1 0 17.66 5.64" stroke="#ff4655" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
      label: "Maintenance Mode", sub: "Toggle maintenance screen", key: "maintenanceMode",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4v6h6" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 20v-6h-6" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.93 15A9 9 0 0 0 19.07 9M4.93 15l-3 3M19.07 9l3-3" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      label: "Restart Services", sub: "Restart background services", key: "restartServices",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tools.map((t) => (
          <button
            key={t.label}
            onClick={() => setActiveModal(t.key)}
            className="dash-card p-5 text-left transition-all"
            style={{ borderColor: t.label === "Maintenance Mode" ? "rgba(255,70,85,0.25)" : "var(--c-border)" }}
          >
            <div className="mb-3">{t.icon}</div>
            <div className="font-semibold text-sm mb-1" style={{ color: t.label === "Maintenance Mode" ? "var(--c-accent)" : "var(--c-text)" }}>{t.label}</div>
            <div className="text-xs" style={{ color: "var(--c-text-dim)" }}>{t.sub}</div>
          </button>
        ))}
      </div>

      {/* Maintenance Modals */}
      {activeModal === "clearCache" && <ClearCacheModal onClose={() => setActiveModal(null)} />}
      {activeModal === "backup" && <BackupModal onClose={() => setActiveModal(null)} />}
      {activeModal === "healthCheck" && <HealthCheckModal onClose={() => setActiveModal(null)} />}
      {activeModal === "exportLogs" && <ExportLogsModal onClose={() => setActiveModal(null)} />}
      {activeModal === "maintenanceMode" && <MaintenanceModeModal onClose={() => setActiveModal(null)} />}
      {activeModal === "restartServices" && <RestartServicesModal onClose={() => setActiveModal(null)} />}
    </>
  );
}

function CrmSection() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">+ Add Record</button>
      </div>
      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>{["Name", "Type", "Contact", "Notes", "Actions"].map((h) => <th key={h} className="dash-th">{h}</th>)}</tr>
          </thead>
          <tbody>
            {[
              { name: "Word Baptist Church HQ", type: "Ministry", contact: "admin@wbc.org", note: "Main organization", tc: "bg-[#8B5CF6]/20 text-[#8B5CF6]" },
              { name: "Youth Ministry Group A", type: "Group", contact: "youth@wbc.org", note: "MLBB division", tc: "bg-[#00F5D4]/15 text-[#00F5D4]" },
              { name: "Youth Ministry Group B", type: "Group", contact: "youth2@wbc.org", note: "CODM division", tc: "bg-[#00F5D4]/15 text-[#00F5D4]" },
            ].map((r) => (
              <tr key={r.name} className="dash-tr">
                <td className="dash-td font-medium">{r.name}</td>
                <td className="dash-td"><span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${r.tc}`}>{r.type}</span></td>
                <td className="dash-td-muted">{r.contact}</td>
                <td className="dash-td-dim">{r.note}</td>
                <td className="dash-td"><button className="dash-btn-ghost text-xs px-3 py-1 rounded">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  logs: { title: "SYSTEM LOGS", subtitle: "Client-side activity and event logs" },
  errors: { title: "ERROR REPORTS", subtitle: "Client-side error tracking" },
  metadata: { title: "USER MANAGEMENT", subtitle: "Account records and role data" },
  roles: { title: "ROLE MANAGEMENT", subtitle: "Manage admins and suspend / restore accounts" },
  maintenance: { title: "MAINTENANCE", subtitle: "System utilities and maintenance tools" },
  crm: { title: "CRM RECORDS", subtitle: "Manage church and ministry records" },
};

export default function DeveloperDashboard() {
  const [section, setSection] = useState("logs");
  const meta = SECTION_TITLES[section] ?? { title: section.toUpperCase(), subtitle: "" };

  const renderSection = () => {
    switch (section) {
      case "logs": return <SystemLogsSection />;
      case "errors": return <ErrorReportsSection />;
      case "metadata": return <UserManagementModule context="developer" />;
      case "roles": return <RoleManagementSection />;
      case "maintenance": return <MaintenanceSection />;
      case "crm": return <CrmSection />;
      default: return null;
    }
  };

  return (
    <div className="flex">
      <Sidebar role="developer" activeSection={section} onSectionChange={setSection} />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader role="developer" />
        <main
          className="flex-1"
          style={{
            overflowY: "auto",
            padding: "32px",
            backgroundColor: "var(--c-page-bg)",
          }}
        >
          <PageHeader title={meta.title} subtitle={meta.subtitle} />
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
