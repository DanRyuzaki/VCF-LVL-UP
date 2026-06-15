"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/sidebar";
import StatCard from "@/components/shared/stat-card";
import PageHeader from "@/components/shared/page-header";
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
        {/* Pending */}
        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#B8B8B8] mb-4">Pending Submissions</div>
          {[
            { label: "Draft Announcement", badge: "Pending", badgeStyle: "bg-[#FF4655]/20 text-[#FF4655]" },
            { label: "Match Schedule — June 14", badge: "Pending", badgeStyle: "bg-[#FF4655]/20 text-[#FF4655]" },
            { label: "CODM Clash Details", badge: "Submitted", badgeStyle: "bg-[#232323] text-[#808080]" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-[#2E2E2E] last:border-0">
              <span className="text-sm">{item.label}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${item.badgeStyle}`}>{item.badge}</span>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#B8B8B8] mb-4">Recent Activity</div>
          {[
            { dot: "#FF4655", text: "Match result recorded", sub: "Team Blaze 2-0 Team Storm" },
            { dot: "#00F5D4", text: "Bracket updated", sub: "MLBB Season 4 Quarterfinals" },
            { dot: "#8B5CF6", text: "Player drafted", sub: "Ana Lim → Team Frost" },
          ].map((a) => (
            <div key={a.text} className="flex items-start gap-3 py-2.5 border-b border-[#2E2E2E] last:border-0">
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: a.dot }} />
              <div>
                <div className="text-sm">{a.text}</div>
                <div className="text-xs text-[#808080]">{a.sub}</div>
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
      {/* Free Agents */}
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#B8B8B8] mb-4">Free Agents ({freeAgents.length})</div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {freeAgents.map((fa) => (
            <div key={fa.name} className="flex items-center justify-between py-2.5 border-b border-[#2E2E2E] last:border-0">
              <div>
                <div className="text-sm font-medium">{fa.name}</div>
                <div className="text-xs text-[#808080]">{fa.game} · {fa.ign}</div>
              </div>
              <button className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors">Draft</button>
            </div>
          ))}
        </div>
      </div>

      {/* Draft Form */}
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#B8B8B8] mb-4">Assign to Team</div>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">Select Player</label>
            <select className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FF4655]">
              {freeAgents.map((fa) => <option key={fa.name}>{fa.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">Assign to Team</label>
            <select className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FF4655]">
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
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#B8B8B8] mb-4">Record New Result</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">Tournament</label>
            <select className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FF4655]"><option>MLBB Championship S4</option></select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">Match</label>
            <select className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FF4655]"><option>Team Nova vs Team Apex (QF)</option><option>Team Forge vs Team Rush (QF)</option></select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">Winner</label>
            <select className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FF4655]"><option>Select winner...</option><option>Team Nova</option><option>Team Apex</option></select>
          </div>
        </div>
        <button className="mt-4 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">Submit Result</button>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead><tr className="bg-[#232323]">{["Match","Tournament","Winner","Score","Date"].map((h) => <th key={h} className="text-left text-[10px] uppercase tracking-[1.5px] text-[#808080] px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {completed.map((m) => (
              <tr key={m.id} className="border-t border-[#2E2E2E] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-sm">{m.teamA} vs {m.teamB}</td>
                <td className="px-4 py-3 text-xs text-[#B8B8B8]">{m.tournamentName}</td>
                <td className="px-4 py-3 text-sm text-[#00F5D4] font-medium">{m.winner}</td>
                <td className="px-4 py-3 text-sm">{m.scoreA}-{m.scoreB}</td>
                <td className="px-4 py-3 text-xs text-[#808080]">{m.date}</td>
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
  teams:         { title: "TEAM MANAGEMENT",      subtitle: "Create, edit, and manage teams" },
  draft:         { title: "DRAFT PLAYERS",         subtitle: "Manage free agents and team assignments" },
  tournaments:   { title: "TOURNAMENTS",           subtitle: "Create and manage tournaments" },
  brackets:      { title: "BRACKET MANAGEMENT",   subtitle: "MLBB Championship Season 4" },
  results:       { title: "MATCH RESULTS",         subtitle: "Record and update match outcomes" },
  announcements: { title: "ANNOUNCEMENTS",         subtitle: "Submit announcements for admin approval" },
  calendar:      { title: "CALENDAR",              subtitle: "Submit and view scheduled events" },
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
    <div className="flex min-h-[calc(100vh-60px)]">
      <Sidebar role="organizer" activeSection={section} onSectionChange={setSection} />
      <main className="flex-1 p-8 overflow-y-auto">
        <PageHeader title={meta.title} subtitle={meta.subtitle} />
        {renderSection()}
      </main>
    </div>
  );
}
