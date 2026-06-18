"use client";
import { useState } from "react";
import { IconPlus, IconEdit, IconX } from "@/components/shared/icons";

interface Team {
  id: string;
  name: string;
  game: string;
  head: string;
  players: string[];
  status: string;
}

interface TeamManagementModuleProps {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;

  // Form state
  newTeamName: string;
  setNewTeamName: React.Dispatch<React.SetStateAction<string>>;
  newTeamGame: string;
  setNewTeamGame: React.Dispatch<React.SetStateAction<string>>;
  newTeamHead: string;
  setNewTeamHead: React.Dispatch<React.SetStateAction<string>>;

  // Modal state
  teamModalType: "none" | "view" | "edit";
  setTeamModalType: React.Dispatch<React.SetStateAction<"none" | "view" | "edit">>;
  selectedTeam: Team | null;
  setSelectedTeam: React.Dispatch<React.SetStateAction<Team | null>>;

  // Edit modal state
  editTeamName: string;
  setEditTeamName: React.Dispatch<React.SetStateAction<string>>;
  editTeamHead: string;
  setEditTeamHead: React.Dispatch<React.SetStateAction<string>>;
  editTeamStatus: string;
  setEditTeamStatus: React.Dispatch<React.SetStateAction<string>>;
  editTeamPlayers: string;
  setEditTeamPlayers: React.Dispatch<React.SetStateAction<string>>;
}

export default function TeamManagementModule({
  teams,
  setTeams,

  newTeamName,
  setNewTeamName,
  newTeamGame,
  setNewTeamGame,
  newTeamHead,
  setNewTeamHead,

  teamModalType,
  setTeamModalType,
  selectedTeam,
  setSelectedTeam,

  editTeamName,
  setEditTeamName,
  editTeamHead,
  setEditTeamHead,
  editTeamStatus,
  setEditTeamStatus,
  editTeamPlayers,
  setEditTeamPlayers,
}: TeamManagementModuleProps) {

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName || !newTeamHead) return;

    const newT: Team = {
      id: `t-${Date.now()}`,
      name: newTeamName,
      game: newTeamGame,
      head: newTeamHead,
      players: [newTeamHead],
      status: "incomplete",
    };
    setTeams((prev) => [...prev, newT]);
    setNewTeamName("");
    setNewTeamHead("");
  };

  const openTeamModal = (t: Team, type: "view" | "edit") => {
    setSelectedTeam(t);
    setTeamModalType(type);
    if (type === "edit") {
      setEditTeamName(t.name);
      setEditTeamHead(t.head);
      setEditTeamStatus(t.status);
      setEditTeamPlayers(t.players.join(", "));
    }
  };

  const handleSaveTeamDetails = () => {
    if (!selectedTeam) return;
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === selectedTeam.id) {
          return {
            ...t,
            name: editTeamName,
            head: editTeamHead,
            status: editTeamStatus,
            players: editTeamPlayers.split(",").map((s) => s.trim()).filter(Boolean),
          };
        }
        return t;
      })
    );
    setTeamModalType("none");
    setSelectedTeam(null);
  };

  return (
    <div className="space-y-6">
      <div className="dash-card p-5">
        <div className="dash-section-title">Create Team & Assign Head</div>
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
                  onClick={() => openTeamModal(t, "view")}
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
                      t.status === "active" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-[#FF4655]/20 text-[#FF4655]"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="dash-td">
                  <button
                    onClick={() => openTeamModal(t, "edit")}
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

      {/* View/Edit Team Modal */}
      {teamModalType !== "none" && selectedTeam && (
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
              onClick={() => {
                setTeamModalType("none");
                setSelectedTeam(null);
              }}
              className="absolute right-4 top-4 text-[var(--c-text-dim)] hover:text-[var(--c-text)]"
            >
              <IconX size={16} />
            </button>
            <h3 className="font-head text-xl font-bold text-[var(--c-text)] mb-4 uppercase">
              {teamModalType === "edit" ? "Edit Team Details" : "Team Roster Information"}
            </h3>

            <div className="space-y-4">
              {teamModalType === "edit" ? (
                <>
                  <div>
                    <label className="dash-label">Team Name</label>
                    <input
                      value={editTeamName}
                      onChange={(e) => setEditTeamName(e.target.value)}
                      className="dash-input"
                    />
                  </div>
                  <div>
                    <label className="dash-label">Team Head</label>
                    <input
                      value={editTeamHead}
                      onChange={(e) => setEditTeamHead(e.target.value)}
                      className="dash-input"
                    />
                  </div>
                  <div>
                    <label className="dash-label">Members (Comma Separated)</label>
                    <input
                      value={editTeamPlayers}
                      onChange={(e) => setEditTeamPlayers(e.target.value)}
                      className="dash-input"
                    />
                  </div>
                  <div>
                    <label className="dash-label">Status</label>
                    <select
                      value={editTeamStatus}
                      onChange={(e) => setEditTeamStatus(e.target.value)}
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
                      {selectedTeam.players.map((plyr, idx) => (
                        <span key={idx} className="bg-[var(--c-surface3)] border border-[var(--c-border)] px-2.5 py-1 rounded text-[11px] text-[var(--c-text)]">
                          {plyr}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {teamModalType === "edit" ? (
                <>
                  <button
                    onClick={handleSaveTeamDetails}
                    className="bg-[#00F5D4] hover:bg-[#00d8bc] text-black text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setTeamModalType("none");
                      setSelectedTeam(null);
                    }}
                    className="dash-btn-ghost text-xs px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setTeamModalType("none");
                    setSelectedTeam(null);
                  }}
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