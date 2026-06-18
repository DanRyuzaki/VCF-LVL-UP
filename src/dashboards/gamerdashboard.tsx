"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/sidebar";
import StatCard from "@/components/shared/stat-card";
import PageHeader from "@/components/shared/page-header";
import DashboardHeader from "@/components/shared/dashboard-header";
import BracketManagementModule from "@/modules/bracket-management";
import AnnouncementManagementModule from "@/modules/announcement-management";
import LivestreamManagementModule from "@/modules/livestream-management";
import { matches } from "@/data/matches";

function ProfileSection() {
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState("John Dela Cruz");
  const [ign, setIgn]         = useState("JohnDC_MLBB");
  const [phone, setPhone]     = useState("+63 912 345 6789");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-head text-2xl font-bold"
          style={{
            backgroundColor: "var(--c-surface3)",
            border: "2px solid var(--c-accent)",
            color: "var(--c-accent)",
          }}
        >
          JD
        </div>
        <div>
          <div className="font-head text-xl font-bold uppercase tracking-wide" style={{ color: "var(--c-text)" }}>{name}</div>
          <div className="text-sm" style={{ color: "var(--c-text-muted)" }}>{ign}</div>
          <span className="inline-block mt-1 bg-[#00F5D4]/15 text-[#00F5D4] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Team Member</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard value="Team Blaze" label="Current Team" accent="teal" />
        <StatCard value="MLBB" label="Game" />
        <StatCard value="4/5" label="Roster Filled" accent="red" />
      </div>

      <div className="dash-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="dash-section-title" style={{ marginBottom: 0 }}>Update Profile</div>
          <button onClick={() => setEditing(!editing)} className="dash-btn-ghost text-xs px-3 py-1 rounded">
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {([[" Full Name", name, setName], ["In-Game Name", ign, setIgn], ["Phone Number", phone, setPhone]] as [string, string, (v: string) => void][]).map(([label, val, setter]) => (
            <div key={label}>
              <label className="dash-label">{label}</label>
              <input
                value={val}
                onChange={(e) => setter(e.target.value)}
                disabled={!editing}
                className="dash-input"
                style={{ opacity: editing ? 1 : 0.5 }}
              />
            </div>
          ))}
        </div>
        {editing && (
          <button onClick={() => setEditing(false)} className="mt-4 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">Save Changes</button>
        )}
      </div>
    </div>
  );
}

function TeamSection() {
  const roster = [
    { num: 1, name: "Marco Reyes",    ign: "MarcoRey_MLBB", role: "Team Leader", status: "active" },
    { num: 2, name: "John Dela Cruz", ign: "JohnDC_MLBB",   role: "Member",      status: "active" },
    { num: 3, name: "Liza Santos",    ign: "LizaS_MLBB",    role: "Member",      status: "active" },
    { num: 4, name: "Kevin Bautista", ign: "KevB_MLBB",     role: "Member",      status: "active" },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard value="Team Blaze" label="Team Name" accent="teal" />
        <StatCard value="4/5" label="Roster Slots" accent="red" />
        <StatCard value="MLBB" label="Game" />
      </div>
      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>{["#","Player","In-Game Name","Role","Status"].map((h) => <th key={h} className="dash-th">{h}</th>)}</tr>
          </thead>
          <tbody>
            {roster.map((r) => (
              <tr key={r.num} className="dash-tr">
                <td className="dash-td-dim">{r.num}</td>
                <td className="dash-td font-medium">{r.name}</td>
                <td className="dash-td-muted">{r.ign}</td>
                <td className="dash-td">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${r.role === "Team Leader" ? "bg-[#FF4655]/20 text-[#FF4655]" : ""}`} style={r.role !== "Team Leader" ? { backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" } : {}}>{r.role}</span>
                </td>
                <td className="dash-td"><span className="bg-[#00F5D4]/15 text-[#00F5D4] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScheduleSection() {
  const upcoming = matches.filter((m) => m.status === "pending");
  return (
    <div className="flex flex-col gap-3">
      {upcoming.map((m) => {
        const d = new Date(m.date);
        return (
          <div
            key={m.id}
            className="dash-card px-5 py-4 flex items-center gap-4"
          >
            <div className="text-center min-w-[56px]">
              <div className="text-[10px] uppercase" style={{ color: "var(--c-text-dim)" }}>{d.toLocaleDateString("en-PH",{weekday:"short"})}</div>
              <div className="font-head text-2xl font-bold leading-none" style={{ color: "var(--c-accent)" }}>{d.getDate()}</div>
              <div className="text-[10px]" style={{ color: "var(--c-text-dim)" }}>{d.toLocaleDateString("en-PH",{month:"short"})}</div>
            </div>
            <div className="h-10 w-px" style={{ backgroundColor: "var(--c-border)" }} />
            <div className="flex items-center gap-3 flex-1">
              <span className={`font-head text-sm font-semibold uppercase ${m.teamA === "Team Blaze" ? "text-[#00F5D4]" : ""}`} style={m.teamA !== "Team Blaze" ? { color: "var(--c-text)" } : {}}>{m.teamA}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" }}>VS</span>
              <span className={`font-head text-sm font-semibold uppercase ${m.teamB === "Team Blaze" ? "text-[#00F5D4]" : ""}`} style={m.teamB !== "Team Blaze" ? { color: "var(--c-text)" } : {}}>{m.teamB}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="bg-[#FF4655]/20 text-[#FF4655] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">{m.round}</span>
              <div className="text-[11px] mt-1" style={{ color: "var(--c-text-dim)" }}>{m.time}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  profile:       { title: "MY PROFILE",   subtitle: "View and update your player profile" },
  team:          { title: "MY TEAM",      subtitle: "Team information and roster" },
  schedule:      { title: "SCHEDULE",     subtitle: "Upcoming matches and events" },
  brackets:      { title: "BRACKETS",     subtitle: "MLBB Championship — Season 4" },
  announcements: { title: "ANNOUNCEMENTS",subtitle: "Official updates from organizers" },
  livestream:    { title: "LIVESTREAM",   subtitle: "Watch live matches" },
};

export default function GamerDashboard() {
  const [section, setSection] = useState("profile");
  const meta = SECTION_TITLES[section] ?? { title: section.toUpperCase(), subtitle: "" };

  const renderSection = () => {
    switch (section) {
      case "profile":       return <ProfileSection />;
      case "team":          return <TeamSection />;
      case "schedule":      return <ScheduleSection />;
      case "brackets":      return <BracketManagementModule showActions={false} />;
      case "announcements": return <AnnouncementManagementModule showSubmitForm={false} />;
      case "livestream":    return <LivestreamManagementModule showManageControls={false} />;
      default:              return null;
    }
  };

  return (
    <div className="flex">
      <Sidebar role="gamer" activeSection={section} onSectionChange={setSection} />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader role="gamer" />
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
