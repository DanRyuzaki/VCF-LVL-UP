"use client";
import { useState } from "react";
import { tournaments } from "@/data/tournaments";
import { IconPlus } from "@/components/shared/icons";

const statusStyle = (s: string) => {
  if (s === "ongoing")      return "bg-[#FF4655]/20 text-[#FF4655]";
  if (s === "registration") return "bg-[#00F5D4]/15 text-[#00F5D4]";
  return "";
};

export default function TournamentManagementModule() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
        >
          <IconPlus size={13} /> Create Tournament
        </button>
      </div>

      {showForm && (
        <div className="dash-card p-5 mb-5">
          <div className="dash-section-title">New Tournament</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="dash-label">Tournament Name</label>
              <input type="text" placeholder="e.g. MLBB Cup V" className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Game</label>
              <select className="dash-select"><option>MLBB</option><option>CODM</option></select>
            </div>
            <div>
              <label className="dash-label">Max Teams</label>
              <select className="dash-select"><option>4</option><option>8</option><option>16</option></select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">Save</button>
            <button onClick={() => setShowForm(false)} className="dash-btn-ghost text-xs px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {["Name","Game","Format","Teams","Matches","Status","Actions"].map((h) => (
                <th key={h} className="dash-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tournaments.map((t) => (
              <tr key={t.id} className="dash-tr">
                <td className="dash-td font-semibold">{t.name} S{t.season}</td>
                <td className="dash-td-muted">{t.game}</td>
                <td className="dash-td-muted">{t.format}</td>
                <td className="dash-td">{t.teamsRegistered}/{t.maxTeams}</td>
                <td className="dash-td">{t.matchesPlayed}/{t.totalMatches}</td>
                <td className="dash-td">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${statusStyle(t.status)}`}
                    style={t.status === "completed" ? { backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" } : {}}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="dash-td">
                  <button className="dash-btn-ghost text-xs px-3 py-1 rounded">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
