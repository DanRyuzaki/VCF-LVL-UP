"use client";

import { IconSearch } from "@/components/shared/icons";

interface Player {
  name: string;
  ign: string;
  game: string;
  role: string;
  rank: string;
  winRate: string;
  kda: string;
  history: string[];
}

interface FreeAgentManagementModuleProps {
  // Data and setters
  freeAgents: Player[];
  setFreeAgents: React.Dispatch<React.SetStateAction<Player[]>>;

  // Form state for adding new free agent
  newFaName: string;
  setNewFaName: React.Dispatch<React.SetStateAction<string>>;
  newFaIgn: string;
  setNewFaIgn: React.Dispatch<React.SetStateAction<string>>;
  newFaGame: string;
  setNewFaGame: React.Dispatch<React.SetStateAction<string>>;
  newFaRole: string;
  setNewFaRole: React.Dispatch<React.SetStateAction<string>>;
  newFaRank: string;
  setNewFaRank: React.Dispatch<React.SetStateAction<string>>;
  newFaWinRate: string;
  setNewFaWinRate: React.Dispatch<React.SetStateAction<string>>;
  newFaKda: string;
  setNewFaKda: React.Dispatch<React.SetStateAction<string>>;

  // Search state
  freeAgentSearch: string;
  setFreeAgentSearch: React.Dispatch<React.SetStateAction<string>>;

  // Handler for creating free agent
  handleCreateFreeAgent: (e: React.FormEvent) => void;
}

export default function FreeAgentManagementModule({
  freeAgents,
  setFreeAgents,

  newFaName,
  setNewFaName,
  newFaIgn,
  setNewFaIgn,
  newFaGame,
  setNewFaGame,
  newFaRole,
  setNewFaRole,
  newFaRank,
  setNewFaRank,
  newFaWinRate,
  setNewFaWinRate,
  newFaKda,
  setNewFaKda,

  freeAgentSearch,
  setFreeAgentSearch,

  handleCreateFreeAgent,
}: FreeAgentManagementModuleProps) {
  return (
    <div className="space-y-6">
      <div className="dash-card p-5">
        <div className="dash-section-title">Add Free Agent Player</div>
        <form onSubmit={handleCreateFreeAgent} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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

      <div className="dash-card p-4">
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-dim)]">
            <IconSearch size={14} />
          </span>
          <input
            value={freeAgentSearch}
            onChange={(e) => setFreeAgentSearch(e.target.value)}
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
              {freeAgents
                .filter(
                  (fa) =>
                    fa.name.toLowerCase().includes(freeAgentSearch.toLowerCase()) ||
                    fa.ign.toLowerCase().includes(freeAgentSearch.toLowerCase())
                )
                .map((fa) => (
                  <tr key={fa.ign} className="dash-tr">
                    <td className="dash-td font-semibold">{fa.name}</td>
                    <td className="dash-td-muted">{fa.ign}</td>
                    <td className="dash-td">{fa.game}</td>
                    <td className="dash-td">{fa.role}</td>
                    <td className="dash-td font-bold text-purple-300">{fa.rank}</td>
                    <td className="dash-td">
                      <button
                        onClick={() => setFreeAgents((prev) => prev.filter((p) => p.ign !== fa.ign))}
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