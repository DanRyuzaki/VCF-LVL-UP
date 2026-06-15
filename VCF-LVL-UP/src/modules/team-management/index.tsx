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
        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-5 mb-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#B8B8B8] mb-4">New Team</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[["Team Name","text","e.g. Team Alpha"],["Game","select",""],["Team Head","text","Player name"]].map(([label, type, placeholder]) => (
              <div key={label as string}>
                <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">{label as string}</label>
                {type === "select" ? (
                  <select className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FF4655]">
                    <option>MLBB</option><option>CODM</option>
                  </select>
                ) : (
                  <input type="text" placeholder={placeholder as string} className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white placeholder-[#808080] outline-none focus:border-[#FF4655]" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">Save Team</button>
            <button onClick={() => setShowForm(false)} className="border border-[#2E2E2E] text-[#808080] hover:text-white text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition-all">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#232323]">
              {["Team Name","Game","Team Head","Players","Status","Actions"].map((h) => (
                <th key={h} className="text-left text-[10px] uppercase tracking-[1.5px] text-[#808080] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.id} className="border-t border-[#2E2E2E] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-sm font-semibold">{t.name}</td>
                <td className="px-4 py-3 text-xs text-[#B8B8B8]">{t.game}</td>
                <td className="px-4 py-3 text-sm">{t.head}</td>
                <td className="px-4 py-3 text-sm">{t.players}/{t.max}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${t.status === "active" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-[#FF4655]/20 text-[#FF4655]"}`}>{t.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button className="flex items-center gap-1 text-xs border border-[#2E2E2E] text-[#808080] hover:text-white hover:border-[#808080] px-3 py-1 rounded transition-all">
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
