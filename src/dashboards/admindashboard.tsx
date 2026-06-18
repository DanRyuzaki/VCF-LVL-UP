"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/sidebar";
import StatCard from "@/components/shared/stat-card";
import PageHeader from "@/components/shared/page-header";
import DashboardHeader from "@/components/shared/dashboard-header";
import UserManagementModule from "@/modules/user-management";
import CalendarManagementModule from "@/modules/calendar-management";
import LivestreamManagementModule from "@/modules/livestream-management";
import DeletedReportsModule from "@/modules/deleted-reports";
import CommunicationModule from "@/modules/communication";
import { tournaments } from "@/data/tournaments";

function OverviewSection() {
  const pendingItems = [
    { type: "Announcement", label: "Practice Schedule Update", sub: "Submitted by Organizer" },
    { type: "Calendar", label: "CODM Finals Event", sub: "Submitted by Organizer" },
    { type: "Account", label: "New Organizer — Maria Santos", sub: "Awaiting approval" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value="3" label="Pending Approvals" accent="red" />
        <StatCard value="48" label="Registered Players" accent="teal" />
        <StatCard value="2" label="Active Tournaments" />
        <StatCard value="1" label="Live Streams" accent="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dash-card p-5">
          <div className="dash-section-title">Pending Approvals</div>
          {pendingItems.map((item) => (
            <div key={item.label} className="dash-row-item">
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--c-text)" }}>{item.label}</div>
                <div className="text-xs" style={{ color: "var(--c-text-dim)" }}>{item.type} · {item.sub}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="bg-[#00F5D4]/20 text-[#00F5D4] text-xs font-semibold px-3 py-1 rounded transition-colors hover:bg-[#00F5D4]/30">✓</button>
                <button className="dash-btn-ghost text-xs px-3 py-1 rounded">✗</button>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-card p-5">
          <div className="dash-section-title">Tournament Health</div>
          {[
            { name: "MLBB Championship S4", pct: 75, color: "#00F5D4" },
            { name: "CODM Clash S1", pct: 50, color: "#FF4655" },
          ].map((t) => (
            <div key={t.name} className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: "var(--c-text)" }}>{t.name}</span>
                <span style={{ color: t.color }}>{t.pct}%</span>
              </div>
              <div className="rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: "var(--c-border)" }}>
                <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApprovalsSection() {
  const items = [
    { type: "Announcement", label: "Practice Schedule Update", submittedBy: "Organizer", date: "Jun 12", status: "pending" },
    { type: "Calendar", label: "CODM Finals Event", submittedBy: "Organizer", date: "Jun 11", status: "pending" },
    { type: "Account", label: "New Organizer — Maria Santos", submittedBy: "System", date: "Jun 10", status: "pending" },
  ];

  const typeBadge = (t: string) => {
    if (t === "Announcement") return "bg-[#FF4655]/20 text-[#FF4655]";
    if (t === "Calendar") return "bg-[#8B5CF6]/20 text-[#8B5CF6]";
    return "text-[#808080]";
  };

  return (
    <div className="dash-table-wrap">
      <table className="w-full border-collapse">
        <thead className="dash-thead">
          <tr>{["Type", "Title", "Submitted By", "Date", "Actions"].map((h) => <th key={h} className="dash-th">{h}</th>)}</tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.label} className="dash-tr">
              <td className="dash-td"><span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${typeBadge(item.type)}`}>{item.type}</span></td>
              <td className="dash-td">{item.label}</td>
              <td className="dash-td-muted">{item.submittedBy}</td>
              <td className="dash-td-dim">{item.date}</td>
              <td className="dash-td">
                <div className="flex gap-2">
                  <button className="bg-[#00F5D4]/20 text-[#00F5D4] hover:bg-[#00F5D4]/30 text-xs font-semibold px-3 py-1.5 rounded transition-colors">Approve</button>
                  <button className="dash-btn-ghost text-xs px-3 py-1.5 rounded">Reject</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TournamentMonitorSection() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value="48" label="Total Players" accent="teal" />
        <StatCard value="8" label="Total Teams" />
        <StatCard value="3" label="Tournaments" accent="red" />
        <StatCard value="9" label="Matches Done" accent="purple" />
      </div>
      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>{["Tournament", "Game", "Teams", "Matches Played", "Status"].map((h) => <th key={h} className="dash-th">{h}</th>)}</tr>
          </thead>
          <tbody>
            {tournaments.map((t) => (
              <tr key={t.id} className="dash-tr">
                <td className="dash-td font-semibold">{t.name} S{t.season}</td>
                <td className="dash-td-muted">{t.game}</td>
                <td className="dash-td">{t.teamsRegistered}/{t.maxTeams}</td>
                <td className="dash-td">{t.matchesPlayed}/{t.totalMatches}</td>
                <td className="dash-td">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${t.status === "ongoing" ? "bg-[#FF4655]/20 text-[#FF4655]" : t.status === "registration" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "text-[#808080]"}`} style={t.status === "completed" ? { backgroundColor: "var(--c-surface3)" } : {}}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsSection() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value="48" label="Total Players" accent="teal" />
        <StatCard value="8" label="Total Teams" />
        <StatCard value="3" label="Total Tournaments" accent="red" />
        <StatCard value="9" label="Matches Completed" accent="purple" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dash-card p-5">
          <div className="dash-section-title">Youth Ministry Participants</div>
          {[{ l: "MLBB Players", v: 32, c: "#00F5D4" }, { l: "CODM Players", v: 16, c: "#8B5CF6" }, { l: "Free Agents", v: 6, c: "var(--c-text-dim)" }].map((r) => (
            <div key={r.l} className="dash-row-item">
              <span className="text-sm" style={{ color: "var(--c-text)" }}>{r.l}</span>
              <span className="font-head text-lg font-bold" style={{ color: r.c }}>{r.v}</span>
            </div>
          ))}
        </div>
        <div className="dash-card p-5">
          <div className="dash-section-title">Engagement</div>
          {[{ l: "Announcements Published", v: 5 }, { l: "Calendar Events", v: 8 }, { l: "Livestream Sessions", v: 3 }].map((r) => (
            <div key={r.l} className="dash-row-item">
              <span className="text-sm" style={{ color: "var(--c-text)" }}>{r.l}</span>
              <span className="font-head text-lg font-bold" style={{ color: "var(--c-text)" }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  overview: { title: "ADMIN DASHBOARD", subtitle: "System overview and pending actions" },
  approvals: { title: "APPROVAL CENTER", subtitle: "Review announcements and calendar events" },
  users: { title: "USER MANAGEMENT", subtitle: "Monitor all registered accounts" },
  tournaments: { title: "TOURNAMENT MONITOR", subtitle: "View tournament reports and registrations" },
  livestream: { title: "LIVESTREAM MANAGEMENT", subtitle: "Manage embedded stream links" },
  calendar: { title: "CALENDAR MANAGEMENT", subtitle: "Manage and approve calendar events" },
  reports: { title: "REPORTS", subtitle: "Tournament and registration reports" },
  "deleted-reports": { title: "DELETED REPORTS", subtitle: "Administrative user deletion history and audit trail" },
  communication: { title: "COMMUNICATION MODULE", subtitle: "Internal messaging system for Admins and Developers" },
};

export default function AdminDashboard() {
  const [section, setSection] = useState("overview");
  const meta = SECTION_TITLES[section] ?? { title: section.toUpperCase(), subtitle: "" };

  const renderSection = () => {
    switch (section) {
      case "overview": return <OverviewSection />;
      case "approvals": return <ApprovalsSection />;
      case "users": return <UserManagementModule context="admin" onNavigate={setSection} />;
      case "tournaments": return <TournamentMonitorSection />;
      case "livestream": return <LivestreamManagementModule showManageControls />;
      case "calendar": return <CalendarManagementModule showSubmitForm showApproveActions />;
      case "reports": return <ReportsSection />;
      case "deleted-reports": return <DeletedReportsModule />;
      case "communication": return <CommunicationModule context="admin" />;
      default: return null;
    }
  };

  return (
    <div className="flex">
      <Sidebar role="admin" activeSection={section} onSectionChange={setSection} />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader role="admin" />
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

