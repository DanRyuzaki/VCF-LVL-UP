"use client";
import StatCard from "@/components/shared/stat-card";
import { tournaments } from "@/data/tournaments";

function statusStyle(status: string) {
  if (status === "ongoing")      return { className: "bg-[#FF4655]/20 text-[#FF4655]",  style: {} };
  if (status === "registration") return { className: "bg-[#00F5D4]/15 text-[#00F5D4]",  style: {} };
  return { className: "text-[#808080]", style: { backgroundColor: "var(--c-surface3)" } };
}

export default function TournamentMonitorModule() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value="48" label="Total Players"   accent="teal" />
        <StatCard value="8"  label="Total Teams" />
        <StatCard value="3"  label="Tournaments"     accent="red" />
        <StatCard value="9"  label="Matches Done"    accent="purple" />
      </div>

      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {["Tournament", "Game", "Teams", "Matches Played", "Status"].map((h) => (
                <th key={h} className="dash-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tournaments.map((t) => {
              const { className, style } = statusStyle(t.status);
              return (
                <tr key={t.id} className="dash-tr">
                  <td className="dash-td font-semibold">{t.name} S{t.season}</td>
                  <td className="dash-td-muted">{t.game}</td>
                  <td className="dash-td">{t.teamsRegistered}/{t.maxTeams}</td>
                  <td className="dash-td">{t.matchesPlayed}/{t.totalMatches}</td>
                  <td className="dash-td">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${className}`}
                      style={style}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}