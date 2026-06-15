"use client";
import { useState } from "react";
import { tournaments } from "@/data/tournaments";
import { IconPlus } from "@/components/shared/icons";

const statusStyle = (s: string) => {
  if (s === "ongoing")      return "bg-[#FF4655]/20 text-[#FF4655]";
  if (s === "registration") return "bg-[#00F5D4]/15 text-[#00F5D4]";
  return "bg-[#232323] text-[#808080]";
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
        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-5 mb-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#B8B8B8] mb-4">New Tournament</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">Tournament Name</label>
              <input type="text" placeholder="e.g. MLBB Cup V" className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white placeholder-[#808080] outline-none focus:border-[#FF4655]" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">Game</label>
              <select className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FF4655]">
                <option>MLBB</option><option>CODM</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">Max Teams</label>
              <select className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FF4655]">
                <option>4</option><option>8</option><option>16</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">Save</button>
            <button onClick={() => setShowForm(false)} className="border border-[#2E2E2E] text-[#808080] hover:text-white text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition-all">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#232323]">
              {["Name","Game","Format","Teams","Matches","Status","Actions"].map((h) => (
                <th key={h} className="text-left text-[10px] uppercase tracking-[1.5px] text-[#808080] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tournaments.map((t) => (
              <tr key={t.id} className="border-t border-[#2E2E2E] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-sm font-semibold">{t.name} S{t.season}</td>
                <td className="px-4 py-3 text-xs text-[#B8B8B8]">{t.game}</td>
                <td className="px-4 py-3 text-xs text-[#B8B8B8]">{t.format}</td>
                <td className="px-4 py-3 text-sm">{t.teamsRegistered}/{t.maxTeams}</td>
                <td className="px-4 py-3 text-sm">{t.matchesPlayed}/{t.totalMatches}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${statusStyle(t.status)}`}>{t.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-xs border border-[#2E2E2E] text-[#808080] hover:text-white hover:border-[#808080] px-3 py-1 rounded transition-all">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
