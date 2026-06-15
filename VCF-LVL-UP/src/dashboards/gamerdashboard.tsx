"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/sidebar";
import StatCard from "@/components/shared/stat-card";
import PageHeader from "@/components/shared/page-header";
import BracketManagementModule from "@/modules/bracket-management";
import AnnouncementManagementModule from "@/modules/announcement-management";
import LivestreamManagementModule from "@/modules/livestream-management";
import { matches } from "@/data/matches";
import { IconPlay } from "@/components/shared/icons";

function ProfileSection() {
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState("John Dela Cruz");
  const [ign, setIgn]         = useState("JohnDC_MLBB");
  const [phone, setPhone]     = useState("+63 912 345 6789");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 bg-[#232323] border-2 border-[#FF4655] rounded-full flex items-center justify-center font-head text-2xl font-bold text-[#FF4655]">JD</div>
        <div>
          <div className="font-head text-xl font-bold uppercase tracking-wide">{name}</div>
          <div className="text-[#B8B8B8] text-sm">{ign}</div>
          <span className="inline-block mt-1 bg-[#00F5D4]/15 text-[#00F5D4] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Team Member</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard value="Team Blaze" label="Current Team" accent="teal" />
        <StatCard value="MLBB" label="Game" />
        <StatCard value="4/5" label="Roster Filled" accent="red" />
      </div>

      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#B8B8B8]">Update Profile</div>
          <button onClick={() => setEditing(!editing)} className="text-xs border border-[#2E2E2E] text-[#808080] hover:text-white px-3 py-1 rounded transition-all">
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[["Full Name", name, setName], ["In-Game Name", ign, setIgn], ["Phone Number", phone, setPhone]].map(([label, val, setter]) => (
            <div key={label as string}>
              <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">{label as string}</label>
              <input
                value={val as string}
                onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                disabled={!editing}
                className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FF4655] disabled:opacity-50 transition-colors"
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
    { num: 1, name: "Marco Reyes",    ign: "MarcoRey_MLBB",  role: "Team Leader", status: "active" },
    { num: 2, name: "John Dela Cruz", ign: "JohnDC_MLBB",    role: "Member",      status: "active" },
    { num: 3, name: "Liza Santos",    ign: "LizaS_MLBB",     role: "Member",      status: "active" },
    { num: 4, name: "Kevin Bautista", ign: "KevB_MLBB",      role: "Member",      status: "active" },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard value="Team Blaze" label="Team Name" accent="teal" />
        <StatCard value="4/5" label="Roster Slots" accent="red" />
        <StatCard value="MLBB" label="Game" />
      </div>
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead><tr className="bg-[#232323]">{["#","Player","In-Game Name","Role","Status"].map((h) => <th key={h} className="text-left text-[10px] uppercase tracking-[1.5px] text-[#808080] px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {roster.map((r) => (
              <tr key={r.num} className="border-t border-[#2E2E2E] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-sm text-[#808080]">{r.num}</td>
                <td className="px-4 py-3 text-sm font-medium">{r.name}</td>
                <td className="px-4 py-3 text-xs text-[#B8B8B8]">{r.ign}</td>
                <td className="px-4 py-3"><span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${r.role === "Team Leader" ? "bg-[#FF4655]/20 text-[#FF4655]" : "bg-[#232323] text-[#808080]"}`}>{r.role}</span></td>
                <td className="px-4 py-3"><span className="bg-[#00F5D4]/15 text-[#00F5D4] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">{r.status}</span></td>
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
          <div key={m.id} className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-5 py-4 flex items-center gap-4">
            <div className="text-center min-w-[56px]">
              <div className="text-[10px] text-[#808080] uppercase">{d.toLocaleDateString("en-PH",{weekday:"short"})}</div>
              <div className="font-head text-2xl font-bold text-[#FF4655] leading-none">{d.getDate()}</div>
              <div className="text-[10px] text-[#808080]">{d.toLocaleDateString("en-PH",{month:"short"})}</div>
            </div>
            <div className="h-10 w-px bg-[#2E2E2E]" />
            <div className="flex items-center gap-3 flex-1">
              <span className={`font-head text-sm font-semibold uppercase ${m.teamA === "Team Blaze" ? "text-[#00F5D4]" : ""}`}>{m.teamA}</span>
              <span className="bg-[#232323] text-[#808080] text-xs font-bold px-2 py-0.5 rounded">VS</span>
              <span className={`font-head text-sm font-semibold uppercase ${m.teamB === "Team Blaze" ? "text-[#00F5D4]" : ""}`}>{m.teamB}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="bg-[#FF4655]/20 text-[#FF4655] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">{m.round}</span>
              <div className="text-[11px] text-[#808080] mt-1">{m.time}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  profile:       { title: "MY PROFILE",       subtitle: "View and update your player profile" },
  team:          { title: "MY TEAM",           subtitle: "Team information and roster" },
  schedule:      { title: "SCHEDULE",          subtitle: "Upcoming matches and events" },
  brackets:      { title: "BRACKETS",          subtitle: "MLBB Championship — Season 4" },
  announcements: { title: "ANNOUNCEMENTS",     subtitle: "Official updates from organizers" },
  livestream:    { title: "LIVESTREAM",         subtitle: "Watch live matches" },
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
    <div className="flex min-h-[calc(100vh-60px)]">
      <Sidebar role="gamer" activeSection={section} onSectionChange={setSection} />
      <main className="flex-1 p-8 overflow-y-auto">
        <PageHeader title={meta.title} subtitle={meta.subtitle} />
        {renderSection()}
      </main>
    </div>
  );
}
