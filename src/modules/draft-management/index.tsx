"use client";
import { IconX } from "@/components/shared/icons";
import { useState, useMemo } from "react";

interface Player {
  name: string;
  ign: string;
  game: string;
  role: string;
  rank: string;
  winRate: string;
  kda: string;
  history: string[];
  team?: string;
}

interface Team {
  id: string;
  name: string;
  game: string;
  head: string;
  players: string[];
  status: string;
}

interface DraftManagementModuleProps {
  // Data and setters
  freeAgents: Player[];
  setFreeAgents: React.Dispatch<React.SetStateAction<Player[]>>;
  draftedPlayers: Player[];
  setDraftedPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
}

export default function DraftManagementModule({
  freeAgents,
  setFreeAgents,
  draftedPlayers,
  setDraftedPlayers,
  teams,
  setTeams,
}: DraftManagementModuleProps) {
  // UI state
  const [draftSearch, setDraftSearch] = useState("");
  const [draftGame, setDraftGame] = useState("All");
  const [draftRole, setDraftRole] = useState("All");
  const [draftRank, setDraftRank] = useState("All");
  const [hoveredPlayer, setHoveredPlayer] = useState<Player | null>(null);

  // Derived values
  const roleOptions = useMemo(() => {
    return draftGame === "CODM"
      ? ["All Roles", "Slayers", "Anchors", "Supports", "Objective"]
      : ["All Roles", "XP Lane", "Gold Lane", "Mid Lane", "Roamer", "Jungler"];
  }, [draftGame]);

  const rankOptions = useMemo(() => {
    return draftGame === "CODM"
      ? ["All Ranks", "Rookie", "Veteran", "Elite", "Pro", "Master", "Grandmaster", "Legendary"]
      : ["All Ranks", "Mythic", "Mythical Glory", "Legend"];
  }, [draftGame]);

  // Filtered lists
  const filteredUnpicked = useMemo(() => {
    return freeAgents.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(draftSearch.toLowerCase()) ||
        p.ign.toLowerCase().includes(draftSearch.toLowerCase());
      const matchesGame = draftGame === "All" || p.game === draftGame;
      const matchesRole = draftRole === "All" || p.role === draftRole;
      const matchesRank = draftRank === "All" || p.rank === draftRank;
      return matchesSearch && matchesGame && matchesRole && matchesRank;
    });
  }, [freeAgents, draftSearch, draftGame, draftRole, draftRank]);

  const filteredDrafted = useMemo(() => {
    return draftedPlayers.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(draftSearch.toLowerCase()) ||
        p.ign.toLowerCase().includes(draftSearch.toLowerCase());
      const matchesGame = draftGame === "All" || p.game === draftGame;
      const matchesRole = draftRole === "All" || p.role === draftRole;
      const matchesRank = draftRank === "All" || p.rank === draftRank;
      return matchesSearch && matchesGame && matchesRole && matchesRank;
    });
  }, [draftedPlayers, draftSearch, draftGame, draftRole, draftRank]);

  const handleDraftAction = (player: Player, targetTeamName: string) => {
    setFreeAgents((prev) => prev.filter((p) => p.ign !== player.ign));
    setDraftedPlayers((prev) => [...prev, { ...player, team: targetTeamName }]);
    setTeams((prev) =>
      prev.map((t) => {
        if (t.name === targetTeamName) {
          return {
            ...t,
            players: [...t.players, player.name],
          };
        }
        return t;
      })
    );
  };

  const handleRemoveDrafted = (player: Player) => {
    setDraftedPlayers((prev) => prev.filter((p) => p.ign !== player.ign));
    setFreeAgents((prev) => [...prev, { ...player, team: undefined }]);
    setTeams((prev) =>
      prev.map((t) => {
        if (t.name === player.team) {
          return {
            ...t,
            players: t.players.filter((name) => name !== player.name),
          };
        }
        return t;
      })
    );
    if (hoveredPlayer?.ign === player.ign) {
      setHoveredPlayer(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="dash-card p-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              placeholder="Search player name or IGN..."
              className="dash-input"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={draftGame}
              onChange={(e) => {
                setDraftGame(e.target.value);
                setDraftRole("All");
                setDraftRank("All");
              }}
              className="dash-select text-xs"
            >
              <option value="All">All Games</option>
              <option value="MLBB">MLBB</option>
              <option value="CODM">CODM</option>
            </select>
            <select
              value={draftRole}
              onChange={(e) => setDraftRole(e.target.value)}
              className="dash-select text-xs"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <select
              value={draftRank}
              onChange={(e) => setDraftRank(e.target.value)}
              className="dash-select text-xs"
            >
              {rankOptions.map((rank) => (
                <option key={rank} value={rank}>{rank}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="dash-card p-4 flex flex-col h-[400px]">
            <div className="dash-section-title pb-2 border-b border-[var(--c-border)]">
              Available Player Pool ({filteredUnpicked.length})
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5 my-3 pr-1">
              {filteredUnpicked.map((fa) => (
                <div
                  key={fa.ign}
                  onMouseEnter={() => setHoveredPlayer(fa)}
                  onClick={() => setHoveredPlayer(fa)}
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] hover:border-[#8B5CF6] transition-colors cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-[var(--c-text)]">{fa.name}</div>
                    <div className="text-[10px] text-[var(--c-text-muted)]">
                      {fa.ign} · {fa.role} · {fa.rank}
                    </div>
                  </div>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleDraftAction(fa, e.target.value);
                      }
                    }}
                    className="dash-select w-24 text-[10px] py-1 px-1.5"
                    defaultValue=""
                  >
                    <option value="" disabled>Draft to...</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-card p-4 flex flex-col h-[400px]">
            <div className="dash-section-title pb-2 border-b border-[var(--c-border)]">
              Drafted Players ({filteredDrafted.length})
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5 my-3 pr-1">
              {filteredDrafted.map((dp) => (
                <div
                  key={dp.ign}
                  onMouseEnter={() => setHoveredPlayer(dp)}
                  onClick={() => setHoveredPlayer(dp)}
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] hover:border-[#00F5D4] transition-colors cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-[var(--c-text)]">{dp.name}</div>
                    <div className="text-[10px] text-[var(--c-text-muted)]">
                      {dp.ign} · {dp.role} · {dp.rank}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-[#00F5D4]/10 text-[#00F5D4] px-2 py-0.5 rounded">
                      {dp.team}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveDrafted(dp);
                      }}
                      className="flex items-center gap-1 text-[#FF4655] text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg border border-[#FF4655]/20 hover:bg-[#FF4655]/10 transition-colors"
                    >
                      <IconX size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="dash-card p-5 sticky top-5">
          <div className="dash-section-title pb-2 border-b border-[var(--c-border)]">
            Player Statistics Card
          </div>
          {hoveredPlayer ? (
            <div className="space-y-4 mt-4">
              <div className="text-center pb-3 border-b border-[var(--c-border)]">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 text-[#8B5CF6] border border-[#8B5CF6] flex items-center justify-center font-bold text-lg mx-auto mb-2">
                  {hoveredPlayer.name[0]}
                </div>
                <div className="text-sm font-bold text-[var(--c-text)]">{hoveredPlayer.name}</div>
                <div className="text-xs text-[var(--c-text-muted)]">IGN: {hoveredPlayer.ign}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded bg-[var(--c-surface3)] border border-[var(--c-border)]">
                  <div className="text-[10px] text-[var(--c-text-muted)]">Win Rate</div>
                  <div className="text-sm font-bold text-[#00F5D4] mt-0.5">{hoveredPlayer.winRate}</div>
                </div>
                <div className="p-2.5 rounded bg-[var(--c-surface3)] border border-[var(--c-border)]">
                  <div className="text-[10px] text-[var(--c-text-muted)]">KDA Ratio</div>
                  <div className="text-sm font-bold text-purple-400 mt-0.5">{hoveredPlayer.kda}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--c-text-muted)] mb-1.5 font-bold">
                  Player Role & rank
                </div>
                <div className="text-xs text-[var(--c-text)]">
                  Role: <span className="font-semibold text-purple-300">{hoveredPlayer.role}</span>
                </div>
                <div className="text-xs text-[var(--c-text)] mt-1">
                  Rank: <span className="font-semibold text-purple-300">{hoveredPlayer.rank}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--c-text-muted)] mb-1.5 font-bold">
                  Recent History
                </div>
                <div className="flex gap-1">
                  {hoveredPlayer.history.map((h, index) => (
                    <span
                      key={index}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        h === "Win" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-[#FF4655]/20 text-[#FF4655]"
                      }`}
                    >
                      {h[0]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[var(--c-text-muted)] text-center py-12">
              Hover or select a player to view stats card details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}