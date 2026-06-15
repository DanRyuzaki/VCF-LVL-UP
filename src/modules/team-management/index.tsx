"use client";
import { useState } from "react";
import { IconPlus, IconEdit } from "@/components/shared/icons";

const teams = [
  { id: "t1", name: "Team Blaze",  game: "MLBB", head: "Marco Reyes",  players: 4, max: 5, status: "active" },
  { id: "t2", name: "Team Storm",  game: "MLBB", head: "Rico Cruz",    players: 5, max: 5, status: "active" },
  { id: "t3", name: "Team Frost",  game: "MLBB", head: "Leo Tan",      players: 5, max: 5, status: "active" },
  { id: "t4", name: "Team Venom",  game: "MLBB", head: "Jake Uy",      players: 3, max: 5, status: "incomplete" },
  { id: "t5", name: "Team Nova",   game: "MLBB", head: "Nico Lim",     players: 5, max: 5, status: "active" },
  { id: "t6", name: "Team Apex",   game: "MLBB", head: "Bea Santos",   players: 5, max: 5, status: "active" },
];

export default function TeamManagementModule() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
        >
          <IconPlus size={13} /> Create Team
        </button>
      </div>

      {showForm && (
        <div className="dash-card p-5 mb-5">
          <div className="dash-section-title">New Team</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([["Team Name","text","e.g. Team Alpha"],["Game","select",""],["Team Head","text","Player name"]] as [string,string,string][]).map(([label, type, placeholder]) => (
              <div key={label}>
                <label className="dash-label">{label}</label>
                {type === "select" ? (
                  <select className="dash-select"><option>MLBB</option><option>CODM</option></select>
                ) : (
                  <input type="text" placeholder={placeholder} className="dash-input" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">Save Team</button>
            <button onClick={() => setShowForm(false)} className="dash-btn-ghost text-xs px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {["Team Name","Game","Team Head","Players","Status","Actions"].map((h) => (
                <th key={h} className="dash-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.id} className="dash-tr">
                <td className="dash-td font-semibold">{t.name}</td>
                <td className="dash-td-muted">{t.game}</td>
                <td className="dash-td">{t.head}</td>
                <td className="dash-td">{t.players}/{t.max}</td>
                <td className="dash-td">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${t.status === "active" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-[#FF4655]/20 text-[#FF4655]"}`}>{t.status}</span>
                </td>
                <td className="dash-td">
                  <button className="flex items-center gap-1 dash-btn-ghost text-xs px-3 py-1 rounded">
                    <IconEdit size={11} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
