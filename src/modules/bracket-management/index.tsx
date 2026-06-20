"use client";
import { useState, useRef, useEffect, useCallback, useContext, CSSProperties } from "react";
import {
  OrganizerContext,
  fsAddMatch,
  fsUpdateMatch,
  fsUpdateTournament,
  fsAddCalendarEvent,
} from "@/lib/organizer-context";
import { useAuth } from "@/lib/auth-context";

/* ═══════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════ */

type HoverMode = "glow" | "lift" | "dim" | "off";

interface BracketTeamEntry {
  name: string;
  score?: number;
  isWinner?: boolean;
}

interface BracketMatchEntry {
  id: string;
  teamA: BracketTeamEntry;
  teamB: BracketTeamEntry;
  date?: string;
  time?: string;
  status?: string;
}

interface BracketRoundEntry {
  title: string;
  matches: BracketMatchEntry[];
}

interface TournamentBracketData {
  id: string;
  name: string;
  game: string;
  format: string;
  status: string;
  rounds: BracketRoundEntry[];
  maxTeams: number;
  teamsList: { name: string; players: number }[];
}

/* ═══════════════════════════════════════════════════
   Team Logo Badge
   ═══════════════════════════════════════════════════ */

const TEAM_COLORS: Record<string, string> = { TBD: "#555" };

function getTeamColor(name: string): string {
  if (TEAM_COLORS[name]) return TEAM_COLORS[name];
  const hash = name.split("").reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
}

function getTeamTag(name: string): string {
  if (name === "TBD") return "??";
  const words = name.replace(/^Team\s+/i, "").split(" ");
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return words[0].slice(0, 2).toUpperCase();
}

function TeamLogo({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, minWidth: size, borderRadius: "50%",
        backgroundColor: getTeamColor(name),
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0,
        textTransform: "uppercase", letterSpacing: "0.3px",
      }}
    >
      {getTeamTag(name)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Match Card
   ═══════════════════════════════════════════════════ */

function MatchCard({
  match, hoverMode, hoveredId, onHover, onLeave, matchRef, onClick, onSchedule, isClickable, showScheduleBtn,
}: {
  match: BracketMatchEntry;
  hoverMode: HoverMode;
  hoveredId: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
  matchRef?: (el: HTMLDivElement | null) => void;
  onClick?: () => void;
  onSchedule?: () => void;
  isClickable?: boolean;
  showScheduleBtn?: boolean;
}) {
  const isHovered = hoveredId === match.id;
  const isDimmed  = hoverMode === "dim" && hoveredId !== null && !isHovered;

  const cardStyle: CSSProperties = {
    borderRadius: 8, overflow: "hidden",
    border: "1px solid var(--c-border)",
    backgroundColor: "var(--c-surface3)",
    transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
    cursor: isClickable ? "pointer" : "default",
    width: "100%",
    ...(hoverMode === "glow" && isHovered ? { boxShadow: "0 0 20px rgba(139,92,246,0.5)", borderColor: "#8B5CF6" } : {}),
    ...(hoverMode === "lift" && isHovered ? { transform: "translateY(-4px) scale(1.02)", boxShadow: "0 12px 32px rgba(0,0,0,0.5)" } : {}),
    ...(isDimmed ? { opacity: 0.25, filter: "grayscale(0.5)" } : {}),
  };

  const renderTeamRow = (team: BracketTeamEntry) => {
    const won = !!team.isWinner;
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px", fontSize: 12, gap: 8,
        color: won ? "#fff" : "var(--c-text-muted)",
        backgroundColor: won ? "rgba(0,245,212,0.06)" : "transparent",
        transition: "background-color 0.2s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <TeamLogo name={team.name} size={20} />
          <span style={{ fontWeight: won ? 600 : 400, color: won ? "#00F5D4" : undefined, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {team.name}
          </span>
        </div>
        {team.score !== undefined && (
          <div style={{
            minWidth: 24, height: 24, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, flexShrink: 0,
            color: won ? "#fff" : "var(--c-text-dim)",
            backgroundColor: won ? "#FF4655" : "transparent",
            border: won ? "none" : "1px solid var(--c-border)",
          }}>{team.score}</div>
        )}
      </div>
    );
  };

  const hasSchedule = match.date && match.date !== new Date().toISOString().split("T")[0] || match.time && match.time !== "TBD";
  const scheduledDate = match.date || "";
  const scheduledTime = match.time || "TBD";

  return (
    <div ref={matchRef} onMouseEnter={() => onHover(match.id)} onMouseLeave={onLeave} data-match-id={match.id}>
      <div style={cardStyle} onClick={onClick}>
        {renderTeamRow(match.teamA)}
        <div style={{ height: 1, backgroundColor: "var(--c-border)" }} />
        {renderTeamRow(match.teamB)}
      </div>
      {/* Schedule strip */}
      {showScheduleBtn && match.status !== "completed" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", backgroundColor: "var(--c-surface2)", borderRadius: "0 0 8px 8px", borderTop: "1px dashed var(--c-border)", marginTop: -1 }}>
          <span style={{ fontSize: 9, color: scheduledTime === "TBD" ? "var(--c-text-dim)" : "#FACC15" }}>
            {scheduledTime === "TBD" ? "⏰ Not scheduled" : `📅 ${scheduledDate} · ${fmt12(scheduledTime)}`}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onSchedule?.(); }}
            style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, border: "1px solid var(--c-border)", backgroundColor: "transparent", color: "var(--c-text-dim)", cursor: "pointer" }}
          >
            Schedule
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SVG Connectors
   ═══════════════════════════════════════════════════ */

interface ConnectorLine { x1: number; y1: number; x2: number; y2: number; }

function BracketConnectors({ lines }: { lines: ConnectorLine[] }) {
  if (lines.length === 0) return null;
  return (
    <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
      {lines.map((line, i) => {
        const midX = (line.x1 + line.x2) / 2;
        return <path key={i} d={`M ${line.x1} ${line.y1} C ${midX} ${line.y1}, ${midX} ${line.y2}, ${line.x2} ${line.y2}`} stroke="var(--c-border2)" strokeWidth={1.5} fill="none" opacity={0.6} />;
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════ */

const fmt12 = (t: string) => {
  if (!t || t === "TBD") return "TBD";
  try {
    const [h, m] = t.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = ((h + 11) % 12) + 1;
    return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
  } catch { return t; }
};

const propagateWinner = (currentMatches: any[], tournament: any, completedMatchId: string, winner: string) => {
  // IMPORTANT: tournament.matchesList is written in one atomic update from an
  // array whose order is the *seeded* bracket order (Promise.all preserves
  // input order in its results regardless of resolution timing). The global
  // `matches` collection, by contrast, is sorted by Firestore serverTimestamp,
  // which can differ from seed order when documents are created concurrently.
  // We must always re-sort by matchesList position before using array index
  // to find a match's slot within its round — never rely on snapshot order.
  const orderIndex = new Map(tournament.matchesList.map((id: string, i: number) => [id, i]));
  const tMatches = currentMatches
    .filter((m) => tournament.matchesList.includes(m.id))
    .sort((a, b) => (orderIndex.get(a.id) as number) - (orderIndex.get(b.id) as number));
  const completedMatch = currentMatches.find((m) => m.id === completedMatchId);
  if (!completedMatch) return currentMatches;
  const roundName = completedMatch.round;
  const roundOrder = ["Round of 16", "Quarterfinals", "Semifinals", "Finals"];
  const currentRoundIdx = roundOrder.indexOf(roundName);
  if (currentRoundIdx === -1 || roundName === "Finals") return currentMatches;
  const roundMatches = tMatches.filter((m) => m.round === roundName);
  const matchIdx = roundMatches.findIndex((m) => m.id === completedMatchId);
  if (matchIdx === -1) return currentMatches;
  const nextRoundName = roundOrder[currentRoundIdx + 1];
  const nextRoundMatches = tMatches.filter((m) => m.round === nextRoundName);
  const nextMatchIdx = Math.floor(matchIdx / 2);
  if (nextMatchIdx >= nextRoundMatches.length) return currentMatches;
  const nextMatch = nextRoundMatches[nextMatchIdx];
  const isTeamA = matchIdx % 2 === 0;
  return currentMatches.map((m) => {
    if (m.id === nextMatch.id) {
      return { ...m, teamA: isTeamA ? winner : m.teamA, teamB: !isTeamA ? winner : m.teamB };
    }
    return m;
  });
};

function buildRoundNames(tiers: number): string[] {
  const all = ["Round of 16", "Quarterfinals", "Semifinals", "Finals"];
  return all.slice(all.length - tiers);
}

/**
 * Derive the correct tier count from maxTeams for SE/DE.
 * 4 teams → 2 tiers, 8 teams → 3 tiers, 16 teams → 4 tiers.
 */
function tiersForTeams(maxTeams: number): 2 | 3 | 4 {
  if (maxTeams <= 4) return 2;
  if (maxTeams <= 8) return 3;
  return 4;
}

/* ═══════════════════════════════════════════════════
   Main Bracket Module
   ═══════════════════════════════════════════════════ */

export default function BracketManagementModule({ showActions = true }: { showActions?: boolean }) {
  const { profile } = useAuth();
  const organizerCtx   = useContext(OrganizerContext);
  const tournaments    = showActions ? organizerCtx?.tournaments    : undefined;
  const setTournaments = showActions ? organizerCtx?.setTournaments : undefined;
  const matchesState   = showActions ? organizerCtx?.matchesState   : undefined;
  const setMatchesState = showActions ? organizerCtx?.setMatchesState : undefined;

  const getFormattedBrackets = useCallback((): TournamentBracketData[] => {
    if (tournaments && matchesState) {
      return tournaments.map((t) => {
        // Always resolve match order from t.matchesList (the seeded order),
        // never from matchesState's snapshot order — see propagateWinner for why.
        const orderIndex = new Map(t.matchesList.map((id, i) => [id, i]));
        const tMatches = matchesState
          .filter((m) => t.matchesList && t.matchesList.includes(m.id))
          .sort((a, b) => (orderIndex.get(a.id) as number) - (orderIndex.get(b.id) as number));
        const isRR = t.format === "Round Robin";

        let roundsList: BracketRoundEntry[];
        if (isRR) {
          // Group round-robin matches by their round label
          const roundMap = new Map<string, BracketMatchEntry[]>();
          tMatches.forEach((m) => {
            const key = m.round || "Round Robin";
            if (!roundMap.has(key)) roundMap.set(key, []);
            roundMap.get(key)!.push({
              id: m.id,
              teamA: { name: m.teamA, score: m.status === "completed" ? m.scoreA : undefined, isWinner: m.status === "completed" && m.winner === m.teamA },
              teamB: { name: m.teamB, score: m.status === "completed" ? m.scoreB : undefined, isWinner: m.status === "completed" && m.winner === m.teamB },
              date: m.date,
              time: m.time,
              status: m.status,
            });
          });
          roundsList = Array.from(roundMap.entries()).map(([title, matches]) => ({ title, matches }));
        } else {
          const roundOrder = ["Round of 16", "Quarterfinals", "Semifinals", "Finals"];
          const uniqueRounds = Array.from(new Set(tMatches.map((m) => m.round))).sort(
            (a, b) => roundOrder.indexOf(a) - roundOrder.indexOf(b)
          );
          roundsList = uniqueRounds.map((rName) => ({
            title: rName,
            matches: tMatches.filter((m) => m.round === rName).map((m) => ({
              id: m.id,
              teamA: { name: m.teamA, score: m.status === "completed" ? m.scoreA : undefined, isWinner: m.status === "completed" && m.winner === m.teamA },
              teamB: { name: m.teamB, score: m.status === "completed" ? m.scoreB : undefined, isWinner: m.status === "completed" && m.winner === m.teamB },
              date: m.date,
              time: m.time,
              status: m.status,
            })),
          })).filter((r) => r.matches.length > 0);
        }

        return { id: t.id, name: t.name, game: t.game, format: t.format, status: t.status, rounds: roundsList, maxTeams: t.maxTeams, teamsList: t.teamsList };
      });
    }
    return [];
  }, [tournaments, matchesState]);

  const brackets = getFormattedBrackets();
  const [selectedTourneyId, setSelectedTourneyId] = useState("");
  const [hoverMode, setHoverMode] = useState<HoverMode>("glow");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [connectorLines, setConnectorLines] = useState<ConnectorLine[]>([]);

  // Round names (SE only — derived automatically from maxTeams)
  const [roundNames, setRoundNames] = useState<string[]>([]);
  const [editingRound, setEditingRound] = useState<number | null>(null);
  const [roundInput, setRoundInput] = useState("");

  // Bracket generation state
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Match result modal
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [modalScoreA, setModalScoreA] = useState(0);
  const [modalScoreB, setModalScoreB] = useState(0);
  const [modalWinner, setModalWinner] = useState<"teamA" | "teamB">("teamA");

  // Schedule modal
  const [schedulingMatchId, setSchedulingMatchId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [syncedToCalendar, setSyncedToCalendar] = useState(false);

  // Marking tournament complete
  const [markingComplete, setMarkingComplete] = useState(false);

  const bracketContainerRef = useRef<HTMLDivElement>(null);
  const matchRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const selectedBracket = brackets.find((b) => b.id === selectedTourneyId) ?? brackets[0];
  const selectedTournament = tournaments?.find((t) => t.id === selectedTourneyId);

  useEffect(() => {
    if (brackets.length > 0 && !selectedTourneyId) setSelectedTourneyId(brackets[0].id);
  }, [brackets, selectedTourneyId]);

  // Auto-set round names when the selected tournament changes
  useEffect(() => {
    if (selectedTournament) {
      const tiers = tiersForTeams(selectedTournament.maxTeams);
      setRoundNames(buildRoundNames(tiers));
    }
  }, [selectedTourneyId, selectedTournament]);

  const setMatchRef = useCallback((matchId: string) => {
    return (el: HTMLDivElement | null) => {
      if (el) matchRefs.current.set(matchId, el);
      else matchRefs.current.delete(matchId);
    };
  }, []);

  const calculateConnectors = useCallback(() => {
    if (!bracketContainerRef.current || !selectedBracket?.rounds?.length) { setConnectorLines([]); return; }
    if (selectedBracket.format === "Round Robin") { setConnectorLines([]); return; }
    const containerRect = bracketContainerRef.current.getBoundingClientRect();
    const rounds = selectedBracket.rounds;
    const newLines: ConnectorLine[] = [];
    for (let rIdx = 0; rIdx < rounds.length - 1; rIdx++) {
      const currentRound = rounds[rIdx];
      const nextRound = rounds[rIdx + 1];
      for (let nIdx = 0; nIdx < nextRound.matches.length; nIdx++) {
        const nextEl = matchRefs.current.get(nextRound.matches[nIdx].id);
        if (!nextEl) continue;
        const nextRect = nextEl.getBoundingClientRect();
        const targetX = nextRect.left - containerRect.left;
        const targetY = nextRect.top - containerRect.top + nextRect.height / 2;
        [nIdx * 2, nIdx * 2 + 1].forEach((sIdx) => {
          if (sIdx < currentRound.matches.length) {
            const srcEl = matchRefs.current.get(currentRound.matches[sIdx].id);
            if (!srcEl) return;
            const srcRect = srcEl.getBoundingClientRect();
            newLines.push({ x1: srcRect.right - containerRect.left + 4, y1: srcRect.top - containerRect.top + srcRect.height / 2, x2: targetX - 4, y2: targetY });
          }
        });
      }
    }
    setConnectorLines(newLines);
  }, [selectedBracket]);

  useEffect(() => {
    const t = setTimeout(calculateConnectors, 100);
    window.addEventListener("resize", calculateConnectors);
    return () => { clearTimeout(t); window.removeEventListener("resize", calculateConnectors); };
  }, [calculateConnectors, selectedTourneyId, brackets]);

  const isBracketComplete = useCallback(() => {
    if (!selectedBracket?.rounds?.length) return false;
    const lastRound = selectedBracket.rounds[selectedBracket.rounds.length - 1];
    return lastRound.matches.every((m) => m.teamA.isWinner || m.teamB.isWinner);
  }, [selectedBracket]);

  /* ─── Generate bracket ─── */
  const handleGenerateBracket = async () => {
    setGenerateError(null);
    if (!selectedTourneyId || !tournaments) return;
    const tourney = tournaments.find((t) => t.id === selectedTourneyId);
    if (!tourney) return;
    if (tourney.status !== "ongoing") return;

    const registeredTeamNames = tourney.teamsList.map((t: any) => t.name);
    if (registeredTeamNames.length < tourney.maxTeams) return;

    const today = new Date().toISOString().split("T")[0];
    const isRoundRobin = tourney.format === "Round Robin";

    let matchDefs: any[] = [];

    if (isRoundRobin) {
      // Every team plays every other team exactly once
      const teams = registeredTeamNames;
      let matchNum = 1;
      const totalRounds = teams.length % 2 === 0 ? teams.length - 1 : teams.length;
      // Circle algorithm for round-robin scheduling
      const arr = [...teams];
      if (arr.length % 2 !== 0) arr.push("BYE");
      const n = arr.length;
      for (let round = 0; round < n - 1; round++) {
        const roundLabel = `Round ${round + 1}`;
        for (let i = 0; i < n / 2; i++) {
          const teamA = arr[i];
          const teamB = arr[n - 1 - i];
          if (teamA !== "BYE" && teamB !== "BYE") {
            matchDefs.push({ round: roundLabel, teamA, teamB, winner: "", scoreA: 0, scoreB: 0, date: today, time: "TBD", status: "pending", tournamentId: selectedTourneyId, tournamentName: tourney.name });
            matchNum++;
          }
        }
        // Rotate array (keep first element fixed)
        const last = arr.pop()!;
        arr.splice(1, 0, last);
      }
    } else {
      // Single Elimination (also used as winners bracket for DE)
      const derivedTiers = tiersForTeams(tourney.maxTeams);
      // Correct: 2 tiers needs 4 teams (2^2), 3 tiers needs 8 teams (2^3), 4 tiers needs 16 (2^4)
      const teamCount = Math.pow(2, derivedTiers);

      // Validate: registered team count must satisfy the bracket shape
      if (registeredTeamNames.length < teamCount) {
        setGenerateError(
          `Need ${teamCount} teams for a ${derivedTiers}-tier bracket, but only ${registeredTeamNames.length} registered. Fill all team slots first.`
        );
        return;
      }

      const generatedRoundNames =
        roundNames.length === derivedTiers ? roundNames : buildRoundNames(derivedTiers);
      const teamSlots = [...registeredTeamNames].slice(0, teamCount);
      let slot = 0;
      for (let tier = 0; tier < derivedTiers; tier++) {
        const roundName = generatedRoundNames[tier];
        const matchCount = Math.pow(2, derivedTiers - 1 - tier);
        for (let i = 0; i < matchCount; i++) {
          const teamA = tier === 0 ? (teamSlots[slot++] ?? "TBD") : "TBD";
          const teamB = tier === 0 ? (teamSlots[slot++] ?? "TBD") : "TBD";
          matchDefs.push({ round: roundName, teamA, teamB, winner: "", scoreA: 0, scoreB: 0, date: today, time: "TBD", status: "pending", tournamentId: selectedTourneyId, tournamentName: tourney.name });
        }
      }
    }

    try {
      const matchIds = await Promise.all(matchDefs.map((m: any) => fsAddMatch(m)));
      await fsUpdateTournament(selectedTourneyId, { matchesList: matchIds, teamsRegistered: tourney.maxTeams });
    } catch (err) {
      console.error("Failed to generate bracket:", err);
      setGenerateError("Failed to generate bracket. Check Firestore permissions.");
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedTourneyId) return;
    setMarkingComplete(true);
    try {
      await fsUpdateTournament(selectedTourneyId, { status: "completed" });
    } catch (err) {
      console.error("Failed to mark complete:", err);
    } finally {
      setMarkingComplete(false);
    }
  };

  /* ─── Schedule save ─── */
  const handleSaveSchedule = async () => {
    if (!schedulingMatchId || !scheduleDate || !scheduleTime) return;
    setScheduleSaving(true);
    setSyncedToCalendar(false);
    try {
      await fsUpdateMatch(schedulingMatchId, { date: scheduleDate, time: scheduleTime });

      // Find tournament name for the calendar entry title
      const match = matchesState?.find((m) => m.id === schedulingMatchId);
      const tourney = tournaments?.find((t) => t.id === selectedTourneyId);
      const eventTitle = match
        ? `${tourney?.name ?? "Match"}: ${match.teamA} vs ${match.teamB} (${match.round})`
        : "Match Scheduled";

      // Sync to calendar_events
      await fsAddCalendarEvent({
        title: eventTitle,
        date: scheduleDate,
        time: scheduleTime,
        status: "approved",
        submittedBy: profile?.uid ?? "organizer",
        submittedByName: profile ? `${profile.firstName} ${profile.lastName}`.trim() : "Organizer",
        matchId: schedulingMatchId,
        tournamentId: selectedTourneyId,
      });

      setSyncedToCalendar(true);
      setTimeout(() => {
        setSchedulingMatchId(null);
        setSyncedToCalendar(false);
      }, 1400);
    } catch (err) {
      console.error("Failed to save schedule:", err);
    } finally {
      setScheduleSaving(false);
    }
  };

  /* ─── Match result modal ─── */
  const activeMatch = matchesState?.find((m) => m.id === editingMatchId);
  const modalTeamA = activeMatch?.teamA || "Team A";
  const modalTeamB = activeMatch?.teamB || "Team B";
  const isTbdMatch = modalTeamA === "TBD" || modalTeamB === "TBD";

  useEffect(() => {
    if (activeMatch) {
      setModalScoreA(activeMatch.scoreA || 0);
      setModalScoreB(activeMatch.scoreB || 0);
      setModalWinner(activeMatch.winner === activeMatch.teamB ? "teamB" : "teamA");
    }
  }, [activeMatch]);

  const handleModalSubmit = async () => {
    if (!editingMatchId || !tournaments) return;
    const winnerName = modalWinner === "teamA" ? modalTeamA : modalTeamB;
    try {
      await fsUpdateMatch(editingMatchId, { status: "completed", scoreA: modalScoreA, scoreB: modalScoreB, winner: winnerName });
      if (matchesState && tournaments) {
        const tourney = tournaments.find((t) => t.id === selectedTourneyId);
        if (tourney && tourney.format !== "Round Robin") {
          const updated = propagateWinner(matchesState, tourney, editingMatchId, winnerName);
          for (const m of updated) {
            const orig = matchesState.find((o) => o.id === m.id);
            if (orig && (orig.teamA !== m.teamA || orig.teamB !== m.teamB)) {
              await fsUpdateMatch(m.id, { teamA: m.teamA, teamB: m.teamB });
            }
          }
        }
        // Update matchesPlayed count on tournament
        const tourney2 = tournaments.find((t) => t.id === selectedTourneyId);
        if (tourney2) {
          await fsUpdateTournament(selectedTourneyId, { matchesPlayed: (tourney2.matchesPlayed ?? 0) + 1 });
        }
      }
    } catch (err) {
      console.error("Failed to save match result:", err);
    }
    setEditingMatchId(null);
  };

  /* ─── Scheduling match init ─── */
  const openSchedule = (matchId: string) => {
    const match = matchesState?.find((m) => m.id === matchId);
    setSchedulingMatchId(matchId);
    setScheduleDate(match?.date && match.date !== new Date().toISOString().split("T")[0] ? match.date : "");
    setScheduleTime(match?.time && match.time !== "TBD" ? match.time : "");
    setSyncedToCalendar(false);
  };

  const hoverModes: { label: string; value: HoverMode }[] = [
    { label: "GLOW", value: "glow" },
    { label: "LIFT", value: "lift" },
    { label: "DIM",  value: "dim"  },
    { label: "OFF",  value: "off"  },
  ];

  if (!selectedBracket && brackets.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--c-text-dim)" }}>
        No tournaments found.
      </div>
    );
  }

  const rounds     = selectedBracket?.rounds ?? [];
  const totalRounds = rounds.length;
  const hasNoMatches = rounds.length === 0;
  const isRoundRobin = selectedBracket?.format === "Round Robin";

  const derivedTiers = selectedTournament ? tiersForTeams(selectedTournament.maxTeams) : 3;

  const canGenerate = selectedBracket &&
    selectedBracket.status === "ongoing" &&
    selectedBracket.teamsList.length >= selectedBracket.maxTeams &&
    hasNoMatches;

  const needsMoreTeams = selectedBracket &&
    selectedBracket.status === "registration" &&
    selectedBracket.teamsList.length < selectedBracket.maxTeams;

  const showCompleteButton = showActions && selectedBracket?.status === "ongoing" && isBracketComplete();

  return (
    <div style={{ width: "100%" }}>

      {/* ─── Top bar ─── */}
      <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:20, padding:"14px 20px", borderRadius:10, backgroundColor:"var(--c-surface2)", border:"1px solid var(--c-border)" }}>
        <span style={{ fontFamily:"'Rajdhani', sans-serif", fontWeight:700, fontSize:16, textTransform:"uppercase", letterSpacing:"3px", color:"var(--c-text)" }}>
          PLAYOFF BRACKETS
        </span>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <select
            value={selectedTourneyId}
            onChange={(e) => { setSelectedTourneyId(e.target.value); setGenerateError(null); }}
            className="dash-select"
            style={{ minWidth:220, fontSize:13, padding:"8px 14px" }}
          >
            {brackets.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.game}) — {b.status}</option>
            ))}
          </select>
          {showActions && (
            <div style={{ display:"flex", gap:4 }}>
              {hoverModes.map((m) => (
                <button key={m.value} onClick={() => setHoverMode(m.value)} style={{ padding:"6px 10px", borderRadius:6, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", cursor:"pointer", border: hoverMode === m.value ? "1px solid #8B5CF6" : "1px solid var(--c-border)", backgroundColor: hoverMode === m.value ? "rgba(139,92,246,0.15)" : "transparent", color: hoverMode === m.value ? "#8B5CF6" : "var(--c-text-dim)" }}>
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Info bar ─── */}
      {selectedBracket && (
        <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:16, padding:"10px 16px", borderRadius:8, backgroundColor:"var(--c-surface2)", border:"1px solid var(--c-border)", fontSize:11, marginBottom:20 }}>
          <span style={{ color:"var(--c-text-dim)", textTransform:"uppercase", letterSpacing:"1px" }}>Status:</span>
          <span style={{ fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", fontSize:10, padding:"2px 8px", borderRadius:4, color: selectedBracket.status === "completed" ? "#00F5D4" : selectedBracket.status === "ongoing" ? "#FACC15" : "#8B5CF6", backgroundColor: selectedBracket.status === "completed" ? "rgba(0,245,212,0.1)" : selectedBracket.status === "ongoing" ? "rgba(250,204,21,0.1)" : "rgba(139,92,246,0.1)" }}>
            {selectedBracket.status}
          </span>
          <span style={{ color:"var(--c-text-dim)", textTransform:"uppercase", letterSpacing:"1px" }}>Format:</span>
          <span style={{ fontWeight:600, color:"var(--c-text)" }}>{selectedBracket.format}</span>
          <span style={{ color:"var(--c-text-dim)", textTransform:"uppercase", letterSpacing:"1px" }}>Teams:</span>
          <span style={{ fontWeight:600, color:"var(--c-text)" }}>{selectedBracket.teamsList.length}/{selectedBracket.maxTeams}</span>
          <span style={{ color:"var(--c-text-dim)", textTransform:"uppercase", letterSpacing:"1px" }}>Rounds:</span>
          <span style={{ fontWeight:600, color:"var(--c-text)" }}>{totalRounds || "—"}</span>
          {showCompleteButton && (
            <button
              onClick={handleMarkComplete}
              disabled={markingComplete}
              style={{ marginLeft:"auto", padding:"6px 16px", borderRadius:8, border:"none", backgroundColor:"#00F5D4", color:"#000", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", cursor:"pointer", opacity: markingComplete ? 0.6 : 1 }}
            >
              {markingComplete ? "Marking…" : "🏆 Mark Tournament Complete"}
            </button>
          )}
        </div>
      )}

      {/* ─── Bracket content ─── */}
      {hasNoMatches ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px", borderRadius:12, backgroundColor:"var(--c-surface2)", border:"1px dashed var(--c-border)", textAlign:"center" }}>
          <div style={{ fontSize:40, marginBottom:16 }}>🏆</div>
          {needsMoreTeams ? (
            <>
              <h3 style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:8 }}>Teams Required</h3>
              <p style={{ fontSize:13, color:"var(--c-text-dim)", maxWidth:400 }}>
                This tournament needs <strong>{selectedBracket!.maxTeams}</strong> teams but only <strong>{selectedBracket!.teamsList.length}</strong> are registered. Register more teams in the Tournaments module.
              </p>
            </>
          ) : selectedBracket?.status === "registration" ? (
            <>
              <h3 style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:8 }}>Tournament Not Started Yet</h3>
              <p style={{ fontSize:13, color:"var(--c-text-dim)", maxWidth:400 }}>
                All {selectedBracket.maxTeams} team slots are filled. Go to Tournaments and click <strong>Start</strong> to begin the tournament, then return here to generate the bracket.
              </p>
            </>
          ) : (
            <>
              <h3 style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:8 }}>No Bracket Generated Yet</h3>
              {showActions && canGenerate && (
                <>
                  {generateError && (
                    <div style={{ fontSize:12, color:"#FF4655", backgroundColor:"rgba(255,70,85,0.1)", border:"1px solid rgba(255,70,85,0.3)", borderRadius:8, padding:"10px 16px", maxWidth:480, marginBottom:16, textAlign:"left" }}>
                      ⚠️ {generateError}
                    </div>
                  )}
                  {selectedBracket?.format === "Round Robin" ? (
                    <p style={{ fontSize:13, color:"var(--c-text-dim)", maxWidth:420, marginBottom:20 }}>
                      Round Robin: every team plays each other. <strong>{selectedBracket.maxTeams} teams</strong> → <strong>{(selectedBracket.maxTeams * (selectedBracket.maxTeams - 1)) / 2} matches</strong> total.
                    </p>
                  ) : (
                    <>
                      <p style={{ fontSize:13, color:"var(--c-text-dim)", maxWidth:420, marginBottom:12 }}>
                        Single Elimination — <strong>{selectedBracket!.maxTeams} teams</strong> → auto-calculated <strong>{derivedTiers} tiers</strong>.
                      </p>
                      {/* Editable round names */}
                      <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:20 }}>
                        {(roundNames.length === derivedTiers ? roundNames : buildRoundNames(derivedTiers)).map((name, i) => (
                          <div key={i} style={{ display:"flex", alignItems:"center", gap:4 }}>
                            {editingRound === i ? (
                              <input
                                value={roundInput}
                                onChange={(e) => setRoundInput(e.target.value)}
                                onBlur={() => {
                                  if (roundInput.trim()) {
                                    const base = roundNames.length === derivedTiers ? roundNames : buildRoundNames(derivedTiers);
                                    const updated = [...base];
                                    updated[i] = roundInput.trim();
                                    setRoundNames(updated);
                                  }
                                  setEditingRound(null);
                                }}
                                autoFocus
                                style={{ width:120, padding:"4px 8px", borderRadius:6, border:"1px solid #8B5CF6", backgroundColor:"var(--c-surface3)", color:"var(--c-text)", fontSize:12 }}
                              />
                            ) : (
                              <button onClick={() => { setEditingRound(i); setRoundInput(name); }} style={{ padding:"4px 10px", borderRadius:6, border:"1px solid var(--c-border)", backgroundColor:"var(--c-surface3)", color:"var(--c-text-dim)", fontSize:11, cursor:"pointer" }}>
                                ✏️ {name}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <button onClick={handleGenerateBracket} className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-lg transition-colors">
                    Generate {selectedBracket?.format === "Round Robin" ? "Round Robin Schedule" : "Bracket"}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      ) : isRoundRobin ? (
        /* ─── Round Robin table view ─── */
        <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
          {rounds.map((round) => (
            <div key={round.title}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px", color:"var(--c-text-dim)", marginBottom:10, padding:"6px 10px", borderRadius:6, backgroundColor:"var(--c-surface2)", border:"1px solid var(--c-border)", display:"inline-block" }}>
                {round.title}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {round.matches.map((match) => (
                  <div key={match.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:8, backgroundColor:"var(--c-surface2)", border:"1px solid var(--c-border)" }}>
                    <div style={{ flex:1, display:"flex", alignItems:"center", gap:8 }}>
                      <TeamLogo name={match.teamA.name} size={20} />
                      <span style={{ fontSize:12, fontWeight: match.teamA.isWinner ? 700 : 400, color: match.teamA.isWinner ? "#00F5D4" : "var(--c-text)" }}>{match.teamA.name}</span>
                    </div>
                    <div style={{ fontSize:11, fontWeight:700, color:"var(--c-text-dim)", minWidth:60, textAlign:"center" }}>
                      {match.status === "completed" ? `${match.teamA.score} — ${match.teamB.score}` : "VS"}
                    </div>
                    <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, justifyContent:"flex-end" }}>
                      <span style={{ fontSize:12, fontWeight: match.teamB.isWinner ? 700 : 400, color: match.teamB.isWinner ? "#00F5D4" : "var(--c-text)" }}>{match.teamB.name}</span>
                      <TeamLogo name={match.teamB.name} size={20} />
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:8 }}>
                      <span style={{ fontSize:9, color: match.time === "TBD" ? "var(--c-text-dim)" : "#FACC15" }}>
                        {match.time === "TBD" ? "⏰ TBD" : `📅 ${match.date} · ${fmt12(match.time ?? "TBD")}`}
                      </span>
                      {showActions && match.status !== "completed" && (
                        <button onClick={() => openSchedule(match.id)} style={{ fontSize:9, padding:"2px 8px", borderRadius:4, border:"1px solid var(--c-border)", backgroundColor:"transparent", color:"var(--c-text-dim)", cursor:"pointer" }}>
                          Schedule
                        </button>
                      )}
                      {showActions && (
                        <button onClick={() => setEditingMatchId(match.id)} style={{ fontSize:9, padding:"2px 8px", borderRadius:4, border:"1px solid #8B5CF6", backgroundColor:"rgba(139,92,246,0.1)", color:"#8B5CF6", cursor:"pointer" }}>
                          Result
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {showCompleteButton && (
            <div style={{ display:"flex", justifyContent:"center" }}>
              <button onClick={handleMarkComplete} disabled={markingComplete} style={{ padding:"10px 28px", borderRadius:8, border:"none", backgroundColor:"#00F5D4", color:"#000", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", cursor:"pointer", opacity: markingComplete ? 0.6 : 1 }}>
                {markingComplete ? "Marking…" : "🏆 Mark Tournament Complete"}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ─── Single Elimination bracket view ─── */
        <div style={{ overflowX:"auto", paddingBottom:16 }}>
          <div
            ref={bracketContainerRef}
            style={{ position:"relative", display:"grid", gridTemplateColumns:`repeat(${totalRounds}, minmax(180px, 1fr))`, gap:"clamp(24px,4vw,48px)", alignItems:"start", minWidth: totalRounds * 200, padding:"8px 4px" }}
          >
            <BracketConnectors lines={connectorLines} />
            {rounds.map((round, roundIndex) => {
              const verticalGap = roundIndex === 0 ? 16 : 16 + roundIndex * 56;
              const topPad = roundIndex === 0 ? 0 : (Math.pow(2, roundIndex) - 1) * 24;
              return (
                <div key={round.title} style={{ display:"flex", flexDirection:"column", gap:0, position:"relative", zIndex:2 }}>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px", color:"var(--c-text-dim)", marginBottom:12, textAlign:"center", padding:"6px 10px", borderRadius:6, backgroundColor:"var(--c-surface2)", border:"1px solid var(--c-border)" }}>
                    {round.title}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:verticalGap, paddingTop:topPad }}>
                    {round.matches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        hoverMode={hoverMode}
                        hoveredId={hoveredId}
                        onHover={setHoveredId}
                        onLeave={() => setHoveredId(null)}
                        matchRef={setMatchRef(match.id)}
                        onClick={() => showActions && setMatchesState && setEditingMatchId(match.id)}
                        onSchedule={() => openSchedule(match.id)}
                        isClickable={showActions && !!setMatchesState}
                        showScheduleBtn={showActions}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Legend ─── */}
      {!hasNoMatches && !isRoundRobin && (
        <div style={{ display:"flex", alignItems:"center", gap:20, marginTop:8, padding:"10px 16px", borderRadius:8, backgroundColor:"var(--c-surface2)", border:"1px solid var(--c-border)", fontSize:10, color:"var(--c-text-dim)", flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:24, height:2, backgroundColor:"var(--c-border2)", borderRadius:1 }} /><span>Flow Line</span></div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:10, height:10, borderRadius:4, backgroundColor:"rgba(0,245,212,0.15)", border:"1px solid #00F5D4" }} /><span>Winner</span></div>
          {showActions && <span style={{ marginLeft:"auto" }}>Click a match card to record results · Use Schedule button to set match date/time</span>}
        </div>
      )}

      {/* ─── Schedule Modal ─── */}
      {schedulingMatchId && (() => {
        const sm = matchesState?.find((m) => m.id === schedulingMatchId);
        const tourney = tournaments?.find((t) => t.id === selectedTourneyId);
        return (
          <div style={{ position:"fixed", top:0, left:0, width:"100vw", height:"100vh", backgroundColor:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9998, padding:16 }}>
            <div style={{ width:"100%", maxWidth:420, backgroundColor:"var(--c-surface2)", border:"1px solid var(--c-border)", borderRadius:12, padding:24, boxShadow:"0 20px 50px rgba(0,0,0,0.5)", color:"var(--c-text)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <h3 style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:16, fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px", color:"#fff", margin:0 }}>
                  Schedule Match
                </h3>
                <button onClick={() => setSchedulingMatchId(null)} style={{ background:"none", border:"none", color:"var(--c-text-dim)", cursor:"pointer", fontSize:18 }}>✕</button>
              </div>
              {sm && (
                <div style={{ marginBottom:16, padding:"10px 14px", borderRadius:8, backgroundColor:"var(--c-surface3)", border:"1px solid var(--c-border)", fontSize:12 }}>
                  <div style={{ color:"var(--c-text-dim)", fontSize:10, textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>{tourney?.name} · {sm.round}</div>
                  <div style={{ fontWeight:600, color:"#fff" }}>{sm.teamA} <span style={{ color:"var(--c-text-dim)" }}>vs</span> {sm.teamB}</div>
                </div>
              )}
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"1px", color:"var(--c-text-dim)", display:"block", marginBottom:6 }}>Match Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="dash-input"
                  />
                </div>
                <div>
                  <label style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"1px", color:"var(--c-text-dim)", display:"block", marginBottom:6 }}>Match Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="dash-input"
                  />
                </div>
                <div style={{ fontSize:10, color:"#8B5CF6", backgroundColor:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:6, padding:"8px 12px" }}>
                  📅 Setting a date/time will automatically create a Calendar event visible to all users.
                </div>
              </div>
              {syncedToCalendar && (
                <div style={{ marginTop:12, fontSize:11, color:"#00F5D4", backgroundColor:"rgba(0,245,212,0.08)", border:"1px solid rgba(0,245,212,0.2)", borderRadius:6, padding:"8px 12px", textAlign:"center" }}>
                  ✅ Saved and synced to Calendar!
                </div>
              )}
              <div style={{ display:"flex", gap:12, marginTop:20, justifyContent:"flex-end" }}>
                <button onClick={() => setSchedulingMatchId(null)} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid var(--c-border)", backgroundColor:"transparent", color:"var(--c-text-dim)", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  Cancel
                </button>
                <button
                  onClick={handleSaveSchedule}
                  disabled={scheduleSaving || !scheduleDate || !scheduleTime}
                  style={{ padding:"8px 20px", borderRadius:8, border:"none", backgroundColor: scheduleDate && scheduleTime ? "#8B5CF6" : "var(--c-border)", color: scheduleDate && scheduleTime ? "#fff" : "var(--c-text-dim)", fontSize:12, fontWeight:600, cursor: scheduleDate && scheduleTime ? "pointer" : "not-allowed", opacity: scheduleSaving ? 0.6 : 1 }}
                >
                  {scheduleSaving ? "Saving…" : "Save & Sync to Calendar"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── Match Result Modal ─── */}
      {editingMatchId && activeMatch && (
        <div style={{ position:"fixed", top:0, left:0, width:"100vw", height:"100vh", backgroundColor:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:16 }}>
          <div style={{ width:"100%", maxWidth:480, backgroundColor:"var(--c-surface2)", border:"1px solid var(--c-border)", borderRadius:12, padding:24, boxShadow:"0 20px 50px rgba(0,0,0,0.5)", color:"var(--c-text)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontFamily:"'Rajdhani', sans-serif", fontSize:18, fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px", color:"#fff", margin:0 }}>
                Record Match Result
              </h3>
              <button onClick={() => setEditingMatchId(null)} style={{ background:"none", border:"none", color:"var(--c-text-dim)", cursor:"pointer", fontSize:18 }}>✕</button>
            </div>
            {isTbdMatch ? (
              <div style={{ padding:"16px 0", color:"#FF4655", fontSize:13, textAlign:"center" }}>
                ⚠️ Cannot record results for TBD matchups. Wait for preceding rounds to resolve.
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                {[
                  { team: modalTeamA, score: modalScoreA, setScore: setModalScoreA, winner: "teamA" as const },
                  { team: modalTeamB, score: modalScoreB, setScore: setModalScoreB, winner: "teamB" as const },
                ].map((row, i) => (
                  <div key={i}>
                    {i === 1 && <div style={{ height:1, backgroundColor:"var(--c-border)", marginBottom:20 }} />}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <TeamLogo name={row.team} size={24} />
                        <span style={{ fontSize:14, fontWeight:600 }}>{row.team}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <input type="number" value={row.score} onChange={(e) => row.setScore(Number(e.target.value))} style={{ width:60, padding:"6px 8px", backgroundColor:"var(--c-surface3)", border:"1px solid var(--c-border)", borderRadius:6, color:"#fff", textAlign:"center" }} />
                        <button onClick={() => setModalWinner(row.winner)} style={{ padding:"6px 12px", borderRadius:6, fontSize:10, fontWeight:700, textTransform:"uppercase", cursor:"pointer", border: modalWinner === row.winner ? "1px solid #00F5D4" : "1px solid var(--c-border)", backgroundColor: modalWinner === row.winner ? "rgba(0,245,212,0.15)" : "transparent", color: modalWinner === row.winner ? "#00F5D4" : "var(--c-text-dim)" }}>
                          Winner
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display:"flex", gap:12, marginTop:28, justifyContent:"flex-end" }}>
              <button onClick={() => setEditingMatchId(null)} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid var(--c-border)", backgroundColor:"transparent", color:"var(--c-text-dim)", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                Cancel
              </button>
              {!isTbdMatch && (
                <button onClick={handleModalSubmit} style={{ padding:"8px 20px", borderRadius:8, border:"none", backgroundColor:"#FF4655", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  Submit Result
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
