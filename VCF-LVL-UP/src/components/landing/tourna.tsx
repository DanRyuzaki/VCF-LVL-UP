import { tournaments } from "@/data/tournaments";
import { Tournament } from "@/types/tournament";

function statusBadge(status: Tournament["status"]) {
  if (status === "ongoing")
    return (
      <span className="inline-block bg-[#FF4655]/20 text-[#FF4655] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
        LIVE
      </span>
    );
  if (status === "registration")
    return (
      <span className="inline-block bg-[#00F5D4]/15 text-[#00F5D4] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
        REGISTRATION
      </span>
    );
  return (
    <span className="inline-block bg-[#232323] text-[#808080] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
      COMPLETED
    </span>
  );
}

function statusColor(status: Tournament["status"]) {
  if (status === "ongoing") return "text-[#00F5D4]";
  if (status === "registration") return "text-[#00F5D4]";
  return "text-[#808080]";
}

export default function TournaSection() {
  return (
    <section id="tournaments" className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] uppercase tracking-[2px] text-[#FF4655] mb-2">Active Events</div>
        <h2 className="font-head text-3xl font-bold uppercase tracking-wide mb-8">
          TOURNAMENT OVERVIEW
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tournaments.map((t) => (
            <div
              key={t.id}
              className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-5 hover:border-[#3E3E3E] transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                {statusBadge(t.status)}
                <span className="text-[11px] text-[#808080]">Season {t.season}</span>
              </div>

              <div className="font-head text-lg font-bold uppercase tracking-wide mb-1">
                {t.name}
              </div>
              <div className="text-[#B8B8B8] text-xs mb-4">
                {t.game === "MLBB" ? "Mobile Legends: Bang Bang" : "Call of Duty: Mobile"} ·{" "}
                {t.format}
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-xs text-[#808080]">
                <div>
                  Teams:{" "}
                  <span className="text-white">
                    {t.teamsRegistered}/{t.maxTeams}
                  </span>
                </div>
                <div>
                  Matches:{" "}
                  <span className="text-white">
                    {t.matchesPlayed}/{t.totalMatches}
                  </span>
                </div>
                <div>
                  Status:{" "}
                  <span className={statusColor(t.status)}>
                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </span>
                </div>
                <div>
                  Format: <span className="text-white">Single Elim</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
