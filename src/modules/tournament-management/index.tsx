"use client";
import { useState } from "react";
import { IconPlus, IconEdit, IconX } from "@/components/shared/icons";

interface Tournament {
  id: string;
  name: string;
  game: string;
  format: string;
  season: number;
  teamsRegistered: number;
  maxTeams: number;
  matchesPlayed: number;
  totalMatches: number;
  status: string;
  teamsList: { name: string; players: number }[];
  matchesList: string[];
}

interface TournamentManagementModuleProps {
  tournaments: Tournament[];
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
}

export default function TournamentManagementModule({
  tournaments,
  setTournaments,
}: TournamentManagementModuleProps) {
  // Form state
  const [newTourneyName, setNewTourneyName] = useState("");
  const [newTourneyGame, setNewTourneyGame] = useState("MLBB");
  const [newTourneyFormat, setNewTourneyFormat] = useState("Single Elimination");
  const [newTourneyMaxTeams, setNewTourneyMaxTeams] = useState(8);

  // Modal state
  const [tourneyModalType, setTourneyModalType] = useState<"none" | "view" | "edit">("none");
  const [selectedTourney, setSelectedTourney] = useState<Tournament | null>(null);

  // Edit modal state
  const [editTourneyName, setEditTourneyName] = useState("");
  const [editTourneyGame, setEditTourneyGame] = useState("");
  const [editTourneyFormat, setEditTourneyFormat] = useState("");
  const [editTourneyStatus, setEditTourneyStatus] = useState("");

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourneyName) return;

    const newT: Tournament = {
      id: `tr-${Date.now()}`,
      name: newTourneyName,
      game: newTourneyGame,
      format: newTourneyFormat,
      season: 1,
      teamsRegistered: 0,
      maxTeams: newTourneyMaxTeams,
      matchesPlayed: 0,
      totalMatches: newTourneyMaxTeams - 1,
      status: "registration",
      teamsList: [],
      matchesList: [],
    };
    setTournaments((prev) => [...prev, newT]);
    setNewTourneyName("");
    // Note: we keep game, format, and maxTeams as they were; optionally reset
  };

  const openTourneyModal = (t: Tournament, type: "view" | "edit") => {
    setSelectedTourney(t);
    setTourneyModalType(type);
    if (type === "edit") {
      setEditTourneyName(t.name);
      setEditTourneyGame(t.game);
      setEditTourneyFormat(t.format);
      setEditTourneyStatus(t.status);
    }
  };

  const handleSaveTourneyDetails = () => {
    if (!selectedTourney) return;
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === selectedTourney.id) {
          return {
            ...t,
            name: editTourneyName,
            game: editTourneyGame,
            format: editTourneyFormat,
            status: editTourneyStatus,
          };
        }
        return t;
      })
    );
    setTourneyModalType("none");
    setSelectedTourney(null);
  };

  return (
    <div className="space-y-6">
      <div className="dash-card p-5">
        <div className="dash-section-title">Create Tournaments</div>
        <form onSubmit={handleCreateTournament} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="dash-label">Tournament Name</label>
            <input
              value={newTourneyName}
              onChange={(e) => setNewTourneyName(e.target.value)}
              placeholder="e.g. MLBB Championship"
              className="dash-input"
            />
          </div>
          <div>
            <label className="dash-label">Game</label>
            <select
              value={newTourneyGame}
              onChange={(e) => setNewTourneyGame(e.target.value)}
              className="dash-select"
            >
              <option value="MLBB">MLBB</option>
              <option value="CODM">CODM</option>
            </select>
          </div>
          <div>
            <label className="dash-label">Format</label>
            <select
              value={newTourneyFormat}
              onChange={(e) => setNewTourneyFormat(e.target.value)}
              className="dash-select"
            >
              <option value="Single Elimination">Single Elimination</option>
              <option value="Double Elimination">Double Elimination</option>
              <option value="Round Robin">Round Robin</option>
            </select>
          </div>
          <div>
            <label className="dash-label">Max Teams</label>
            <select
              value={newTourneyMaxTeams}
              onChange={(e) => setNewTourneyMaxTeams(Number(e.target.value))}
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
                  onClick={() => openTourneyModal(t, "view")}
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
                      t.status === "ongoing" ? "bg-[#FF4655]/20 text-[#FF4655]" : "bg-[#00F5D4]/15 text-[#00F5D4]"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="dash-td">
                  <button
                    onClick={() => openTourneyModal(t, "edit")}
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

      {/* View/Edit Tournament Modal */}
      {tourneyModalType !== "none" && selectedTourney && (
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
                setTourneyModalType("none");
                setSelectedTourney(null);
              }}
              className="absolute right-4 top-4 text-[var(--c-text-dim)] hover:text-[var(--c-text)]"
            >
              <IconX size={16} />
            </button>
            <h3 className="font-head text-xl font-bold text-[var(--c-text)] mb-4 uppercase">
              {tourneyModalType === "edit" ? "Edit Tournament Details" : "Tournament Specifications"}
            </h3>

            <div className="space-y-4">
              {tourneyModalType === "edit" ? (
                <>
                  <div>
                    <label className="dash-label">Tournament Name</label>
                    <input
                      value={editTourneyName}
                      onChange={(e) => setEditTourneyName(e.target.value)}
                      className="dash-input"
                    />
                  </div>
                  <div>
                    <label className="dash-label">Game</label>
                    <input
                      value={editTourneyGame}
                      onChange={(e) => setEditTourneyGame(e.target.value)}
                      className="dash-input"
                    />
                  </div>
                  <div>
                    <label className="dash-label">Format</label>
                    <input
                      value={editTourneyFormat}
                      onChange={(e) => setEditTourneyFormat(e.target.value)}
                      className="dash-input"
                    />
                  </div>
                  <div>
                    <label className="dash-label">Status</label>
                    <select
                      value={editTourneyStatus}
                      onChange={(e) => setEditTourneyStatus(e.target.value)}
                      className="dash-select"
                    >
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
                      Teams List & Players
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
                          <span key={mid} className="bg-[var(--c-surface3)] border border-[var(--c-border)] px-2 py-0.5 rounded text-[10px] text-[var(--c-text)]">
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
              {tourneyModalType === "edit" ? (
                <>
                  <button
                    onClick={handleSaveTourneyDetails}
                    className="bg-[#00F5D4] hover:bg-[#00d8bc] text-black text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setTourneyModalType("none");
                      setSelectedTourney(null);
                    }}
                    className="dash-btn-ghost text-xs px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setTourneyModalType("none");
                    setSelectedTourney(null);
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