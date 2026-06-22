"use client";

import { useState, useMemo } from "react";
import { IconX } from "@/components/shared/icons";
import {
  useOrganizerContext,
  fsAddTeam,
  fsUpdateTeam,
  fsDeleteTeam,
  fsUpdatePlayer,
  fsUpdateUserTeamId,
  type Team,
  type Player,
} from "@/lib/organizer-context";

// ─── helpers ─────────────────────────────────────────────────────────────────

function playerStatus(team: Team, playerName: string) {
  if (team.head === playerName) return "leader";
  if (team.pendingPlayers?.includes(playerName)) return "pending";
  return "member";
}

// ─── Team & Draft Management Module ──────────────────────────────────────────

export default function TeamDraftManagementModule() {
  const { teams, freeAgents, draftedPlayers, allPlayers, playerDocIds, loading } = useOrganizerContext();

  // ── create team state ─────────────────────────────────────────────────────
  const [newTeamName,    setNewTeamName]    = useState("");
  const [newTeamGame,    setNewTeamGame]    = useState("MLBB");
  const [headSearch,     setHeadSearch]     = useState("");
  const [headCandidate,  setHeadCandidate]  = useState<Player | null>(null);
  const [headDropOpen,   setHeadDropOpen]   = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [saveError,      setSaveError]      = useState<string | null>(null);

  // ── draft player dialog ───────────────────────────────────────────────────
  const [draftTeam,      setDraftTeam]      = useState<Team | null>(null);
  const [draftSearch,    setDraftSearch]    = useState("");
  const [draftError,     setDraftError]     = useState<string | null>(null);
  const [draftSaving,    setDraftSaving]    = useState(false);

  // ── view team dialog ──────────────────────────────────────────────────────
  const [viewTeam,       setViewTeam]       = useState<Team | null>(null);

  // ── delete team ───────────────────────────────────────────────────────────
  const [deleteTarget,   setDeleteTarget]   = useState<Team | null>(null);
  const [deleting,       setDeleting]       = useState(false);
  const [deleteError,    setDeleteError]    = useState<string | null>(null);

  // ── Derived: free agents searchable by name/email/ign ────────────────────

  const filteredHeadCandidates = useMemo(() => {
    if (!headSearch.trim()) return [];
    const q = headSearch.toLowerCase();
    return freeAgents.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.ign.toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q)
    );
  }, [freeAgents, headSearch]);

  const filteredDraftCandidates = useMemo(() => {
    if (!draftTeam) return [];
    const q = draftSearch.toLowerCase();
    // Only free agents for the same game as the team
    return freeAgents.filter(
      (p) =>
        p.game === draftTeam.game &&
        (p.name.toLowerCase().includes(q) ||
          p.ign.toLowerCase().includes(q) ||
          (p.email ?? "").toLowerCase().includes(q))
    );
  }, [freeAgents, draftTeam, draftSearch]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !headCandidate) return;

    // Block duplicate team names (case-insensitive)
    const duplicate = teams.some(
      (t) => t.name.toLowerCase() === newTeamName.trim().toLowerCase()
    );
    if (duplicate) {
      setSaveError(`A team named "${newTeamName.trim()}" already exists. Please choose a different name.`);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      // Mark the head as drafted
      const headDocId = playerDocIds[headCandidate.ign];
      if (!headDocId) throw new Error("Player doc id not found");

      const teamId = await fsAddTeam({
        name: newTeamName.trim(),
        game: newTeamGame,
        head: headCandidate.name,
        headUid: headDocId,
        players: [headCandidate.name],
        pendingPlayers: [],
        status: "incomplete",
      });

      await fsUpdatePlayer(headDocId, {
        drafted: true,
        team: newTeamName.trim(),
      });

      // Sync teamId AND gamerType:"team_leader" onto the leader's user account.
      // Without this, the leader's own "My Team" page never reflects the team
      // they were just made head of, and the communication module won't grant
      // them access to the organizer chat channel.
      if (headCandidate.email) {
        await fsUpdateUserTeamId(headCandidate.email, teamId, true);
      }

      setNewTeamName("");
      setHeadSearch("");
      setHeadCandidate(null);
    } catch (err) {
      console.error("Failed to create team:", err);
      setSaveError("Failed to create team. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Draft a free agent into a team as a PENDING member
  const handleDraftPlayer = async (player: Player) => {
    if (!draftTeam) return;

    // Enforce 5-player roster cap — confirmed + pending combined cannot exceed 5
    const confirmedCount = draftTeam.players.length;
    const pendingCount = (draftTeam.pendingPlayers ?? []).length;
    if (confirmedCount + pendingCount >= 5) {
      setDraftError("This team already has 5 players (confirmed + pending). Remove or reject a player before drafting another.");
      return;
    }

    setDraftSaving(true);
    setDraftError(null);
    try {
      const playerDocId = playerDocIds[player.ign];
      if (!playerDocId) throw new Error("Player doc not found");

      // Add to pending list on team; player gets pendingTeam set but NOT drafted=true yet
      await fsUpdateTeam(draftTeam.id, {
        pendingPlayers: [...(draftTeam.pendingPlayers ?? []), player.name],
      });
      await fsUpdatePlayer(playerDocId, {
        pendingTeam: draftTeam.name,
      });

      setDraftTeam(null);
      setDraftSearch("");
    } catch (err) {
      console.error("Failed to draft player:", err);
      setDraftError("Failed to add player. Please try again.");
    } finally {
      setDraftSaving(false);
    }
  };

  // NOTE: accepting/rejecting pending players is now the team leader's
  // responsibility, handled in src/modules/team-viewer (My Team, gamer
  // dashboard). The organizer's team view is read-only for pending status —
  // see the "Awaiting Leader" badge below — by design, not an oversight.

  // Remove a drafted member (not the leader) from the team
  const handleRemoveMember = async (team: Team, playerName: string) => {
    if (playerName === team.head) return; // can't remove leader this way
    const player = draftedPlayers.find((p) => p.name === playerName);
    const playerDocId = player ? playerDocIds[player.ign] : null;
    const newPlayers = team.players.filter((n) => n !== playerName);
    await fsUpdateTeam(team.id, {
      players: newPlayers,
      status: newPlayers.length >= 5 ? "eligible" : "incomplete",
    });
    if (playerDocId) {
      await fsUpdatePlayer(playerDocId, { drafted: false, team: undefined });
      // Clear teamId and revert gamerType to free_agent on the gamer's user account
      if (player?.email) await fsUpdateUserTeamId(player.email, null, false);
    }
    if (viewTeam?.id === team.id) {
      setViewTeam({ ...team, players: newPlayers, status: newPlayers.length >= 5 ? "eligible" : "incomplete" });
    }
  };

  const handleDeleteTeam = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      // Free all drafted players on this team
      for (const playerName of deleteTarget.players) {
        const player = draftedPlayers.find((p) => p.name === playerName);
        const docId = player ? playerDocIds[player.ign] : null;
        if (docId) await fsUpdatePlayer(docId, { drafted: false, team: undefined });
        // Clear teamId and revert gamerType (leader becomes free_agent again)
        if (player?.email) await fsUpdateUserTeamId(player.email, null, false);
      }
      for (const playerName of (deleteTarget.pendingPlayers ?? [])) {
        const player = allPlayers.find((p) => p.name === playerName);
        const docId = player ? playerDocIds[player.ign] : null;
        if (docId) await fsUpdatePlayer(docId, { pendingTeam: undefined });
      }
      await fsDeleteTeam(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete team:", err);
      setDeleteError("Failed to delete team. Please check your connection and try again.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const statusColor = (s: string) =>
    s === "eligible"
      ? "bg-[#00F5D4]/15 text-[#00F5D4]"
      : "bg-[#FF4655]/20 text-[#FF4655]";

  return (
    <div className="space-y-6">

      {/* ── Create Team ── */}
      <div className="dash-card p-5">
        <div className="dash-section-title">Create Team & Assign Leader</div>
        <p className="text-xs text-[var(--c-text-muted)] mb-4">
          Team leaders must be existing <strong>free agent</strong> gamer accounts. Search by name, IGN, or email.
        </p>
        {saveError && (
          <div className="mb-3 text-xs text-[#FF4655] bg-[#FF4655]/10 border border-[#FF4655]/30 px-3 py-2 rounded-lg">
            {saveError}
          </div>
        )}
        <form onSubmit={handleCreateTeam} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="dash-label">Team Name</label>
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="e.g. Team Venom"
              className="dash-input"
              disabled={saving}
            />
          </div>
          <div>
            <label className="dash-label">Game</label>
            <select
              value={newTeamGame}
              onChange={(e) => setNewTeamGame(e.target.value)}
              className="dash-select"
              disabled={saving}
            >
              <option value="MLBB">MLBB</option>
              <option value="CODM">CODM</option>
            </select>
          </div>
          <div className="relative">
            <label className="dash-label">Team Leader (Free Agent)</label>
            {headCandidate ? (
              <div className="flex items-center gap-2 dash-input">
                <span className="flex-1 text-sm font-semibold text-[var(--c-text)]">
                  {headCandidate.name} <span className="text-[var(--c-text-muted)]">· {headCandidate.ign}</span>
                </span>
                <button
                  type="button"
                  onClick={() => { setHeadCandidate(null); setHeadSearch(""); }}
                  className="text-[var(--c-text-dim)] hover:text-[#FF4655]"
                >
                  <IconX size={14} />
                </button>
              </div>
            ) : (
              <>
                <input
                  value={headSearch}
                  onChange={(e) => { setHeadSearch(e.target.value); setHeadDropOpen(true); }}
                  onFocus={() => setHeadDropOpen(true)}
                  onBlur={() => setTimeout(() => setHeadDropOpen(false), 150)}
                  placeholder="Search free agent…"
                  className="dash-input"
                  disabled={saving}
                />
                {headDropOpen && filteredHeadCandidates.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {filteredHeadCandidates.map((p) => (
                      <button
                        key={p.ign}
                        type="button"
                        onMouseDown={() => { setHeadCandidate(p); setHeadSearch(p.name); setHeadDropOpen(false); }}
                        className="w-full text-left px-3 py-2.5 hover:bg-[var(--c-surface3)] transition-colors"
                      >
                        <div className="text-xs font-semibold text-[var(--c-text)]">{p.name}</div>
                        <div className="text-[10px] text-[var(--c-text-muted)]">{p.ign} · {p.game} · {p.email}</div>
                      </button>
                    ))}
                  </div>
                )}
                {headDropOpen && headSearch.length > 0 && filteredHeadCandidates.length === 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg px-3 py-3 text-xs text-[var(--c-text-muted)]">
                    No free agents match "{headSearch}"
                  </div>
                )}
              </>
            )}
          </div>
          <button
            type="submit"
            disabled={saving || !newTeamName.trim() || !headCandidate}
            className="bg-[#FF4655] hover:bg-[#E53E4D] disabled:opacity-40 text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors"
          >
            {saving ? "Creating…" : "Create Team"}
          </button>
        </form>
      </div>

      {/* ── Teams Table ── */}
      <div className="dash-table-wrap">
        {loading ? (
          <div className="text-center py-8 text-xs text-[var(--c-text-muted)]">Loading teams…</div>
        ) : teams.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--c-text-muted)]">No teams yet. Create one above.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="dash-thead">
              <tr>
                {["Team Name", "Game", "Leader", "Players", "Pending", "Status", "Actions"].map((h) => (
                  <th key={h} className="dash-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id} className="dash-tr">
                  <td
                    onClick={() => setViewTeam(t)}
                    className="dash-td font-semibold cursor-pointer text-[#00F5D4] hover:underline"
                  >
                    {t.name}
                  </td>
                  <td className="dash-td-muted">{t.game}</td>
                  <td className="dash-td font-semibold">{t.head}</td>
                  <td className="dash-td">{t.players.length}/5</td>
                  <td className="dash-td">{(t.pendingPlayers ?? []).length}</td>
                  <td className="dash-td">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${statusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="dash-td">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewTeam(t)}
                        className="dash-btn-ghost text-xs px-2 py-1 rounded"
                      >
                        View
                      </button>
                      <button
                        onClick={() => { setDraftTeam(t); setDraftSearch(""); setDraftError(null); }}
                        className="bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#8B5CF6] border border-[#8B5CF6]/30 text-xs font-semibold px-2 py-1 rounded transition-colors"
                      >
                        Draft Player
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        className="bg-[#FF4655]/10 hover:bg-[#FF4655]/20 text-[#FF4655] text-xs font-semibold px-2 py-1 rounded border border-[#FF4655]/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── View Team Dialog ── */}
      {viewTeam && (
        <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", backgroundColor:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)" }}>
          <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setViewTeam(null)} className="absolute right-4 top-4 text-[var(--c-text-dim)] hover:text-[var(--c-text)]">
              <IconX size={16} />
            </button>
            <h3 className="font-head text-xl font-bold text-[var(--c-text)] mb-1 uppercase">{viewTeam.name}</h3>
            <div className="text-xs text-[var(--c-text-muted)] mb-4">{viewTeam.game} · Leader: <span className="text-[#FACC15] font-semibold">{viewTeam.head}</span></div>

            <div className="mb-4">
              <div className="dash-section-title mb-2">Roster ({viewTeam.players.length}/5)</div>
              <div className="space-y-1">
                {viewTeam.players.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--c-border)] last:border-0">
                    <div>
                      <span className="text-xs font-semibold text-[var(--c-text)]">{p}</span>
                      {p === viewTeam.head && (
                        <span className="ml-2 text-[9px] font-bold uppercase tracking-widest bg-[#FACC15]/15 text-[#FACC15] px-1.5 py-0.5 rounded">Leader</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(viewTeam.pendingPlayers ?? []).length > 0 && (
              <div className="mb-4">
                <div className="dash-section-title mb-2">Pending Approval ({(viewTeam.pendingPlayers ?? []).length})</div>
                <p className="text-xs mb-2" style={{ color: "var(--c-text-muted)" }}>
                  Waiting on {viewTeam.head} (team leader) to accept or reject each draft.
                </p>
                <div className="space-y-1">
                  {(viewTeam.pendingPlayers ?? []).map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--c-border)] last:border-0">
                      <span className="text-xs text-[var(--c-text)]">{p}</span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                        style={{ backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" }}
                      >
                        Awaiting Leader
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setDraftTeam(viewTeam); setViewTeam(null); setDraftSearch(""); setDraftError(null); }}
                className="bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#8B5CF6] border border-[#8B5CF6]/30 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                Draft a Player
              </button>
              <button onClick={() => setViewTeam(null)} className="dash-btn-ghost text-xs px-4 py-2 rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Draft Player Dialog ── */}
      {draftTeam && (
        <div style={{ position:"fixed", inset:0, zIndex:110, display:"flex", alignItems:"center", justifyContent:"center", backgroundColor:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}>
          <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl w-full max-w-md p-6 relative">
            <button onClick={() => setDraftTeam(null)} className="absolute right-4 top-4 text-[var(--c-text-dim)] hover:text-[var(--c-text)]">
              <IconX size={16} />
            </button>
            <h3 className="font-head text-lg font-bold text-[var(--c-text)] mb-1 uppercase">Draft a Player</h3>
            <p className="text-xs text-[var(--c-text-muted)] mb-4">
              Adding to <span className="font-semibold text-[#8B5CF6]">{draftTeam.name}</span>. Only free agents for <strong>{draftTeam.game}</strong> are shown. Drafted players are pending until the team leader accepts them.
            </p>
            {/* Roster cap indicator */}
            {(() => {
              const total = draftTeam.players.length + (draftTeam.pendingPlayers ?? []).length;
              const isFull = total >= 5;
              return (
                <div className={`mb-3 text-xs px-3 py-2 rounded-lg border ${isFull ? "bg-[#FF4655]/10 border-[#FF4655]/30 text-[#FF4655]" : "bg-[var(--c-surface2)] border-[var(--c-border)] text-[var(--c-text-muted)]"}`}>
                  Roster: <strong>{total}/5</strong> {isFull ? "— Team is full. Remove or reject a player first." : `— ${5 - total} slot(s) remaining`}
                </div>
              );
            })()}
            {draftError && (
              <div className="mb-3 text-xs text-[#FF4655] bg-[#FF4655]/10 border border-[#FF4655]/30 px-3 py-2 rounded-lg">
                {draftError}
              </div>
            )}
            <input
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              placeholder="Search by name, IGN, or email…"
              className="dash-input mb-3"
            />
            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {filteredDraftCandidates.length === 0 ? (
                <div className="text-xs text-[var(--c-text-muted)] text-center py-6">
                  {draftSearch ? `No free agents matching "${draftSearch}"` : "No free agents available for this game."}
                </div>
              ) : (
                filteredDraftCandidates.map((p) => {
                  const isFull = draftTeam.players.length + (draftTeam.pendingPlayers ?? []).length >= 5;
                  return (
                    <div key={p.ign} className="flex items-center justify-between p-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)]">
                      <div>
                        <div className="text-xs font-bold text-[var(--c-text)]">{p.name}</div>
                        <div className="text-[10px] text-[var(--c-text-muted)]">{p.ign} · {p.role} · {p.rank}</div>
                      </div>
                      <button
                        onClick={() => handleDraftPlayer(p)}
                        disabled={draftSaving || isFull}
                        className="bg-[#8B5CF6] hover:bg-[#7c4fe3] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Draft
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setDraftTeam(null)} className="dash-btn-ghost text-xs px-4 py-2 rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Team Confirmation ── */}
      {deleteTarget && (
        <div style={{ position:"fixed", inset:0, zIndex:120, display:"flex", alignItems:"center", justifyContent:"center", backgroundColor:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)" }}>
          <div className="bg-[var(--c-surface)] border border-[#FF4655]/40 rounded-xl w-full max-w-sm p-6 relative">
            <h3 className="font-head text-lg font-bold text-[#FF4655] mb-2 uppercase">Delete Team?</h3>
            <p className="text-xs text-[var(--c-text-muted)] mb-5">
              Deleting <span className="font-semibold text-[var(--c-text)]">{deleteTarget.name}</span> will also release all {deleteTarget.players.length} player(s) back to free agent status.
              {(deleteTarget.pendingPlayers ?? []).length > 0 && (
                <> {deleteTarget.pendingPlayers!.length} pending invite(s) will also be cancelled.</>
              )}
            </p>
            {deleteError && (
              <div className="mb-4 text-xs text-[#FF4655] bg-[#FF4655]/10 border border-[#FF4655]/30 px-3 py-2 rounded-lg">
                ⚠️ {deleteError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={handleDeleteTeam} disabled={deleting} className="bg-[#FF4655] hover:bg-[#E53E4D] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">
                {deleting ? "Deleting…" : "Delete Team"}
              </button>
              <button onClick={() => { setDeleteTarget(null); setDeleteError(null); }} disabled={deleting} className="dash-btn-ghost text-xs px-4 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}