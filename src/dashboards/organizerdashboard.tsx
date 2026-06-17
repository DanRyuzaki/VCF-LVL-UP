"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/sidebar";
import StatCard from "@/components/shared/stat-card";
import PageHeader from "@/components/shared/page-header";
import DashboardHeader from "@/components/shared/dashboard-header";
import TeamManagementModule from "@/modules/team-management";
import TournamentManagementModule from "@/modules/tournament-management";
import BracketManagementModule from "@/modules/bracket-management";
import AnnouncementManagementModule from "@/modules/announcement-management";
import CalendarManagementModule from "@/modules/calendar-management";
import { matches } from "@/data/matches";

function OverviewSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value="2"  label="Active Tournaments" accent="red" />
        <StatCard value="8"  label="Teams Registered"   accent="teal" />
        <StatCard value="42" label="Drafted Players"     accent="purple" />
        <StatCard value="6"  label="Matches Upcoming" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dash-card p-5">
          <div className="dash-section-title">Pending Submissions</div>
          {[
            { label: "Draft Announcement",    badge: "Pending",   badgeStyle: "bg-[#FF4655]/20 text-[#FF4655]" },
            { label: "Match Schedule — Jun 14", badge: "Pending", badgeStyle: "bg-[#FF4655]/20 text-[#FF4655]" },
            { label: "CODM Clash Details",    badge: "Submitted", badgeStyle: "" },
          ].map((item) => (
            <div key={item.label} className="dash-row-item">
              <span className="text-sm" style={{ color: "var(--c-text)" }}>{item.label}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${item.badgeStyle}`} style={!item.badgeStyle ? { backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" } : {}}>{item.badge}</span>
            </div>
          ))}
        </div>

        <div className="dash-card p-5">
          <div className="dash-section-title">Recent Activity</div>
          {[
            { dot: "#FF4655", text: "Match result recorded", sub: "Team Blaze 2-0 Team Storm" },
            { dot: "#00F5D4", text: "Bracket updated",        sub: "MLBB Season 4 Quarterfinals" },
            { dot: "#8B5CF6", text: "Player drafted",         sub: "Ana Lim → Team Frost" },
          ].map((a) => (
            <div key={a.text} className="flex items-start gap-3 py-2.5" style={{ borderBottom: "1px solid var(--c-border)" }}>
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: a.dot }} />
              <div>
                <div className="text-sm" style={{ color: "var(--c-text)" }}>{a.text}</div>
                <div className="text-xs" style={{ color: "var(--c-text-dim)" }}>{a.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DraftSection() {
  const freeAgents = [
    { name: "Ana Lim",    game: "MLBB", ign: "AnaLim_PH" },
    { name: "Ben Torres", game: "MLBB", ign: "BenT_MLBB" },
    { name: "Claire Ong", game: "CODM", ign: "ClaireOng" },
    { name: "Dan Perez",  game: "CODM", ign: "DanP_COD"  },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="dash-card p-5">
        <div className="dash-section-title">Free Agents ({freeAgents.length})</div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {freeAgents.map((fa) => (
            <div key={fa.name} className="dash-row-item">
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--c-text)" }}>{fa.name}</div>
                <div className="text-xs" style={{ color: "var(--c-text-dim)" }}>{fa.game} · {fa.ign}</div>
              </div>
              <button className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors">Draft</button>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card p-5">
        <div className="dash-section-title">Assign to Team</div>
        <div className="space-y-3">
          <div>
            <label className="dash-label">Select Player</label>
            <select className="dash-select">
              {freeAgents.map((fa) => <option key={fa.name}>{fa.name}</option>)}
            </select>
          </div>
          <div>
            <label className="dash-label">Assign to Team</label>
            <select className="dash-select">
              <option>Team Venom</option><option>Team Blaze</option><option>Team Storm</option>
            </select>
          </div>
          <button className="w-full bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors">Confirm Draft</button>
        </div>
      </div>
    </div>
  );
}

function MatchResultsSection() {
  const completed = matches.filter((m) => m.status === "completed");
  return (
    <div className="space-y-5">
      <div className="dash-card p-5">
        <div className="dash-section-title">Record New Result</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="dash-label">Tournament</label>
            <select className="dash-select"><option>MLBB Championship S4</option></select>
          </div>
          <div>
            <label className="dash-label">Match</label>
            <select className="dash-select"><option>Team Nova vs Team Apex (QF)</option><option>Team Forge vs Team Rush (QF)</option></select>
          </div>
          <div>
            <label className="dash-label">Winner</label>
            <select className="dash-select"><option>Select winner...</option><option>Team Nova</option><option>Team Apex</option></select>
          </div>
        </div>
        <button className="mt-4 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">Submit Result</button>
      </div>

      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>{["Match","Tournament","Winner","Score","Date"].map((h) => <th key={h} className="dash-th">{h}</th>)}</tr>
          </thead>
          <tbody>
            {completed.map((m) => (
              <tr key={m.id} className="dash-tr">
                <td className="dash-td">{m.teamA} vs {m.teamB}</td>
                <td className="dash-td-muted">{m.tournamentName}</td>
                <td className="dash-td font-medium" style={{ color: "#00F5D4" }}>{m.winner}</td>
                <td className="dash-td">{m.scoreA}-{m.scoreB}</td>
                <td className="dash-td-dim">{m.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  overview:      { title: "ORGANIZER DASHBOARD", subtitle: "Tournament management overview" },
  teams:         { title: "TEAM MANAGEMENT",     subtitle: "Create, edit, and manage teams" },
  draft:         { title: "DRAFT PLAYERS",        subtitle: "Manage free agents and team assignments" },
  tournaments:   { title: "TOURNAMENTS",          subtitle: "Create and manage tournaments" },
  brackets:      { title: "BRACKET MANAGEMENT",  subtitle: "MLBB Championship Season 4" },
  results:       { title: "MATCH RESULTS",        subtitle: "Record and update match outcomes" },
  announcements: { title: "ANNOUNCEMENTS",        subtitle: "Submit announcements for admin approval" },
  calendar:      { title: "CALENDAR",             subtitle: "Submit and view scheduled events" },
};

export default function OrganizerDashboard() {
  const [section, setSection] = useState("overview");
  const meta = SECTION_TITLES[section] ?? { title: section.toUpperCase(), subtitle: "" };

  const renderSection = () => {
    switch (section) {
      case "overview":      return <OverviewSection />;
      case "teams":         return <TeamManagementModule />;
      case "draft":         return <DraftSection />;
      case "tournaments":   return <TournamentManagementModule />;
      case "brackets":      return <BracketManagementModule showActions />;
      case "results":       return <MatchResultsSection />;
      case "announcements": return <AnnouncementManagementModule showSubmitForm showApproveActions={false} />;
      case "calendar":      return <CalendarManagementModule showSubmitForm showApproveActions={false} />;
      default:              return null;
    }
  };

  return (
    <div className="flex">
      <Sidebar role="organizer" activeSection={section} onSectionChange={setSection} />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader role="organizer" />
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
