"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/sidebar";
import StatCard from "@/components/shared/stat-card";
import PageHeader from "@/components/shared/page-header";
import UserManagementModule from "@/modules/user-management";

const systemLogs = [
  { time: "2025-06-12 14:02:11", type: "INFO",  msg: "User login: marco@faith.com [Organizer]" },
  { time: "2025-06-12 14:01:55", type: "INFO",  msg: "Bracket generated: MLBB S4 — 8 teams" },
  { time: "2025-06-12 13:58:30", type: "WARN",  msg: "Announcement submission queued — awaiting approval" },
  { time: "2025-06-12 13:45:22", type: "ERROR", msg: "Firebase Auth timeout — retry successful" },
  { time: "2025-06-12 13:40:01", type: "INFO",  msg: "Match result submitted: Team Blaze 2-0 Team Storm" },
  { time: "2025-06-12 13:22:44", type: "INFO",  msg: "Player drafted: Ana Lim → Team Frost" },
  { time: "2025-06-12 13:15:09", type: "WARN",  msg: "Slow page load detected: /organizer/brackets (2.4s)" },
  { time: "2025-06-12 12:59:55", type: "INFO",  msg: "User logout: admin@faith.com" },
];

function logTypeColor(type: string) {
  if (type === "ERROR") return "#FF4655";
  if (type === "WARN")  return "#EAB308";
  return "#00F5D4";
}

function SystemLogsSection() {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter === "ALL" ? systemLogs : systemLogs.filter((l) => l.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["ALL","INFO","WARN","ERROR"].map((f) => (
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
    { time: "13:45:22", error: "Firebase Auth timeout",    page: "/login",               severity: "High"   },
    { time: "13:15:09", error: "Slow render: Bracket tree", page: "/organizer/brackets", severity: "Medium" },
    { time: "10:22:01", error: "Missing livestream embed",  page: "/gamer/livestream",   severity: "Low"    },
  ];
  const sevStyle = (s: string) => {
    if (s === "High")   return "bg-[#FF4655]/20 text-[#FF4655]";
    if (s === "Medium") return "bg-yellow-400/20 text-yellow-400";
    return "text-[#808080]";
  };
  const sevBg = (s: string) => s === "Low" ? "var(--c-surface3)" : undefined;

  return (
    <div className="dash-table-wrap">
      <table className="w-full border-collapse">
        <thead className="dash-thead">
          <tr>{["Time","Error","Page","Severity"].map((h) => <th key={h} className="dash-th">{h}</th>)}</tr>
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
  return (
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
        {[
          { name: "John Dela Cruz", role: "Gamer", status: "active"    },
          { name: "Ben Torres",     role: "Gamer", status: "suspended" },
          { name: "Liza Cruz",      role: "Gamer", status: "active"    },
        ].map((u) => (
          <div key={u.name} className="dash-row-item">
            <div>
              <div className="text-sm font-medium" style={{ color: "var(--c-text)" }}>{u.name}</div>
              <div className="text-xs" style={{ color: "var(--c-text-dim)" }}>{u.role} · {u.status}</div>
            </div>
            {u.status === "active"
              ? <button className="dash-btn-ghost text-xs px-3 py-1 rounded" style={{ color: "var(--c-text-dim)" }} onMouseEnter={(e) => { (e.currentTarget).style.color = "#FF4655"; (e.currentTarget).style.borderColor = "#FF4655"; }} onMouseLeave={(e) => { (e.currentTarget).style.color = "var(--c-text-dim)"; (e.currentTarget).style.borderColor = "var(--c-border)"; }}>Suspend</button>
              : <button className="bg-[#00F5D4]/20 text-[#00F5D4] hover:bg-[#00F5D4]/30 text-xs font-semibold px-3 py-1 rounded transition-colors">Restore</button>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

function MaintenanceSection() {
  const tools = [
    { icon: "🗑️", label: "Clear Cache",     sub: "Flush system cache",          action: "Cache cleared!" },
    { icon: "💾", label: "Backup Data",      sub: "Export Firestore snapshot",   action: "Backup initiated!" },
    { icon: "❤️", label: "Health Check",     sub: "Run system diagnostics",      action: "All systems healthy." },
    { icon: "📤", label: "Export Logs",      sub: "Download system log file",    action: "Logs exported!" },
    { icon: "🔧", label: "Maintenance Mode", sub: "Toggle maintenance screen",   action: "Maintenance mode toggled." },
    { icon: "🔄", label: "Restart Services", sub: "Restart background services", action: "Services restarting..." },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {tools.map((t) => (
        <button
          key={t.label}
          onClick={() => alert(t.action)}
          className="dash-card p-5 text-left transition-all"
          style={{ borderColor: t.label === "Maintenance Mode" ? "rgba(255,70,85,0.25)" : "var(--c-border)" }}
        >
          <div className="text-2xl mb-2">{t.icon}</div>
          <div className="font-semibold text-sm mb-1" style={{ color: t.label === "Maintenance Mode" ? "var(--c-accent)" : "var(--c-text)" }}>{t.label}</div>
          <div className="text-xs" style={{ color: "var(--c-text-dim)" }}>{t.sub}</div>
        </button>
      ))}
    </div>
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
            <tr>{["Name","Type","Contact","Notes","Actions"].map((h) => <th key={h} className="dash-th">{h}</th>)}</tr>
          </thead>
          <tbody>
            {[
              { name: "Word Baptist Church HQ", type: "Ministry", contact: "admin@wbc.org",  note: "Main organization", tc: "bg-[#8B5CF6]/20 text-[#8B5CF6]" },
              { name: "Youth Ministry Group A", type: "Group",    contact: "youth@wbc.org",  note: "MLBB division",     tc: "bg-[#00F5D4]/15 text-[#00F5D4]" },
              { name: "Youth Ministry Group B", type: "Group",    contact: "youth2@wbc.org", note: "CODM division",     tc: "bg-[#00F5D4]/15 text-[#00F5D4]" },
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
  logs:        { title: "SYSTEM LOGS",     subtitle: "Client-side activity and event logs" },
  errors:      { title: "ERROR REPORTS",   subtitle: "Client-side error tracking" },
  metadata:    { title: "USER METADATA",   subtitle: "Account records and role data" },
  roles:       { title: "ROLE MANAGEMENT", subtitle: "Manage admins and suspend / restore accounts" },
  maintenance: { title: "MAINTENANCE",     subtitle: "System utilities and maintenance tools" },
  crm:         { title: "CRM RECORDS",     subtitle: "Manage church and ministry records" },
};

export default function DeveloperDashboard() {
  const [section, setSection] = useState("logs");
  const meta = SECTION_TITLES[section] ?? { title: section.toUpperCase(), subtitle: "" };

  const renderSection = () => {
    switch (section) {
      case "logs":        return <SystemLogsSection />;
      case "errors":      return <ErrorReportsSection />;
      case "metadata":    return <UserManagementModule />;
      case "roles":       return <RoleManagementSection />;
      case "maintenance": return <MaintenanceSection />;
      case "crm":         return <CrmSection />;
      default:            return null;
    }
  };

  return (
    <div className="flex">
      <Sidebar role="developer" activeSection={section} onSectionChange={setSection} />
      <main
        className="flex-1"
        style={{
          minHeight: "calc(100vh - 60px)",
          overflowY: "auto",
          padding: "32px",
          backgroundColor: "var(--c-page-bg)",
        }}
      >
        <PageHeader title={meta.title} subtitle={meta.subtitle} />
        {renderSection()}
      </main>
    </div>
  );
}
