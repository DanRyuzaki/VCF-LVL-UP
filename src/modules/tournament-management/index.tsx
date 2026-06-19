"use client";

import { useState } from "react";
import { IconEdit, IconX } from "@/components/shared/icons";
import { useOrganizerContext, type Tournament } from "@/lib/organizer-context";

export default function TournamentManagementModule() {
  const { tournaments, setTournaments } = useOrganizerContext();

  // ── Create-tournament form ────────────────────────────────────────────────
  const [newName,     setNewName]     = useState("");
  const [newGame,     setNewGame]     = useState("MLBB");
  const [newFormat,   setNewFormat]   = useState("Single Elimination");
  const [newMaxTeams, setNewMaxTeams] = useState(8);

  // ── Modal ─────────────────────────────────────────────────────────────────
  const [modalType,        setModalType]        = useState<"none" | "view" | "edit">("none");
  const [selectedTourney,  setSelectedTourney]  = useState<Tournament | null>(null);

  // ── Edit-modal fields ─────────────────────────────────────────────────────
  const [editName,   setEditName]   = useState("");
  const [editGame,   setEditGame]   = useState("");
  const [editFormat, setEditFormat] = useState("");
  const [editStatus, setEditStatus] = useState("");

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setTournaments((prev) => [
      ...prev,
      {
        id: `tr-${Date.now()}`,
        name: newName.trim(),
        game: newGame,
        format: newFormat,
        season: 1,
        teamsRegistered: 0,
        maxTeams: newMaxTeams,
        matchesPlayed: 0,
        totalMatches: newMaxTeams - 1,
        status: "registration",
        teamsList: [],
        matchesList: [],
      },
    ]);

    setNewName("");
  };

  const openModal = (t: Tournament, type: "view" | "edit") => {
    setSelectedTourney(t);
    setModalType(type);
    if (type === "edit") {
      setEditName(t.name);
      setEditGame(t.game);
      setEditFormat(t.format);
      setEditStatus(t.status);
    }
  };

  const closeModal = () => {
    setModalType("none");
    setSelectedTourney(null);
  };

  const handleSave = () => {
    if (!selectedTourney) return;
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === selectedTourney.id
          ? { ...t, name: editName, game: editGame, format: editFormat, status: editStatus }
          : t
      )
    );
    closeModal();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="dash-card p-5">
        <div className="dash-section-title">Create Tournaments</div>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="dash-label">Tournament Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. MLBB Championship"
              className="dash-input"
            />
          </div>
          <div>
            <label className="dash-label">Game</label>
            <select value={newGame} onChange={(e) => setNewGame(e.target.value)} className="dash-select">
              <option value="MLBB">MLBB</option>
              <option value="CODM">CODM</option>
            </select>
          </div>
          <div>
            <label className="dash-label">Format</label>
            <select value={newFormat} onChange={(e) => setNewFormat(e.target.value)} className="dash-select">
              <option value="Single Elimination">Single Elimination</option>
              <option value="Double Elimination">Double Elimination</option>
              <option value="Round Robin">Round Robin</option>
            </select>
          </div>
          <div>
            <label className="dash-label">Max Teams</label>
            <select
              value={newMaxTeams}
              onChange={(e) => setNewMaxTeams(Number(e.target.value))}
              className="dash-select"
            >
              <option value="4">4 Teams</option>
              <option value="8">8 Teams</option>
              <option value="16">16 Teams</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors"
          >
            Save Tournament
          </button>
        </form>
      </div>

      {/* Tournaments Table */}
      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {["Tournament Name", "Game", "Format", "Teams Registered", "Status", "Actions"].map((h) => (
                <th key={h} className="dash-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tournaments.map((t) => (
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
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      t.status === "ongoing"
                        ? "bg-[#FF4655]/20 text-[#FF4655]"
                        : "bg-[#00F5D4]/15 text-[#00F5D4]"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="dash-td">
                  <button
                    onClick={() => openModal(t, "edit")}
                    className="dash-btn-ghost text-xs px-3 py-1 rounded"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View / Edit Modal */}
      {modalType !== "none" && selectedTourney && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl w-full max-w-lg p-6 relative">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-[var(--c-text-dim)] hover:text-[var(--c-text)]"
            >
              <IconX size={16} />
            </button>

            <h3 className="font-head text-xl font-bold text-[var(--c-text)] mb-4 uppercase">
              {modalType === "edit" ? "Edit Tournament Details" : "Tournament Specifications"}
            </h3>

            <div className="space-y-4">
              {modalType === "edit" ? (
                <>
                  <div>
                    <label className="dash-label">Tournament Name</label>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="dash-input" />
                  </div>
                  <div>
                    <label className="dash-label">Game</label>
                    <input value={editGame} onChange={(e) => setEditGame(e.target.value)} className="dash-input" />
                  </div>
                  <div>
                    <label className="dash-label">Format</label>
                    <input value={editFormat} onChange={(e) => setEditFormat(e.target.value)} className="dash-input" />
                  </div>
                  <div>
                    <label className="dash-label">Status</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="dash-select">
                      <option value="registration">registration</option>
                      <option value="ongoing">ongoing</option>
                      <option value="completed">completed</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Name</span>
                    <span className="font-bold text-[var(--c-text)]">{selectedTourney.name}</span>
                  </div>
                  <div>
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Game</span>
                    <span className="font-bold text-[var(--c-text)]">{selectedTourney.game}</span>
                  </div>
                  <div>
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Format</span>
                    <span className="font-bold text-[var(--c-text)]">{selectedTourney.format}</span>
                  </div>
                  <div>
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Status</span>
                    <span className="font-bold text-[var(--c-text)]">{selectedTourney.status}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px] mb-1">
                      Teams List &amp; Players
                    </span>
                    <div className="space-y-1 bg-[var(--c-surface2)] p-2.5 rounded border border-[var(--c-border)] max-h-24 overflow-y-auto">
                      {selectedTourney.teamsList.map((tm, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-[var(--c-text)]">
                          <span>{tm.name}</span>
                          <span className="text-[var(--c-text-muted)]">{tm.players} players</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px] mb-1">
                      Matches List
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedTourney.matchesList.length > 0 ? (
                        selectedTourney.matchesList.map((mid) => (
                          <span
                            key={mid}
                            className="bg-[var(--c-surface3)] border border-[var(--c-border)] px-2 py-0.5 rounded text-[10px] text-[var(--c-text)]"
                          >
                            {mid}
                          </span>
                        ))
                      ) : (
                        <span className="text-[var(--c-text-muted)]">No matches generated yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {modalType === "edit" ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-[#00F5D4] hover:bg-[#00d8bc] text-black text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={closeModal}
                    className="dash-btn-ghost text-xs px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
