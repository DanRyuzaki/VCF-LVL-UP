import { matches } from "@/data/matches";

export default function MatchesSection() {
  const upcoming = matches.filter((m) => m.status === "pending").slice(0, 4);

  return (
    <section
      id="matches"
      className="py-16 px-6"
      style={{ backgroundColor: "var(--c-surface)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] uppercase tracking-[2px] mb-2" style={{ color: "var(--c-accent)" }}>
          Schedule
        </div>
        <h2 className="font-head text-3xl font-bold uppercase tracking-wide mb-8" style={{ color: "var(--c-text)" }}>
          UPCOMING MATCHES
        </h2>

        <div className="flex flex-col gap-3">
          {upcoming.map((m) => {
            const dateObj = new Date(m.date);
            const day   = dateObj.toLocaleDateString("en-PH", { weekday: "short" });
            const num   = dateObj.getDate();
            const month = dateObj.toLocaleDateString("en-PH", { month: "short" });

            return (
              <div
                key={m.id}
                className="rounded-lg px-5 py-4 flex items-center gap-4 border transition-colors"
                style={{
                  backgroundColor: "var(--c-surface2)",
                  borderColor: "var(--c-border)",
                }}
              >
                {/* Date block */}
                <div className="text-center min-w-[64px]">
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--c-text-dim)" }}>
                    {day}
                  </div>
                  <div className="font-head text-2xl font-bold leading-none" style={{ color: "var(--c-accent)" }}>
                    {num}
                  </div>
                  <div className="text-[10px]" style={{ color: "var(--c-text-dim)" }}>
                    {month}
                  </div>
                </div>

                <div className="h-10 w-px" style={{ backgroundColor: "var(--c-border)" }} />

                {/* Teams */}
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-head text-base font-semibold uppercase" style={{ color: "var(--c-text)" }}>
                    {m.teamA}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" }}
                  >
                    VS
                  </span>
                  <span className="font-head text-base font-semibold uppercase" style={{ color: "var(--c-text)" }}>
                    {m.teamB}
                  </span>
                </div>

                {/* Meta */}
                <div className="text-right shrink-0">
                  <div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                      style={{ backgroundColor: "rgba(255,70,85,0.18)", color: "var(--c-accent)" }}
                    >
                      {m.round} · {m.game}
                    </span>
                  </div>
                  <div className="text-[11px] mt-1" style={{ color: "var(--c-text-dim)" }}>
                    {m.time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
