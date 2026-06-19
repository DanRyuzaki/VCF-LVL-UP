"use client";

import { useState } from "react";
import { IconEdit, IconX } from "@/components/shared/icons";
import { useOrganizerContext, type Team } from "@/lib/organizer-context";

export default function TeamManagementModule() {
  const { teams, setTeams } = useOrganizerContext();

  // ── Create-team form ──────────────────────────────────────────────────────
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamGame, setNewTeamGame] = useState("MLBB");
  const [newTeamHead, setNewTeamHead] = useState("");

  // ── Modal ─────────────────────────────────────────────────────────────────
  const [modalType,    setModalType]    = useState<"none" | "view" | "edit">("none");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // ── Edit-modal fields ─────────────────────────────────────────────────────
  const [editName,    setEditName]    = useState("");
  const [editHead,    setEditHead]    = useState("");
  const [editStatus,  setEditStatus]  = useState("");
  const [editPlayers, setEditPlayers] = useState("");

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamHead.trim()) return;

    setTeams((prev) => [
      ...prev,
      {
        id: `t-${Date.now()}`,
        name: newTeamName.trim(),
        game: newTeamGame,
        head: newTeamHead.trim(),
        players: [newTeamHead.trim()],
        status: "incomplete",
      },
    ]);

    setNewTeamName("");
    setNewTeamHead("");
  };

  const openModal = (team: Team, type: "view" | "edit") => {
    setSelectedTeam(team);
    setModalType(type);
    if (type === "edit") {
      setEditName(team.name);
      setEditHead(team.head);
      setEditStatus(team.status);
      setEditPlayers(team.players.join(", "));
    }
  };

  const closeModal = () => {
    setModalType("none");
    setSelectedTeam(null);
  };

  const handleSaveTeam = () => {
    if (!selectedTeam) return;
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTeam.id) return t;
        return {
          ...t,
          name: editName,
          head: editHead,
          status: editStatus,
          players: editPlayers.split(",").map((s) => s.trim()).filter(Boolean),
        };
      })
    );
    closeModal();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="dash-card p-5">
        <div className="dash-section-title">Create Team &amp; Assign Head</div>
        <form onSubmit={handleCreateTeam} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="dash-label">Team Name</label>
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="e.g. Team Venom"
              className="dash-input"
            />
          </div>
          <div>
            <label className="dash-label">Game</label>
            <select
              value={newTeamGame}
              onChange={(e) => setNewTeamGame(e.target.value)}
              className="dash-select"
            >
              <option value="MLBB">MLBB</option>
              <option value="CODM">CODM</option>
            </select>
          </div>
          <div>
            <label className="dash-label">Team Head</label>
            <input
              value={newTeamHead}
              onChange={(e) => setNewTeamHead(e.target.value)}
              placeholder="e.g. Marco Reyes"
              className="dash-input"
            />
          </div>
          <button
            type="submit"
            className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors"
          >
            Save Team
          </button>
        </form>
      </div>

      {/* Teams Table */}
      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {["Team Name", "Game", "Team Head", "Players", "Status", "Actions"].map((h) => (
                <th key={h} className="dash-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.id} className="dash-tr">
                <td
                  onClick={() => openModal(t, "view")}
                  className="dash-td font-semibold cursor-pointer text-[#00F5D4] hover:underline"
                >
                  {t.name}
                </td>
                <td className="dash-td-muted">{t.game}</td>
                <td className="dash-td font-semibold">{t.head}</td>
                <td className="dash-td">{t.players.length}/5</td>
                <td className="dash-td">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      t.status === "active"
                        ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                        : "bg-[#FF4655]/20 text-[#FF4655]"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="dash-td">
                  <button
                    onClick={() => openModal(t, "edit")}
                    className="flex items-center gap-1 dash-btn-ghost text-xs px-3 py-1 rounded"
                  >
                    <IconEdit size={11} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View / Edit Modal */}
      {modalType !== "none" && selectedTeam && (
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
              {modalType === "edit" ? "Edit Team Details" : "Team Roster Information"}
            </h3>

            <div className="space-y-4">
              {modalType === "edit" ? (
                <>
                  <div>
                    <label className="dash-label">Team Name</label>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="dash-input" />
                  </div>
                  <div>
                    <label className="dash-label">Team Head</label>
                    <input value={editHead} onChange={(e) => setEditHead(e.target.value)} className="dash-input" />
                  </div>
                  <div>
                    <label className="dash-label">Members (Comma Separated)</label>
                    <input value={editPlayers} onChange={(e) => setEditPlayers(e.target.value)} className="dash-input" />
                  </div>
                  <div>
                    <label className="dash-label">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="dash-select"
                    >
                      <option value="active">active</option>
                      <option value="incomplete">incomplete</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Team Name</span>
                    <span className="font-bold text-[var(--c-text)]">{selectedTeam.name}</span>
                  </div>
                  <div>
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Team Head</span>
                    <span className="font-bold text-[var(--c-text)]">{selectedTeam.head}</span>
                  </div>
                  <div>
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Number of Players</span>
                    <span className="font-bold text-[var(--c-text)]">{selectedTeam.players.length}/5</span>
                  </div>
                  <div>
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Status</span>
                    <span className="font-bold text-[var(--c-text)]">{selectedTeam.status}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px] mb-1.5">
                      Roster Members List
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTeam.players.map((player, idx) => (
                        <span
                          key={idx}
                          className="bg-[var(--c-surface3)] border border-[var(--c-border)] px-2.5 py-1 rounded text-[11px] text-[var(--c-text)]"
                        >
                          {player}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {modalType === "edit" ? (
                <>
                  <button
                    onClick={handleSaveTeam}
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
