"use client";

import { useState } from "react";
import { IconX } from "@/components/shared/icons";
import {
  useOrganizerContext,
  fsAddTournament,
  fsUpdateTournament,
  fsDeleteTournament,
  type Tournament,
} from "@/lib/organizer-context";

// ── Hard Math Challenge for deletion ─────────────────────────────────────────

function generateMathChallenge(): { question: string; answer: number } {
  const a = Math.floor(Math.random() * 20) + 10;
  const b = Math.floor(Math.random() * 20) + 10;
  const c = Math.floor(Math.random() * 9) + 2;
  // e.g. (34 + 17) × 6
  return {
    question: `(${a} + ${b}) × ${c}`,
    answer: (a + b) * c,
  };
}

export default function TournamentManagementModule() {
  const { tournaments, teams, loading } = useOrganizerContext();

  // ── Create form ───────────────────────────────────────────────────────────
  const [newName,     setNewName]     = useState("");
  const [newGame,     setNewGame]     = useState("MLBB");
  const [newFormat,   setNewFormat]   = useState("Single Elimination");
  const [newMaxTeams, setNewMaxTeams] = useState(8);
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState<string | null>(null);

  // ── Manage modal ──────────────────────────────────────────────────────────
  const [modalType,       setModalType]       = useState<"none" | "view" | "edit">("none");
  const [selectedTourney, setSelectedTourney] = useState<Tournament | null>(null);
  const [editName,   setEditName]   = useState("");
  const [editGame,   setEditGame]   = useState("");
  const [editFormat, setEditFormat] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError,  setEditError]  = useState<string | null>(null);

  // ── Delete confirmation modal ─────────────────────────────────────────────
  const [deleteTarget,     setDeleteTarget]     = useState<Tournament | null>(null);
  const [mathChallenge,    setMathChallenge]    = useState<{ question: string; answer: number } | null>(null);
  const [mathAnswer,       setMathAnswer]       = useState("");
  const [mathError,        setMathError]        = useState<string | null>(null);
  const [deleting,         setDeleting]         = useState(false);

  // ── Start-tournament dialog ───────────────────────────────────────────────
  const [startTarget, setStartTarget] = useState<Tournament | null>(null);
  const [starting,    setStarting]    = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      // Correct totalMatches per format:
      // Single Elimination: n-1
      // Round Robin: n*(n-1)/2
      const n = newMaxTeams;
      const totalMatches = newFormat === "Round Robin" ? (n * (n - 1)) / 2 : n - 1;

      await fsAddTournament({
        name: newName.trim(),
        game: newGame,
        format: newFormat,
        season: 1,
        teamsRegistered: 0,
        maxTeams: newMaxTeams,
        matchesPlayed: 0,
        totalMatches,
        status: "registration",
        teamsList: [],
        matchesList: [],
      });
      setNewName("");
    } catch (err) {
      console.error("Failed to create tournament:", err);
      setSaveError("Failed to create tournament. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const openModal = (t: Tournament, type: "view" | "edit") => {
    setSelectedTourney(t);
    setModalType(type);
    setEditError(null);
    if (type === "edit") {
      setEditName(t.name);
      setEditGame(t.game);
      setEditFormat(t.format);
    }
  };

  const closeModal = () => { setModalType("none"); setSelectedTourney(null); };

  const handleSave = async () => {
    if (!selectedTourney) return;
    setEditSaving(true);
    setEditError(null);
    try {
      // Recompute totalMatches if format changed (only safe while no bracket
      // has been generated yet — see disabled state on the Format select).
      const n = selectedTourney.maxTeams;
      const totalMatches = editFormat === "Round Robin" ? (n * (n - 1)) / 2 : n - 1;

      await fsUpdateTournament(selectedTourney.id, {
        name: editName,
        game: editGame,
        format: editFormat,
        totalMatches,
      });
      closeModal();
    } catch (err) {
      console.error("Failed to update tournament:", err);
      setEditError("Failed to save changes. Please try again.");
    } finally {
      setEditSaving(false);
    }
  };

  // Register a team into a tournament
  const handleRegisterTeam = async (tourney: Tournament, teamName: string) => {
    const team = teams.find((t) => t.name === teamName);
    if (!team) return;
    const already = tourney.teamsList.find((tl) => tl.name === teamName);
    if (already) return;
    const newList = [...tourney.teamsList, { name: teamName, players: team.players.length }];
    await fsUpdateTournament(tourney.id, {
      teamsList: newList,
      teamsRegistered: newList.length,
    });
    // Optimistically update the open modal so it reflects the change immediately
    // without waiting for the onSnapshot round-trip.
    const updated = { ...tourney, teamsList: newList, teamsRegistered: newList.length };
    setSelectedTourney(updated);
  };

  const handleUnregisterTeam = async (tourney: Tournament, teamName: string) => {
    const newList = tourney.teamsList.filter((tl) => tl.name !== teamName);
    await fsUpdateTournament(tourney.id, {
      teamsList: newList,
      teamsRegistered: newList.length,
    });
    // Optimistically update the open modal
    const updated = { ...tourney, teamsList: newList, teamsRegistered: newList.length };
    setSelectedTourney(updated);
  };

  // Start tournament — only when team slots met
  const openStart = (t: Tournament) => setStartTarget(t);
  const handleStart = async () => {
    if (!startTarget) return;
    setStarting(true);
    try {
      await fsUpdateTournament(startTarget.id, { status: "ongoing" });
      setStartTarget(null);
    } catch (err) {
      console.error("Failed to start tournament:", err);
    } finally {
      setStarting(false);
    }
  };

  // Delete flow
  const openDelete = (t: Tournament) => {
    setDeleteTarget(t);
    const challenge = generateMathChallenge();
    setMathChallenge(challenge);
    setMathAnswer("");
    setMathError(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget || !mathChallenge) return;
    if (parseInt(mathAnswer.trim()) !== mathChallenge.answer) {
      setMathError("Incorrect answer. Please try again.");
      return;
    }
    setDeleting(true);
    try {
      await fsDeleteTournament(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete tournament:", err);
      setMathError("Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Status badge colour ───────────────────────────────────────────────────

  const statusColor = (s: string) => {
    if (s === "ongoing")     return "bg-[#FACC15]/15 text-[#FACC15]";
    if (s === "completed")   return "bg-[#00F5D4]/15 text-[#00F5D4]";
    return "bg-[#8B5CF6]/15 text-[#8B5CF6]"; // registration
  };

  // Eligible teams (5+ players)
  const eligibleTeams = teams.filter((t) => t.players.length >= 5);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="dash-card p-5">
        <div className="dash-section-title">Create Tournament</div>
        {saveError && (
          <div className="mb-3 text-xs text-[#FF4655] bg-[#FF4655]/10 border border-[#FF4655]/30 px-3 py-2 rounded-lg">
            {saveError}
          </div>
        )}
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="dash-label">Tournament Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. MLBB Championship"
              className="dash-input"
              disabled={saving}
            />
          </div>
          <div>
            <label className="dash-label">Game</label>
            <select value={newGame} onChange={(e) => setNewGame(e.target.value)} className="dash-select" disabled={saving}>
              <option value="MLBB">MLBB</option>
              <option value="CODM">CODM</option>
            </select>
          </div>
          <div>
            <label className="dash-label">Format</label>
            <select value={newFormat} onChange={(e) => setNewFormat(e.target.value)} className="dash-select" disabled={saving}>
              <option value="Single Elimination">Single Elimination</option>
              <option value="Round Robin">Round Robin</option>
            </select>
            {newFormat === "Round Robin" && (
              <p className="text-[10px] text-[#00F5D4] mt-1">
                ✓ All teams play each other. {newMaxTeams} teams = {(newMaxTeams * (newMaxTeams - 1)) / 2} total matches.
              </p>
            )}
          </div>
          <div>
            <label className="dash-label">Max Teams</label>
            <select
              value={newMaxTeams}
              onChange={(e) => setNewMaxTeams(Number(e.target.value))}
              className="dash-select"
              disabled={saving}
            >
              <option value="4">4 Teams</option>
              <option value="8">8 Teams</option>
              <option value="16">16 Teams</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#FF4655] hover:bg-[#E53E4D] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors"
          >
            {saving ? "Saving…" : "Create Tournament"}
          </button>
        </form>
      </div>

      {/* Tournaments Table */}
      <div className="dash-table-wrap">
        {loading ? (
          <div className="text-center py-8 text-xs text-[var(--c-text-muted)]">Loading tournaments…</div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--c-text-muted)]">No tournaments yet. Create one above.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="dash-thead">
              <tr>
                {["Tournament Name", "Game", "Format", "Teams Registered", "Status", "Actions"].map((h) => (
                  <th key={h} className="dash-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t) => {
                const slotsFull = t.teamsList.length >= t.maxTeams;
                const canStart  = slotsFull && t.status === "registration";
                return (
                  <tr key={t.id} className="dash-tr">
                    <td
                      onClick={() => openModal(t, "view")}
                      className="dash-td font-semibold cursor-pointer text-[#00F5D4] hover:underline"
                    >
                      {t.name}
                    </td>
                    <td className="dash-td-muted">{t.game}</td>
                    <td className="dash-td-muted">{t.format}</td>
                    <td className="dash-td">{t.teamsList.length}/{t.maxTeams}</td>
                    <td className="dash-td">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${statusColor(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="dash-td">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          onClick={() => openModal(t, "view")}
                          className="dash-btn-ghost text-xs px-2 py-1 rounded"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => openModal(t, "edit")}
                          className="dash-btn-ghost text-xs px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        {canStart && (
                          <button
                            onClick={() => openStart(t)}
                            className="bg-[#FACC15] hover:bg-[#e6b800] text-black text-xs font-bold uppercase tracking-widest px-2 py-1 rounded transition-colors"
                          >
                            Start
                          </button>
                        )}
                        <button
                          onClick={() => openDelete(t)}
                          className="bg-[#FF4655]/10 hover:bg-[#FF4655]/20 text-[#FF4655] text-xs font-semibold px-2 py-1 rounded border border-[#FF4655]/20 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── View/Edit Modal ── */}
      {modalType !== "none" && selectedTourney && (
        <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", backgroundColor:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)" }}>
          <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute right-4 top-4 text-[var(--c-text-dim)] hover:text-[var(--c-text)]">
              <IconX size={16} />
            </button>

            <h3 className="font-head text-xl font-bold text-[var(--c-text)] mb-4 uppercase">
              {modalType === "edit" ? "Edit Tournament" : "Manage Tournament"}
            </h3>

            {editError && (
              <div className="mb-3 text-xs text-[#FF4655] bg-[#FF4655]/10 border border-[#FF4655]/30 px-3 py-2 rounded-lg">
                {editError}
              </div>
            )}

            {modalType === "edit" ? (
              <div className="space-y-4">
                <div>
                  <label className="dash-label">Tournament Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="dash-input" disabled={editSaving} />
                </div>
                <div>
                  <label className="dash-label">Game</label>
                  <select value={editGame} onChange={(e) => setEditGame(e.target.value)} className="dash-select" disabled={editSaving}>
                    <option value="MLBB">MLBB</option>
                    <option value="CODM">CODM</option>
                  </select>
                </div>
                <div>
                  <label className="dash-label">Format</label>
                  <select
                    value={editFormat}
                    onChange={(e) => setEditFormat(e.target.value)}
                    className="dash-select"
                    disabled={editSaving || selectedTourney.matchesList.length > 0}
                  >
                    <option value="Single Elimination">Single Elimination</option>
                    <option value="Round Robin">Round Robin</option>
                  </select>
                  {selectedTourney.matchesList.length > 0 && (
                    <p className="text-[10px] text-[var(--c-text-dim)] mt-1">
                      Format is locked once a bracket has been generated.
                    </p>
                  )}
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={handleSave} disabled={editSaving} className="bg-[#00F5D4] hover:bg-[#00d8bc] disabled:opacity-50 text-black text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">
                    {editSaving ? "Saving…" : "Save Changes"}
                  </button>
                  <button onClick={closeModal} disabled={editSaving} className="dash-btn-ghost text-xs px-4 py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Meta */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {[
                    ["Name", selectedTourney.name],
                    ["Game", selectedTourney.game],
                    ["Format", selectedTourney.format],
                    ["Status", selectedTourney.status],
                    ["Max Teams", String(selectedTourney.maxTeams)],
                    ["Teams In", String(selectedTourney.teamsList.length)],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">{label}</span>
                      <span className="font-bold text-[var(--c-text)]">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Teams joined */}
                <div>
                  <div className="dash-section-title mb-2">Teams Joined</div>
                  {selectedTourney.teamsList.length === 0 ? (
                    <div className="text-xs text-[var(--c-text-muted)]">No teams registered yet.</div>
                  ) : (
                    <div className="space-y-1">
                      {selectedTourney.teamsList.map((tm, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--c-border)]">
                          <span className="font-semibold text-[var(--c-text)]">{tm.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--c-text-muted)]">{tm.players} players</span>
                            {selectedTourney.status === "registration" && (
                              <button
                                onClick={() => handleUnregisterTeam(selectedTourney, tm.name)}
                                className="text-[#FF4655] text-[10px] font-semibold px-2 py-0.5 rounded border border-[#FF4655]/20 hover:bg-[#FF4655]/10 transition-colors"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Register a team */}
                {selectedTourney.status === "registration" && (
                  <div>
                    <div className="dash-section-title mb-2">Register a Team</div>
                    {eligibleTeams.length === 0 ? (
                      <div className="text-xs text-[var(--c-text-muted)]">No eligible teams (need 5+ players).</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {eligibleTeams
                          .filter((et) => !selectedTourney.teamsList.find((tl) => tl.name === et.name))
                          .map((et) => (
                            <button
                              key={et.id}
                              onClick={() => handleRegisterTeam(selectedTourney, et.name)}
                              className="text-xs px-3 py-1.5 rounded border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 transition-colors font-semibold"
                            >
                              + {et.name}
                            </button>
                          ))}
                        {eligibleTeams.filter((et) => !selectedTourney.teamsList.find((tl) => tl.name === et.name)).length === 0 && (
                          <div className="text-xs text-[var(--c-text-muted)]">All eligible teams already registered.</div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2 flex justify-end">
                  <button onClick={closeModal} className="bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Start Confirmation ── */}
      {startTarget && (
        <div style={{ position:"fixed", inset:0, zIndex:110, display:"flex", alignItems:"center", justifyContent:"center", backgroundColor:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}>
          <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl w-full max-w-sm p-6 relative">
            <h3 className="font-head text-lg font-bold text-[#FACC15] mb-3 uppercase">Start Tournament?</h3>
            <p className="text-xs text-[var(--c-text-muted)] mb-5">
              This will set <span className="font-semibold text-[var(--c-text)]">{startTarget.name}</span> to <strong>Ongoing</strong> status. All {startTarget.maxTeams} team slots are filled. This action cannot be easily undone.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={handleStart} disabled={starting} className="bg-[#FACC15] hover:bg-[#e6b800] disabled:opacity-50 text-black text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">
                {starting ? "Starting…" : "Confirm Start"}
              </button>
              <button onClick={() => setStartTarget(null)} disabled={starting} className="dash-btn-ghost text-xs px-4 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation with Math ── */}
      {deleteTarget && mathChallenge && (
        <div style={{ position:"fixed", inset:0, zIndex:120, display:"flex", alignItems:"center", justifyContent:"center", backgroundColor:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)" }}>
          <div className="bg-[var(--c-surface)] border border-[#FF4655]/40 rounded-xl w-full max-w-sm p-6 relative">
            <h3 className="font-head text-lg font-bold text-[#FF4655] mb-2 uppercase">Delete Tournament?</h3>
            <p className="text-xs text-[var(--c-text-muted)] mb-4">
              You are about to permanently delete <span className="font-semibold text-[var(--c-text)]">{deleteTarget.name}</span>. This cannot be undone. To confirm, solve the math challenge below:
            </p>
            <div className="bg-[var(--c-surface2)] border border-[var(--c-border)] rounded-lg p-4 mb-4 text-center">
              <div className="text-[10px] uppercase tracking-widest text-[var(--c-text-dim)] mb-1">Solve this:</div>
              <div className="text-2xl font-bold text-[var(--c-text)] font-mono">{mathChallenge.question} = ?</div>
            </div>
            <input
              type="number"
              value={mathAnswer}
              onChange={(e) => { setMathAnswer(e.target.value); setMathError(null); }}
              placeholder="Your answer…"
              className="dash-input mb-2"
            />
            {mathError && (
              <div className="text-xs text-[#FF4655] mb-3">{mathError}</div>
            )}
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleDelete}
                disabled={deleting || !mathAnswer}
                className="bg-[#FF4655] hover:bg-[#E53E4D] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="dash-btn-ghost text-xs px-4 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
