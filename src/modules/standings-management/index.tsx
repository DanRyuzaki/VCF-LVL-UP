"use client";

const standingsList = [
  { rank: 1, name: "Team Blaze", w: 5, l: 0, pts: 15, streak: "5W" },
  { rank: 2, name: "Team Frost", w: 4, l: 1, pts: 12, streak: "3W" },
  { rank: 3, name: "Team Storm", w: 2, l: 3, pts: 6,  streak: "2L" },
  { rank: 4, name: "Team Apex",  w: 2, l: 3, pts: 6,  streak: "1W" },
  { rank: 5, name: "Team Forge", w: 1, l: 4, pts: 3,  streak: "2L" },
  { rank: 6, name: "Team Venom", w: 1, l: 4, pts: 3,  streak: "3L" },
];

export default function StandingsManagementModule() {
  return (
    <div className="dash-table-wrap">
      <table className="w-full border-collapse">
        <thead className="dash-thead">
          <tr>
            {["Rank", "Team", "Wins", "Losses", "Points", "Streak"].map((h) => (
              <th key={h} className="dash-th">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standingsList.map((s) => (
            <tr key={s.rank} className="dash-tr">
              <td className="dash-td font-bold">{s.rank}</td>
              <td className="dash-td font-semibold text-[var(--c-text)]">{s.name}</td>
              <td className="dash-td">{s.w}</td>
              <td className="dash-td">{s.l}</td>
              <td className="dash-td font-bold text-[#00F5D4]">{s.pts}</td>
              <td className="dash-td">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    s.streak.includes("W")
                      ? "bg-[#00F5D4]/10 text-[#00F5D4]"
                      : "bg-[#FF4655]/10 text-[#FF4655]"
                  }`}
                >
                  {s.streak}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}