"use client";

const highlights = [
  { label: "Tournament MVP Leader", value: "Marco Reyes" },
  { label: "KDA Leader",            value: "Claire Ong (5.1)" },
  { label: "Average Game Length",   value: "14m 32s" },
];

const leaderboard = [
  { name: "Marco Reyes",  ign: "MarcoRey_MLBB",  kda: "4.8", wr: "65%", rating: "1850" },
  { name: "Claire Ong",   ign: "ClaireOng",       kda: "5.1", wr: "69%", rating: "1920" },
  { name: "Ana Lim",      ign: "AnaLim_PH",       kda: "4.2", wr: "64%", rating: "1780" },
  { name: "Sophia Lopez", ign: "SophL_Support",   kda: "4.5", wr: "58%", rating: "1720" },
];

export default function StatsManagementModule() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {highlights.map((s, i) => (
          <div key={i} className="dash-card p-5">
            <div className="text-[10px] uppercase tracking-wider text-[var(--c-text-muted)]">{s.label}</div>
            <div className="font-head text-2xl font-bold text-[var(--c-text)] mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="dash-card p-5">
        <div className="dash-section-title">Player Leaderboard Stats</div>
        <div className="dash-table-wrap">
          <table className="w-full border-collapse">
            <thead className="dash-thead">
              <tr>
                {["Player", "IGN", "KDA Ratio", "Win Rate", "Skill Rating"].map((h) => (
                  <th key={h} className="dash-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((p, idx) => (
                <tr key={idx} className="dash-tr">
                  <td className="dash-td font-semibold">{p.name}</td>
                  <td className="dash-td-muted">{p.ign}</td>
                  <td className="dash-td font-bold text-purple-300">{p.kda}</td>
                  <td className="dash-td text-[#00F5D4]">{p.wr}</td>
                  <td className="dash-td font-bold text-[var(--c-text)]">{p.rating} MMR</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}