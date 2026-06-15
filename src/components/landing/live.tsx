import { IconPlay } from "@/components/shared/icons";
import { livestreams } from "@/data/livestreams";

export default function LiveSection() {
  const active = livestreams.find((l) => l.status === "live");

  return (
    <section id="livestream" className="py-16 px-6" style={{ backgroundColor: "var(--c-page-bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] uppercase tracking-[2px] mb-2" style={{ color: "var(--c-accent)" }}>
          Live Coverage
        </div>
        <h2 className="font-head text-3xl font-bold uppercase tracking-wide mb-8" style={{ color: "var(--c-text)" }}>
          LIVESTREAM ACCESS
        </h2>

        <div className="max-w-2xl">
          <div
            className="relative border rounded-lg overflow-hidden aspect-video flex items-center justify-center cursor-pointer group transition-colors"
            style={{
              backgroundColor: "var(--c-surface2)",
              borderColor: "var(--c-border)",
            }}
          >
            {/* Background texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A0A0A] to-[#0A0A1A] opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-head text-[5rem] font-bold uppercase tracking-[8px] select-none"
                style={{ color: "rgba(255,70,85,0.08)" }}>
                LIVE
              </span>
            </div>

            {/* Overlay */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ backgroundColor: "var(--c-accent)" }}
              >
                <IconPlay size={20} className="ml-1" />
              </div>
              <div className="font-head text-sm font-semibold uppercase tracking-[2px] flex items-center gap-2"
                style={{ color: "var(--c-text)" }}>
                <span className="w-2 h-2 rounded-full animate-pulse-dot inline-block"
                  style={{ backgroundColor: "var(--c-accent)" }} />
                {active ? "LIVE NOW" : "STREAM OFFLINE"}
              </div>
              {active && (
                <div className="text-xs" style={{ color: "var(--c-text-muted)" }}>
                  {active.tournamentName}
                </div>
              )}
            </div>
          </div>

          {active && (
            <div className="mt-3 flex items-center gap-3">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ backgroundColor: "rgba(255,70,85,0.18)", color: "var(--c-accent)" }}
              >
                LIVE
              </span>
              <span className="text-sm" style={{ color: "var(--c-text-muted)" }}>
                {active.label}
              </span>
              <span className="text-xs ml-auto" style={{ color: "var(--c-text-dim)" }}>
                {active.url.substring(0, 40)}...
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
