import { tournaments } from "@/data/tournaments";
import { Tournament } from "@/types/tournament";

function statusBadge(status: Tournament["status"]) {
  if (status === "ongoing")
    return (
      <span
        className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
        style={{ backgroundColor: "rgba(255,70,85,0.18)", color: "var(--c-accent)" }}
      >
        LIVE
      </span>
    );
  if (status === "registration")
    return (
      <span
        className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
        style={{ backgroundColor: "rgba(0,245,212,0.12)", color: "#00F5D4" }}
      >
        REGISTRATION
      </span>
    );
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
      style={{ backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" }}
    >
      COMPLETED
    </span>
  );
}

function statusColor(status: Tournament["status"]) {
  if (status === "ongoing")    return "#00F5D4";
  if (status === "registration") return "#00F5D4";
  return "var(--c-text-dim)";
}

export default function TournaSection() {
  return (
    <section id="tournaments" className="py-16 px-6" style={{ backgroundColor: "var(--c-page-bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] uppercase tracking-[2px] mb-2" style={{ color: "var(--c-accent)" }}>
          Active Events
        </div>
        <h2 className="font-head text-3xl font-bold uppercase tracking-wide mb-8" style={{ color: "var(--c-text)" }}>
          TOURNAMENT OVERVIEW
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tournaments.map((t) => (
            <div
              key={t.id}
              className="rounded-lg p-5 border transition-colors"
              style={{
                backgroundColor: "var(--c-surface2)",
                borderColor: "var(--c-border)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                {statusBadge(t.status)}
                <span className="text-[11px]" style={{ color: "var(--c-text-dim)" }}>
                  Season {t.season}
                </span>
              </div>

              <div className="font-head text-lg font-bold uppercase tracking-wide mb-1" style={{ color: "var(--c-text)" }}>
                {t.name}
              </div>
              <div className="text-xs mb-4" style={{ color: "var(--c-text-muted)" }}>
                {t.game === "MLBB" ? "Mobile Legends: Bang Bang" : "Call of Duty: Mobile"} · {t.format}
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-xs" style={{ color: "var(--c-text-dim)" }}>
                <div>
                  Teams:{" "}
                  <span style={{ color: "var(--c-text)" }}>
                    {t.teamsRegistered}/{t.maxTeams}
                  </span>
                </div>
                <div>
                  Matches:{" "}
                  <span style={{ color: "var(--c-text)" }}>
                    {t.matchesPlayed}/{t.totalMatches}
                  </span>
                </div>
                <div>
                  Status:{" "}
                  <span style={{ color: statusColor(t.status) }}>
                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </span>
                </div>
                <div>
                  Format: <span style={{ color: "var(--c-text)" }}>Single Elim</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
