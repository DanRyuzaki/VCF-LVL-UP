import { matches } from "@/data/matches";

export default function MatchesSection() {
  const upcoming = matches.filter((m) => m.status === "pending").slice(0, 4);

  return (
    <section id="matches" className="py-16 px-6 bg-[#121212]">
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] uppercase tracking-[2px] text-[#FF4655] mb-2">Schedule</div>
        <h2 className="font-head text-3xl font-bold uppercase tracking-wide mb-8">
          UPCOMING MATCHES
        </h2>

        <div className="flex flex-col gap-3">
          {upcoming.map((m) => {
            const dateObj = new Date(m.date);
            const day = dateObj.toLocaleDateString("en-PH", { weekday: "short" });
            const num = dateObj.getDate();
            const month = dateObj.toLocaleDateString("en-PH", { month: "short" });

            return (
              <div
                key={m.id}
                className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-5 py-4 flex items-center gap-4 hover:border-[#3E3E3E] transition-colors"
              >
                {/* Date block */}
                <div className="text-center min-w-[64px]">
                  <div className="text-[10px] text-[#808080] uppercase tracking-wider">{day}</div>
                  <div className="font-head text-2xl font-bold text-[#FF4655] leading-none">{num}</div>
                  <div className="text-[10px] text-[#808080]">{month}</div>
                </div>

                <div className="h-10 w-px bg-[#2E2E2E]" />

                {/* Teams */}
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-head text-base font-semibold uppercase">{m.teamA}</span>
                  <span className="bg-[#232323] text-[#808080] text-xs font-bold px-2 py-0.5 rounded">VS</span>
                  <span className="font-head text-base font-semibold uppercase">{m.teamB}</span>
                </div>

                {/* Meta */}
                <div className="text-right shrink-0">
                  <div>
                    <span className="bg-[#FF4655]/20 text-[#FF4655] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                      {m.round} · {m.game}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#808080] mt-1">{m.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
