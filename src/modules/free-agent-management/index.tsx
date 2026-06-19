"use client";

import { useState } from "react";
import { IconSearch } from "@/components/shared/icons";
import { useOrganizerContext } from "@/lib/organizer-context";

export default function FreeAgentManagementModule() {
  const { freeAgents, setFreeAgents } = useOrganizerContext();

  // ── Local form state ──────────────────────────────────────────────────────
  const [newFaName,    setNewFaName]    = useState("");
  const [newFaIgn,     setNewFaIgn]     = useState("");
  const [newFaGame,    setNewFaGame]    = useState("MLBB");
  const [newFaRole,    setNewFaRole]    = useState("Mid Lane");
  const [newFaRank,    setNewFaRank]    = useState("Mythic");
  const [newFaWinRate, setNewFaWinRate] = useState("60%");
  const [newFaKda,     setNewFaKda]     = useState("4.0");
  const [search,       setSearch]       = useState("");

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateFreeAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaName.trim() || !newFaIgn.trim()) return;

    setFreeAgents((prev) => [
      ...prev,
      {
        name: newFaName.trim(),
        ign: newFaIgn.trim(),
        game: newFaGame,
        role: newFaRole,
        rank: newFaRank,
        winRate: newFaWinRate,
        kda: newFaKda,
        history: ["Win", "Win", "Loss", "Win", "Loss"],
      },
    ]);

    setNewFaName("");
    setNewFaIgn("");
  };

  const handleRemove = (ign: string) => {
    setFreeAgents((prev) => prev.filter((p) => p.ign !== ign));
  };

  const filtered = freeAgents.filter(
    (fa) =>
      fa.name.toLowerCase().includes(search.toLowerCase()) ||
      fa.ign.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Add Free Agent Form */}
      <div className="dash-card p-5">
        <div className="dash-section-title">Add Free Agent Player</div>
        <form
          onSubmit={handleCreateFreeAgent}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="dash-label">Player Name</label>
            <input
              value={newFaName}
              onChange={(e) => setNewFaName(e.target.value)}
              placeholder="e.g. Ana Lim"
              className="dash-input"
            />
          </div>
          <div>
            <label className="dash-label">IGN</label>
            <input
              value={newFaIgn}
              onChange={(e) => setNewFaIgn(e.target.value)}
              placeholder="e.g. AnaLim_PH"
              className="dash-input"
            />
          </div>
          <div>
            <label className="dash-label">Game</label>
            <select
              value={newFaGame}
              onChange={(e) => setNewFaGame(e.target.value)}
              className="dash-select"
            >
              <option value="MLBB">MLBB</option>
              <option value="CODM">CODM</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors"
          >
            Create Agent
          </button>
        </form>
      </div>

      {/* Free Agents Table */}
      <div className="dash-card p-4">
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-dim)]">
            <IconSearch size={14} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter free agents..."
            className="dash-input pl-9"
          />
        </div>

        <div className="dash-table-wrap">
          <table className="w-full border-collapse">
            <thead className="dash-thead">
              <tr>
                {["Name", "IGN", "Game", "Role", "Rank", "Actions"].map((h) => (
                  <th key={h} className="dash-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((fa) => (
                <tr key={fa.ign} className="dash-tr">
                  <td className="dash-td font-semibold">{fa.name}</td>
                  <td className="dash-td-muted">{fa.ign}</td>
                  <td className="dash-td">{fa.game}</td>
                  <td className="dash-td">{fa.role}</td>
                  <td className="dash-td font-bold text-purple-300">{fa.rank}</td>
                  <td className="dash-td">
                    <button
                      onClick={() => handleRemove(fa.ign)}
                      className="dash-btn-ghost text-xs px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
