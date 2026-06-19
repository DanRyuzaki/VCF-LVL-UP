"use client";
import StatCard from "@/components/shared/stat-card";

const pendingItems = [
  { type: "Announcement", label: "Practice Schedule Update", sub: "Submitted by Organizer" },
  { type: "Calendar",     label: "CODM Finals Event",         sub: "Submitted by Organizer" },
  { type: "Account",      label: "New Organizer — Maria Santos", sub: "Awaiting approval" },
];

const tournamentHealth = [
  { name: "MLBB Championship S4", pct: 75, color: "#00F5D4" },
  { name: "CODM Clash S1",        pct: 50, color: "#FF4655" },
];

export default function AdminOverviewModule() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value="3"  label="Pending Approvals"   accent="red" />
        <StatCard value="48" label="Registered Players"  accent="teal" />
        <StatCard value="2"  label="Active Tournaments" />
        <StatCard value="1"  label="Live Streams"        accent="purple" />
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
          {tournamentHealth.map((t) => (
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