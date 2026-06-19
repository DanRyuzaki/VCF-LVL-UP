"use client";

import { useState, useMemo } from "react";
import { IconX } from "@/components/shared/icons";
import { useOrganizerContext, fsUpdatePlayer, fsUpdateTeam, type Player } from "@/lib/organizer-context";

export default function DraftManagementModule() {
  const { freeAgents, draftedPlayers, teams, playerDocIds, loading } = useOrganizerContext();

  // ── Local UI state ────────────────────────────────────────────────────────
  const [draftSearch,   setDraftSearch]   = useState("");
  const [draftGame,     setDraftGame]     = useState("All");
  const [draftRole,     setDraftRole]     = useState("All");
  const [draftRank,     setDraftRank]     = useState("All");
  const [hoveredPlayer, setHoveredPlayer] = useState<Player | null>(null);
  const [actionError,   setActionError]   = useState<string | null>(null);

  // ── Derived filter options ────────────────────────────────────────────────

  const roleOptions = useMemo(
    () =>
      draftGame === "CODM"
        ? ["All Roles", "Slayers", "Anchors", "Supports", "Objective"]
        : ["All Roles", "XP Lane", "Gold Lane", "Mid Lane", "Roamer", "Jungler"],
    [draftGame]
  );

  const rankOptions = useMemo(
    () =>
      draftGame === "CODM"
        ? ["All Ranks", "Rookie", "Veteran", "Elite", "Pro", "Master", "Grandmaster", "Legendary"]
        : ["All Ranks", "Mythic", "Mythical Glory", "Legend"],
    [draftGame]
  );

  // ── Filtered lists ────────────────────────────────────────────────────────

  const applyFilters = (list: Player[]) =>
    list.filter((p) => {
      const q = draftSearch.toLowerCase();
      return (
        (p.name.toLowerCase().includes(q) || p.ign.toLowerCase().includes(q)) &&
        (draftGame === "All" || p.game === draftGame) &&
        (draftRole === "All" || p.role === draftRole) &&
        (draftRank === "All" || p.rank === draftRank)
      );
    });

  const filteredUnpicked = useMemo(() => applyFilters(freeAgents),    [freeAgents, draftSearch, draftGame, draftRole, draftRank]);
  const filteredDrafted  = useMemo(() => applyFilters(draftedPlayers), [draftedPlayers, draftSearch, draftGame, draftRole, draftRank]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDraft = async (player: Player, targetTeamName: string) => {
    const playerDocId = playerDocIds[player.ign];
    if (!playerDocId) return;

    setActionError(null);
    try {
      // Mark player as drafted with team assignment
      await fsUpdatePlayer(playerDocId, { drafted: true, team: targetTeamName });

      // Add player to team's players array
      const targetTeam = teams.find((t) => t.name === targetTeamName);
      if (targetTeam) {
        await fsUpdateTeam(targetTeam.id, {
          players: [...targetTeam.players, player.name],
        });
      }
    } catch (err) {
      console.error("Failed to draft player:", err);
      setActionError("Failed to draft player. Please try again.");
    }
  };

  const handleUndraft = async (player: Player) => {
    const playerDocId = playerDocIds[player.ign];
    if (!playerDocId) return;

    setActionError(null);
    try {
      // Mark player as free agent again
      await fsUpdatePlayer(playerDocId, { drafted: false, team: undefined });

      // Remove player from their team's players array
      if (player.team) {
        const targetTeam = teams.find((t) => t.name === player.team);
        if (targetTeam) {
          await fsUpdateTeam(targetTeam.id, {
            players: targetTeam.players.filter((name) => name !== player.name),
          });
        }
      }

      if (hoveredPlayer?.ign === player.ign) setHoveredPlayer(null);
    } catch (err) {
      console.error("Failed to undraft player:", err);
      setActionError("Failed to remove player from draft. Please try again.");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="text-center py-12 text-xs text-[var(--c-text-muted)]">Loading draft data…</div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        {/* Error banner */}
        {actionError && (
          <div className="text-xs text-[#FF4655] bg-[#FF4655]/10 border border-[#FF4655]/30 px-3 py-2 rounded-lg">
            {actionError}
          </div>
        )}

        {/* Filters */}
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
              {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={draftRank}
              onChange={(e) => setDraftRank(e.target.value)}
              className="dash-select text-xs"
            >
              {rankOptions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Player columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Available pool */}
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
                    onChange={(e) => { if (e.target.value) handleDraft(fa, e.target.value); }}
                    className="dash-select w-24 text-[10px] py-1 px-1.5"
                    defaultValue=""
                  >
                    <option value="" disabled>Draft to…</option>
                    {teams.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
              ))}
              {filteredUnpicked.length === 0 && (
                <div className="text-center py-8 text-xs text-[var(--c-text-muted)]">No players available.</div>
              )}
            </div>
          </div>

          {/* Drafted players */}
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
                      onClick={(e) => { e.stopPropagation(); handleUndraft(dp); }}
                      className="flex items-center gap-1 text-[#FF4655] text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg border border-[#FF4655]/20 hover:bg-[#FF4655]/10 transition-colors"
                    >
                      <IconX size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}
              {filteredDrafted.length === 0 && (
                <div className="text-center py-8 text-xs text-[var(--c-text-muted)]">No drafted players yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats card */}
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
                  Player Role &amp; Rank
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
                  {hoveredPlayer.history.map((h, idx) => (
                    <span
                      key={idx}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        h === "Win"
                          ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                          : "bg-[#FF4655]/20 text-[#FF4655]"
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
