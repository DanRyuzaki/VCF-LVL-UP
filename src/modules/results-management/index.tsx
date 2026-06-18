"use client";
import { useState, useMemo } from "react";

interface Match {
  id: string;
  round: string;
  teamA: string;
  teamB: string;
  winner: string;
  scoreA: number;
  scoreB: number;
  date: string;
  time: string;
  status: string;
}

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

interface ResultsManagementModuleProps {
  // Data and setters
  matchesState: Match[];
  setMatchesState: React.Dispatch<React.SetStateAction<Match[]>>;
  tournaments: Tournament[];
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;

  // UI state
  selectedMatchId: string;
  setSelectedMatchId: React.Dispatch<React.SetStateAction<string>>;
  matchWinner: string;
  setMatchWinner: React.Dispatch<React.SetStateAction<string>>;
  scoreA: number;
  setScoreA: React.Dispatch<React.SetStateAction<number>>;
  scoreB: number;
  setScoreB: React.Dispatch<React.SetStateAction<number>>;

  // Notification state
  resultsNotification: { message: string; sub: string } | null;
  setResultsNotification: React.Dispatch<React.SetStateAction<{ message: string; sub: string } | null>>;
}

export default function ResultsManagementModule({
  matchesState,
  setMatchesState,
  tournaments,
  setTournaments,

  selectedMatchId,
  setSelectedMatchId,
  matchWinner,
  setMatchWinner,
  scoreA,
  setScoreA,
  scoreB,
  setScoreB,

  resultsNotification,
  setResultsNotification,
}: ResultsManagementModuleProps) {
  const handleResultSubmit = () => {
    const selectedMatch = matchesState.find((m) => m.id === selectedMatchId);
    if (!selectedMatch) return;

    const updated = matchesState.map((m) => {
      if (m.id === selectedMatchId) {
        return {
          ...m,
          winner: matchWinner,
          scoreA: scoreA,
          scoreB: scoreB,
          status: "completed",
        };
      }
      return m;
    });

    let feederRoundWinner = matchWinner;
    let nextMatchId = "";
    let slotKey: "teamA" | "teamB" = "teamA";

    if (selectedMatchId === "qf3") {
      nextMatchId = "sf2";
      slotKey = "teamA";
    } else if (selectedMatchId === "qf4") {
      nextMatchId = "sf2";
      slotKey = "teamB";
    } else if (selectedMatchId === "sf1") {
      nextMatchId = "f1";
      slotKey = "teamA";
    } else if (selectedMatchId === "sf2") {
      nextMatchId = "f1";
      slotKey = "teamB";
    }

    const finalMatches = updated.map((m) => {
      if (m.id === nextMatchId) {
        return {
          ...m,
          [slotKey]: feederRoundWinner,
        };
      }
      return m;
    });

    setMatchesState(finalMatches);

    let alertMessage = "";
    let nextOpponent = "";

    if (selectedMatchId === "qf3" || selectedMatchId === "qf4") {
      const companionMatchId = selectedMatchId === "qf3" ? "qf4" : "qf3";
      const companionMatch = finalMatches.find((m) => m.id === companionMatchId);
      if (companionMatch && companionMatch.status === "completed") {
        nextOpponent = companionMatch.winner;
        alertMessage = `Alert sent to ${feederRoundWinner} and ${nextOpponent} members: 'Your Semifinals match is scheduled. Prepare for battle!'`;
      } else {
        alertMessage = `Alert sent to ${feederRoundWinner}: 'Waiting for the winner of Quarterfinals Match to lock opponent.'`;
      }
    } else if (selectedMatchId === "sf1" || selectedMatchId === "sf2") {
      const companionMatchId = selectedMatchId === "sf1" ? "sf2" : "sf1";
      const companionMatch = finalMatches.find((m) => m.id === companionMatchId);
      if (companionMatch && companionMatch.status === "completed") {
        nextOpponent = companionMatch.winner;
        alertMessage = `Alert sent to ${feederRoundWinner} and ${nextOpponent} members: 'Your Finals match is scheduled!'`;
      } else {
        alertMessage = `Alert sent to ${feederRoundWinner}: 'Waiting for the winner of Semifinals Match to lock final opponent.'`;
      }
    } else {
      alertMessage = `Alert sent: '${feederRoundWinner} is crowned champion of MLBB Season 4!'`;
    }

    setResultsNotification({
      message: alertMessage,
      sub: `Player stats synced: ${feederRoundWinner} players +25 Skill Rating. Win-Loss record and rankings updated on leaderboards.`,
    });

    setTimeout(() => {
      setResultsNotification(null);
    }, 8000);
  };

  // Memoize the filtered matches for performance
  const pendingMatches = useMemo(() => {
    return matchesState.filter((m) => m.status === "pending" && m.teamA !== "TBD" && m.teamB !== "TBD");
  }, [matchesState]);

  // Memoize the winner options based on selected match
  const winnerOptions = useMemo(() => {
    const selected = matchesState.find((m) => m.id === selectedMatchId);
    if (!selected) return [];
    return [
      { value: selected.teamA, label: selected.teamA },
      { value: selected.teamB, label: selected.teamB }
    ];
  }, [selectedMatchId, matchesState]);

  return (
    <div className="space-y-5">
      {resultsNotification && (
        <div className="p-4 rounded-xl border border-[#00F5D4]/50 bg-[#00F5D4]/5 text-[#00F5D4] text-xs space-y-1 animate-fade-in">
          <div className="font-bold uppercase tracking-wider">{resultsNotification.message}</div>
          <div className="opacity-90">{resultsNotification.sub}</div>
        </div>
      )}

      <div className="dash-card p-5">
        <div className="dash-section-title">Record New Result</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="dash-label">Select Match</label>
            <select
              value={selectedMatchId}
              onChange={(e) => {
                setSelectedMatchId(e.target.value);
                const selected = matchesState.find((m) => m.id === e.target.value);
                if (selected) {
                  setMatchWinner(selected.teamA);
                }
              }}
              className="dash-select"
            >
              {pendingMatches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.teamA} vs {m.teamB} ({m.round})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="dash-label">Winner</label>
            <select
              value={matchWinner}
              onChange={(e) => setMatchWinner(e.target.value)}
              className="dash-select"
            >
              {winnerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="dash-label">Score A</label>
              <input
                type="number"
                value={scoreA}
                onChange={(e) => setScoreA(Number(e.target.value))}
                className="dash-input"
              />
            </div>
            <div className="flex-1">
              <label className="dash-label">Score B</label>
              <input
                type="number"
                value={scoreB}
                onChange={(e) => setScoreB(Number(e.target.value))}
                className="dash-input"
              />
            </div>
          </div>

          <button
            onClick={handleResultSubmit}
            className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors"
          >
            Submit Result
          </button>
        </div>
      </div>

      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {["Match", "Winner", "Score", "Round", "Status"].map((h) => (
                <th key={h} className="dash-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matchesState.map((m) => (
              <tr key={m.id} className="dash-tr">
                <td className="dash-td font-semibold">
                  {m.teamA} vs {m.teamB}
                </td>
                <td className="dash-td font-bold" style={{ color: m.winner ? "#00F5D4" : "var(--c-text-muted)" }}>
                  {m.winner || "TBD"}
                </td>
                <td className="dash-td">
                  {m.status === "completed" ? `${m.scoreA}-${m.scoreB}` : "-"}
                </td>
                <td className="dash-td-muted">{m.round}</td>
                <td className="dash-td">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      m.status === "completed" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-[#FF4655]/20 text-[#FF4655]"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}