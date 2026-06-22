"use client";

import { useState, useMemo } from "react";
import { useOrganizerContext, fsUpdateMatch } from "@/lib/organizer-context";

export default function ResultsManagementModule() {
  const { matchesState, loading } = useOrganizerContext();

  // ── Local UI state ────────────────────────────────────────────────────────
  const [notification,    setNotification]    = useState<{ message: string; sub: string } | null>(null);
  const [submitting,      setSubmitting]       = useState(false);
  const [submitError,     setSubmitError]      = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId]  = useState("");
  const [matchWinner,     setMatchWinner]      = useState("");
  const [scoreA,          setScoreA]           = useState(2);
  const [scoreB,          setScoreB]           = useState(0);

  // ── Derived data ──────────────────────────────────────────────────────────

  const pendingMatches = useMemo(
    () => matchesState.filter((m) => m.status === "pending" && m.teamA !== "TBD" && m.teamB !== "TBD"),
    [matchesState]
  );

  // Auto-select first pending match when list loads
  useMemo(() => {
    if (pendingMatches.length > 0 && !selectedMatchId) {
      setSelectedMatchId(pendingMatches[0].id);
      setMatchWinner(pendingMatches[0].teamA);
    }
  }, [pendingMatches]);

  const winnerOptions = useMemo(() => {
    const match = matchesState.find((m) => m.id === selectedMatchId);
    if (!match) return [];
    return [
      { value: match.teamA, label: match.teamA },
      { value: match.teamB, label: match.teamB },
    ];
  }, [selectedMatchId, matchesState]);

  // ── Submit handler ────────────────────────────────────────────────────────

  const handleResultSubmit = async () => {
    const selectedMatch = matchesState.find((m) => m.id === selectedMatchId);
    if (!selectedMatch) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      // Write result to Firestore
      await fsUpdateMatch(selectedMatchId, {
        winner: matchWinner,
        scoreA,
        scoreB,
        status: "completed",
      });

      // Advance winner to the next bracket slot if defined
      const PROGRESSION: Record<string, { nextId: string; slot: "teamA" | "teamB" }> = {
        qf3: { nextId: "sf2", slot: "teamA" },
        qf4: { nextId: "sf2", slot: "teamB" },
        sf1: { nextId: "f1",  slot: "teamA" },
        sf2: { nextId: "f1",  slot: "teamB" },
      };
      const next = PROGRESSION[selectedMatchId];
      if (next) {
        const nextMatch = matchesState.find((m) => m.id === next.nextId);
        if (nextMatch) {
          await fsUpdateMatch(next.nextId, { [next.slot]: matchWinner });
        }
      }

      // Build notification message
      let message = "";
      if (selectedMatchId === "qf3" || selectedMatchId === "qf4") {
        const siblingId = selectedMatchId === "qf3" ? "qf4" : "qf3";
        const sibling   = matchesState.find((m) => m.id === siblingId);
        message =
          sibling?.status === "completed"
            ? `Alert sent to ${matchWinner} and ${sibling.winner} members: 'Your Semifinals match is scheduled. Prepare for battle!'`
            : `Alert sent to ${matchWinner}: 'Waiting for the winner of Quarterfinals Match to lock opponent.'`;
      } else if (selectedMatchId === "sf1" || selectedMatchId === "sf2") {
        const siblingId = selectedMatchId === "sf1" ? "sf2" : "sf1";
        const sibling   = matchesState.find((m) => m.id === siblingId);
        message =
          sibling?.status === "completed"
            ? `Alert sent to ${matchWinner} and ${sibling.winner} members: 'Your Finals match is scheduled!'`
            : `Alert sent to ${matchWinner}: 'Waiting for the winner of Semifinals Match to lock final opponent.'`;
      } else {
        message = `Alert sent: '${matchWinner} is crowned champion!'`;
      }

      setNotification({
        message,
        sub: `Player stats synced: ${matchWinner} players +25 Skill Rating. Win-Loss record and rankings updated on leaderboards.`,
      });
      setTimeout(() => setNotification(null), 8000);

      // Reset selection to next pending match
      const remaining = pendingMatches.filter((m) => m.id !== selectedMatchId);
      if (remaining.length > 0) {
        setSelectedMatchId(remaining[0].id);
        setMatchWinner(remaining[0].teamA);
      } else {
        setSelectedMatchId("");
        setMatchWinner("");
      }
    } catch (err) {
      console.error("Failed to submit result:", err);
      setSubmitError("Failed to submit result. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Notification banner */}
      {notification && (
        <div className="p-4 rounded-xl border border-[#00F5D4]/50 bg-[#00F5D4]/5 text-[#00F5D4] text-xs space-y-1 animate-fade-in">
          <div className="font-bold uppercase tracking-wider">{notification.message}</div>
          <div className="opacity-90">{notification.sub}</div>
        </div>
      )}

      {/* Error banner */}
      {submitError && (
        <div className="p-3 rounded-xl border border-[#FF4655]/40 bg-[#FF4655]/5 text-[#FF4655] text-xs">
          {submitError}
        </div>
      )}

      {/* Record result form */}
      <div className="dash-card p-5">
        <div className="dash-section-title">Record New Result</div>
        {loading ? (
          <div className="text-center py-4 text-xs text-[var(--c-text-muted)]">Loading matches…</div>
        ) : pendingMatches.length === 0 ? (
          <div className="text-center py-4 text-xs text-[var(--c-text-muted)]">No pending matches with confirmed teams.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="dash-label">Select Match</label>
              <select
                value={selectedMatchId}
                onChange={(e) => {
                  setSelectedMatchId(e.target.value);
                  const match = matchesState.find((m) => m.id === e.target.value);
                  if (match) setMatchWinner(match.teamA);
                }}
                className="dash-select"
                disabled={submitting}
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
                disabled={submitting}
              >
                {winnerOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                  disabled={submitting}
                />
              </div>
              <div className="flex-1">
                <label className="dash-label">Score B</label>
                <input
                  type="number"
                  value={scoreB}
                  onChange={(e) => setScoreB(Number(e.target.value))}
                  className="dash-input"
                  disabled={submitting}
                />
              </div>
            </div>

            <button
              onClick={handleResultSubmit}
              disabled={submitting || !selectedMatchId}
              className="bg-[#FF4655] hover:bg-[#E53E4D] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors"
            >
              {submitting ? "Saving…" : "Submit Result"}
            </button>
          </div>
        )}
      </div>

      {/* Match history table */}
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
                <td
                  className="dash-td font-bold"
                  style={{ color: m.winner ? "#00F5D4" : "var(--c-text-muted)" }}
                >
                  {m.winner || "TBD"}
                </td>
                <td className="dash-td">
                  {m.status === "completed" ? `${m.scoreA}–${m.scoreB}` : "–"}
                </td>
                <td className="dash-td-muted">{m.round}</td>
                <td className="dash-td">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      m.status === "completed"
                        ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                        : "bg-[#FF4655]/20 text-[#FF4655]"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
            {matchesState.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-xs text-[var(--c-text-muted)]">
                  No matches yet. Generate a bracket first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
