"use client";
import { matches } from "@/data/matches";

export default function ScheduleManagementModule() {
  const upcoming = matches.filter((m) => m.status === "pending");

  return (
    <div className="flex flex-col gap-3">
      {upcoming.map((m) => {
        const d = new Date(m.date);
        return (
          <div key={m.id} className="dash-card px-5 py-4 flex items-center gap-4">
            <div className="text-center min-w-[56px]">
              <div className="text-[10px] uppercase" style={{ color: "var(--c-text-dim)" }}>
                {d.toLocaleDateString("en-PH", { weekday: "short" })}
              </div>
              <div className="font-head text-2xl font-bold leading-none" style={{ color: "var(--c-accent)" }}>
                {d.getDate()}
              </div>
              <div className="text-[10px]" style={{ color: "var(--c-text-dim)" }}>
                {d.toLocaleDateString("en-PH", { month: "short" })}
              </div>
            </div>

            <div className="h-10 w-px" style={{ backgroundColor: "var(--c-border)" }} />

            <div className="flex items-center gap-3 flex-1">
              <span
                className={`font-head text-sm font-semibold uppercase ${m.teamA === "Team Blaze" ? "text-[#00F5D4]" : ""}`}
                style={m.teamA !== "Team Blaze" ? { color: "var(--c-text)" } : {}}
              >
                {m.teamA}
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" }}
              >
                VS
              </span>
              <span
                className={`font-head text-sm font-semibold uppercase ${m.teamB === "Team Blaze" ? "text-[#00F5D4]" : ""}`}
                style={m.teamB !== "Team Blaze" ? { color: "var(--c-text)" } : {}}
              >
                {m.teamB}
              </span>
            </div>

            <div className="text-right shrink-0">
              <span className="bg-[#FF4655]/20 text-[#FF4655] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                {m.round}
              </span>
              <div className="text-[11px] mt-1" style={{ color: "var(--c-text-dim)" }}>{m.time}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}