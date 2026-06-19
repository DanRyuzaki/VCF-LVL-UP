"use client";

import StatCard from "@/components/shared/stat-card";
import { useOrganizerContext } from "@/lib/organizer-context";

export default function OverviewManagementModule() {
  const { tournaments, teams, draftedPlayers, matchesState, announcements } =
    useOrganizerContext();

  const pendingMatchCount = matchesState.filter((m) => m.status === "pending").length;
  const completedMatches  = matchesState.filter((m) => m.status === "completed").slice(-3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={tournaments.length}    label="Active Tournaments" accent="red" />
        <StatCard value={teams.length}          label="Teams Registered"   accent="teal" />
        <StatCard value={draftedPlayers.length} label="Drafted Players"    accent="purple" />
        <StatCard value={pendingMatchCount}     label="Matches Upcoming" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dash-card p-5">
          <div className="dash-section-title">Announcement Pending Actions</div>
          {announcements.map((item) => (
            <div key={item.id} className="dash-row-item">
              <span className="text-sm font-semibold" style={{ color: "var(--c-text)" }}>
                {item.title}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                  item.status === "pending"
                    ? "bg-[#FF4655]/20 text-[#FF4655]"
                    : "bg-[#00F5D4]/15 text-[#00F5D4]"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>

        <div className="dash-card p-5">
          <div className="dash-section-title">Match Result Activities</div>
          <div className="space-y-3">
            {completedMatches.map((m) => (
              <div
                key={m.id}
                className="flex items-start gap-3 py-2 border-b border-[var(--c-border)]"
              >
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[#FF4655]" />
                <div>
                  <div className="text-xs font-bold text-[var(--c-text)]">
                    {m.teamA} vs {m.teamB} completed
                  </div>
                  <div className="text-[10px] text-[var(--c-text-muted)]">
                    Winner: {m.winner} ({m.scoreA}–{m.scoreB})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
