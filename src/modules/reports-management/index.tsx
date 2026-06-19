"use client";
import StatCard from "@/components/shared/stat-card";

const participants = [
  { l: "MLBB Players", v: 32, c: "#00F5D4" },
  { l: "CODM Players", v: 16, c: "#8B5CF6" },
  { l: "Free Agents",  v: 6,  c: "var(--c-text-dim)" },
];

const engagement = [
  { l: "Announcements Published", v: 5 },
  { l: "Calendar Events",         v: 8 },
  { l: "Livestream Sessions",     v: 3 },
];

export default function ReportsManagementModule() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value="48" label="Total Players"      accent="teal" />
        <StatCard value="8"  label="Total Teams" />
        <StatCard value="3"  label="Total Tournaments"  accent="red" />
        <StatCard value="9"  label="Matches Completed"  accent="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dash-card p-5">
          <div className="dash-section-title">Youth Ministry Participants</div>
          {participants.map((r) => (
            <div key={r.l} className="dash-row-item">
              <span className="text-sm" style={{ color: "var(--c-text)" }}>{r.l}</span>
              <span className="font-head text-lg font-bold" style={{ color: r.c }}>{r.v}</span>
            </div>
          ))}
        </div>

        <div className="dash-card p-5">
          <div className="dash-section-title">Engagement</div>
          {engagement.map((r) => (
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