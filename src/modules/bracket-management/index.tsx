"use client";
import { useState, useRef, useEffect, useCallback, useContext, CSSProperties } from "react";
import { OrganizerContext, fsAddMatch, fsUpdateMatch, fsUpdateTournament } from "@/lib/organizer-context";

/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */

type HoverMode = "glow" | "lift" | "dim" | "off";

interface BracketTeamEntry {
  name: string;
  score?: number;
  isWinner?: boolean;
  color?: string;
  tag?: string;
}

interface BracketMatchEntry {
  id: string;
  teamA: BracketTeamEntry;
  teamB: BracketTeamEntry;
}

interface BracketRoundEntry {
  title: string;
  matches: BracketMatchEntry[];
}

interface TournamentBracketData {
  id: string;
  name: string;
  game: string;
  status: string;
  rounds: BracketRoundEntry[];
}

/* ═══════════════════════════════════════════════════════
   Sample Data — Two tournaments for selection
   ═══════════════════════════════════════════════════════ */

const TEAM_COLORS: Record<string, string> = {
  "Team Blaze": "#FF4655",
  "Team Storm": "#2563EB",
  "Team Frost": "#06B6D4",
  "Team Venom": "#A855F7",
  "Team Nova": "#F97316",
  "Team Apex": "#EC4899",
  "Team Forge": "#FACC15",
  "Team Rush": "#10B981",
  "Shadow Ops": "#6366F1",
  "Ghost Squad": "#14B8A6",
  "Bravo Six": "#EF4444",
  "Delta Force": "#F59E0B",
  "TBD": "#555",
};

function getTeamColor(name: string): string {
  return TEAM_COLORS[name] || "#" + Math.floor(Math.abs(Math.sin(name.length * 9301 + 49297) * 16777215) % 16777215).toString(16).padStart(6, "0");
}

function getTeamTag(name: string): string {
  if (name === "TBD") return "??";
  const words = name.replace(/^Team\s+/i, "").split(" ");
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return words[0].slice(0, 2).toUpperCase();
}

const tournamentBrackets: TournamentBracketData[] = [
  {
    id: "t1",
    name: "MLBB Championship",
    game: "MLBB",
    status: "ongoing",
    rounds: [
      {
        title: "Quarterfinals",
        matches: [
          { id: "qf1", teamA: { name: "Team Blaze", score: 2, isWinner: true }, teamB: { name: "Team Storm", score: 0 } },
          { id: "qf2", teamA: { name: "Team Frost", score: 2, isWinner: true }, teamB: { name: "Team Venom", score: 1 } },
          { id: "qf3", teamA: { name: "Team Nova" }, teamB: { name: "Team Apex" } },
          { id: "qf4", teamA: { name: "Team Forge" }, teamB: { name: "Team Rush" } },
        ],
      },
      {
        title: "Semifinals",
        matches: [
          { id: "sf1", teamA: { name: "Team Blaze" }, teamB: { name: "Team Frost" } },
          { id: "sf2", teamA: { name: "TBD" }, teamB: { name: "TBD" } },
        ],
      },
      {
        title: "Finals",
        matches: [
          { id: "f1", teamA: { name: "TBD" }, teamB: { name: "TBD" } },
        ],
      },
    ],
  },
  {
    id: "t2",
    name: "CODM Clash",
    game: "CODM",
    status: "registration",
    rounds: [
      {
        title: "Semifinals",
        matches: [
          { id: "csf1", teamA: { name: "Shadow Ops" }, teamB: { name: "Ghost Squad" } },
          { id: "csf2", teamA: { name: "Bravo Six" }, teamB: { name: "Delta Force" } },
        ],
      },
      {
        title: "Finals",
        matches: [
          { id: "cf1", teamA: { name: "TBD" }, teamB: { name: "TBD" } },
        ],
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════
   Team Logo (circle badge)
   ═══════════════════════════════════════════════════════ */

function TeamLogo({ name, size = 22 }: { name: string; size?: number }) {
  const color = getTeamColor(name);
  const tag = getTeamTag(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "50%",
        backgroundColor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        textTransform: "uppercase",
        letterSpacing: "0.3px",
      }}
    >
      {tag}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Match Card
   ═══════════════════════════════════════════════════════ */

function MatchCard({
  match,
  hoverMode,
  hoveredId,
  onHover,
  onLeave,
  matchRef,
  onClick,
  isClickable,
}: {
  match: BracketMatchEntry;
  hoverMode: HoverMode;
  hoveredId: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
  matchRef?: (el: HTMLDivElement | null) => void;
  onClick?: () => void;
  isClickable?: boolean;
}) {
  const isHovered = hoveredId === match.id;
  const isDimmed = hoverMode === "dim" && hoveredId !== null && !isHovered;

  const cardStyle: CSSProperties = {
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid var(--c-border)",
    backgroundColor: "var(--c-surface3)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: isClickable ? "pointer" : "default",
    width: "100%",
    ...(hoverMode === "glow" && isHovered
      ? { boxShadow: "0 0 20px rgba(139,92,246,0.5), 0 0 40px rgba(139,92,246,0.2)", borderColor: "#8B5CF6" }
      : {}),
    ...(hoverMode === "lift" && isHovered
      ? { transform: "translateY(-4px) scale(1.02)", boxShadow: "0 12px 32px rgba(0,0,0,0.5)" }
      : {}),
    ...(isDimmed ? { opacity: 0.25, filter: "grayscale(0.5)" } : {}),
  };

  const renderTeamRow = (team: BracketTeamEntry) => {
    const won = !!team.isWinner;
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          fontSize: 12,
          gap: 8,
          color: won ? "#fff" : "var(--c-text-muted)",
          backgroundColor: won ? "rgba(0,245,212,0.06)" : "transparent",
          transition: "background-color 0.2s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <TeamLogo name={team.name} size={20} />
          <span
            style={{
              fontWeight: won ? 600 : 400,
              color: won ? "#00F5D4" : undefined,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {team.name}
          </span>
        </div>
        {team.score !== undefined && (
          <div
            style={{
              minWidth: 24,
              height: 24,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
              color: won ? "#fff" : "var(--c-text-dim)",
              backgroundColor: won ? "#FF4655" : "transparent",
              border: won ? "none" : "1px solid var(--c-border)",
            }}
          >
            {team.score}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={matchRef}
      onMouseEnter={() => onHover(match.id)}
      onMouseLeave={onLeave}
      onClick={onClick}
      data-match-id={match.id}
    >
      <div style={cardStyle}>
        {renderTeamRow(match.teamA)}
        <div style={{ height: 1, backgroundColor: "var(--c-border)" }} />
        {renderTeamRow(match.teamB)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SVG Connector Lines (flow indicator)
   ═══════════════════════════════════════════════════════ */

interface ConnectorLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function BracketConnectors({ lines }: { lines: ConnectorLine[] }) {
  if (lines.length === 0) return null;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {lines.map((line, i) => {
        const midX = (line.x1 + line.x2) / 2;
        return (
          <path
            key={i}
            d={`M ${line.x1} ${line.y1} C ${midX} ${line.y1}, ${midX} ${line.y2}, ${line.x2} ${line.y2}`}
            stroke="var(--c-border2)"
            strokeWidth={1.5}
            fill="none"
            opacity={0.6}
            strokeDasharray="none"
          />
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   Main Bracket Module
   ═══════════════════════════════════════════════════════ */

const propagateWinner = (
  currentMatches: any[],
  tournament: any,
  completedMatchId: string,
  winner: string
) => {
  const tMatches = currentMatches.filter((m) => tournament.matchesList.includes(m.id));
  const completedMatch = currentMatches.find((m) => m.id === completedMatchId);
  if (!completedMatch) return currentMatches;

  const roundName = completedMatch.round;
  const roundOrder = ["Quarterfinals", "Semifinals", "Finals"];
  const currentRoundIdx = roundOrder.indexOf(roundName);

  if (currentRoundIdx === -1 || roundName === "Finals") {
    return currentMatches;
  }

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
      return {
        ...m,
        teamA: isTeamA ? winner : m.teamA,
        teamB: !isTeamA ? winner : m.teamB,
      };
    }
    return m;
  });
};

export default function BracketManagementModule({
  showActions = true,
}: {
  showActions?: boolean;
}) {
  // When showActions is true we're in organizer context — read shared state.
  // When false (gamer view) the context may not be present; fall back gracefully.
  const organizerCtx = useContext(OrganizerContext);
  const tournaments    = showActions ? organizerCtx?.tournaments    : undefined;
  const setTournaments = showActions ? organizerCtx?.setTournaments : undefined;
  const matchesState   = showActions ? organizerCtx?.matchesState   : undefined;
  const setMatchesState = showActions ? organizerCtx?.setMatchesState : undefined;

  const getFormattedBrackets = useCallback((): TournamentBracketData[] => {
    if (tournaments && matchesState) {
      return tournaments.map((t) => {
        const tMatches = matchesState.filter((m) => t.matchesList && t.matchesList.includes(m.id));

        const roundOrder = ["Quarterfinals", "Semifinals", "Finals"];
        const uniqueRounds = Array.from(new Set(tMatches.map((m) => m.round))).sort(
          (a, b) => roundOrder.indexOf(a) - roundOrder.indexOf(b)
        );

        const roundsList = uniqueRounds
          .map((rName) => {
            const roundMatches = tMatches.filter((m) => m.round === rName);
            return {
              title: rName,
              matches: roundMatches.map((m) => ({
                id: m.id,
                teamA: {
                  name: m.teamA,
                  score: m.status === "completed" ? m.scoreA : undefined,
                  isWinner: m.status === "completed" && m.winner === m.teamA,
                },
                teamB: {
                  name: m.teamB,
                  score: m.status === "completed" ? m.scoreB : undefined,
                  isWinner: m.status === "completed" && m.winner === m.teamB,
                },
              })),
            };
          })
          .filter((r) => r.matches.length > 0);

        return {
          id: t.id,
          name: t.name,
          game: t.game,
          status: t.status,
          rounds: roundsList,
        };
      });
    }

    return tournamentBrackets;
  }, [tournaments, matchesState]);

  const brackets = getFormattedBrackets();
  const [selectedTourneyId, setSelectedTourneyId] = useState("");
  const [hoverMode, setHoverMode] = useState<HoverMode>("glow");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [connectorLines, setConnectorLines] = useState<ConnectorLine[]>([]);

  // Modal State for Recording Results
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [modalScoreA, setModalScoreA] = useState(0);
  const [modalScoreB, setModalScoreB] = useState(0);
  const [modalWinner, setModalWinner] = useState<"teamA" | "teamB">("teamA");

  const bracketContainerRef = useRef<HTMLDivElement>(null);
  const matchRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const selectedBracket = brackets.find((b) => b.id === selectedTourneyId) ?? brackets[0];

  useEffect(() => {
    if (brackets.length > 0 && !selectedTourneyId) {
      setSelectedTourneyId(brackets[0].id);
    }
  }, [brackets, selectedTourneyId]);

  const setMatchRef = useCallback((matchId: string) => {
    return (el: HTMLDivElement | null) => {
      if (el) {
        matchRefs.current.set(matchId, el);
      } else {
        matchRefs.current.delete(matchId);
      }
    };
  }, []);

  /* ── Calculate connector lines ── */
  const calculateConnectors = useCallback(() => {
    if (!bracketContainerRef.current || !selectedBracket || !selectedBracket.rounds || selectedBracket.rounds.length === 0) {
      setConnectorLines([]);
      return;
    }

    const containerRect = bracketContainerRef.current.getBoundingClientRect();
    const rounds = selectedBracket.rounds;
    const newLines: ConnectorLine[] = [];

    for (let rIdx = 0; rIdx < rounds.length - 1; rIdx++) {
      const currentRound = rounds[rIdx];
      const nextRound = rounds[rIdx + 1];

      for (let nIdx = 0; nIdx < nextRound.matches.length; nIdx++) {
        const nextMatch = nextRound.matches[nIdx];
        const nextEl = matchRefs.current.get(nextMatch.id);
        if (!nextEl) continue;

        const nextRect = nextEl.getBoundingClientRect();
        const targetX = nextRect.left - containerRect.left;
        const targetY = nextRect.top - containerRect.top + nextRect.height / 2;

        const srcIdx1 = nIdx * 2;
        const srcIdx2 = nIdx * 2 + 1;

        [srcIdx1, srcIdx2].forEach((sIdx) => {
          if (sIdx < currentRound.matches.length) {
            const srcMatch = currentRound.matches[sIdx];
            const srcEl = matchRefs.current.get(srcMatch.id);
            if (!srcEl) return;

            const srcRect = srcEl.getBoundingClientRect();
            const sourceX = srcRect.right - containerRect.left;
            const sourceY = srcRect.top - containerRect.top + srcRect.height / 2;

            newLines.push({
              x1: sourceX + 4,
              y1: sourceY,
              x2: targetX - 4,
              y2: targetY,
            });
          }
        });
      }
    }

    setConnectorLines(newLines);
  }, [selectedBracket]);

  useEffect(() => {
    const timer = setTimeout(calculateConnectors, 100);
    window.addEventListener("resize", calculateConnectors);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateConnectors);
    };
  }, [calculateConnectors, selectedTourneyId, brackets]);

  const handleGenerateBracket = async () => {
    if (!selectedTourneyId || !tournaments) return;

    const selectedTourney = tournaments.find((t) => t.id === selectedTourneyId);
    if (!selectedTourney) return;

    const registeredTeams = selectedTourney.teamsList || [];
    const registeredTeamNames = registeredTeams.map((t: any) => t.name);
    const bracketSize = registeredTeamNames.length <= 4 ? 4 : 8;

    const defaultTeams = ["Shadow Ops", "Ghost Squad", "Bravo Six", "Delta Force", "Team Blaze", "Team Frost", "Team Storm", "Team Venom"];
    const teamSlots = [...registeredTeamNames];
    while (teamSlots.length < bracketSize) {
      const nextDefault = defaultTeams.find((d) => !teamSlots.includes(d));
      teamSlots.push(nextDefault || "TBD");
    }

    const today = new Date().toISOString().split("T")[0];
    const matchDefs: Omit<import("@/lib/organizer-context").Match, "id">[] =
      bracketSize === 4
        ? [
            { round: "Semifinals", teamA: teamSlots[0], teamB: teamSlots[1], winner: "", scoreA: 0, scoreB: 0, date: today, time: "2:00 PM", status: "pending", tournamentId: selectedTourneyId },
            { round: "Semifinals", teamA: teamSlots[2], teamB: teamSlots[3], winner: "", scoreA: 0, scoreB: 0, date: today, time: "4:00 PM", status: "pending", tournamentId: selectedTourneyId },
            { round: "Finals",     teamA: "TBD",         teamB: "TBD",         winner: "", scoreA: 0, scoreB: 0, date: today, time: "6:00 PM", status: "pending", tournamentId: selectedTourneyId },
          ]
        : [
            { round: "Quarterfinals", teamA: teamSlots[0], teamB: teamSlots[1], winner: "", scoreA: 0, scoreB: 0, date: today, time: "1:00 PM", status: "pending", tournamentId: selectedTourneyId },
            { round: "Quarterfinals", teamA: teamSlots[2], teamB: teamSlots[3], winner: "", scoreA: 0, scoreB: 0, date: today, time: "2:30 PM", status: "pending", tournamentId: selectedTourneyId },
            { round: "Quarterfinals", teamA: teamSlots[4], teamB: teamSlots[5], winner: "", scoreA: 0, scoreB: 0, date: today, time: "4:00 PM", status: "pending", tournamentId: selectedTourneyId },
            { round: "Quarterfinals", teamA: teamSlots[6], teamB: teamSlots[7], winner: "", scoreA: 0, scoreB: 0, date: today, time: "5:30 PM", status: "pending", tournamentId: selectedTourneyId },
            { round: "Semifinals",    teamA: "TBD",         teamB: "TBD",         winner: "", scoreA: 0, scoreB: 0, date: today, time: "7:00 PM", status: "pending", tournamentId: selectedTourneyId },
            { round: "Semifinals",    teamA: "TBD",         teamB: "TBD",         winner: "", scoreA: 0, scoreB: 0, date: today, time: "8:30 PM", status: "pending", tournamentId: selectedTourneyId },
            { round: "Finals",        teamA: "TBD",         teamB: "TBD",         winner: "", scoreA: 0, scoreB: 0, date: today, time: "9:00 PM", status: "pending", tournamentId: selectedTourneyId },
          ];

    try {
      const matchIds = await Promise.all(matchDefs.map((m) => fsAddMatch(m)));
      await fsUpdateTournament(selectedTourneyId, {
        status: "ongoing",
        matchesList: matchIds,
        teamsRegistered: teamSlots.length,
      });
    } catch (err) {
      console.error("Failed to generate bracket:", err);
    }
  };

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
      await fsUpdateMatch(editingMatchId, {
        status: "completed",
        scoreA: modalScoreA,
        scoreB: modalScoreB,
        winner: winnerName,
      });

      // Propagate winner to next bracket slot via Firestore
      if (matchesState && tournaments) {
        const selectedTourney = tournaments.find((t) => t.id === selectedTourneyId);
        if (selectedTourney) {
          const updatedLocal = propagateWinner(matchesState, selectedTourney, editingMatchId, winnerName);
          // Find any match that changed (the next-round slot that got a TBD filled in)
          for (const m of updatedLocal) {
            const original = matchesState.find((o) => o.id === m.id);
            if (original && (original.teamA !== m.teamA || original.teamB !== m.teamB)) {
              await fsUpdateMatch(m.id, { teamA: m.teamA, teamB: m.teamB });
            }
          }
        }
      }

      if (activeMatch && activeMatch.round === "Finals") {
        await fsUpdateTournament(selectedTourneyId!, { status: "completed" });
      }
    } catch (err) {
      console.error("Failed to save match result:", err);
    }

    setEditingMatchId(null);
  };

  const hoverModes: { label: string; value: HoverMode }[] = [
    { label: "GLOW", value: "glow" },
    { label: "LIFT", value: "lift" },
    { label: "DIM OTHERS", value: "dim" },
    { label: "OFF", value: "off" },
  ];

  if (!selectedBracket) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--c-text-dim)" }}>
        No tournament brackets available.
      </div>
    );
  }

  const rounds = selectedBracket.rounds;
  const totalRounds = rounds ? rounds.length : 0;
  const hasNoMatches = !rounds || rounds.length === 0;

  return (
    <div style={{ width: "100%" }}>
      {/* ─── Tournament Selector ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
          padding: "14px 20px",
          borderRadius: 10,
          backgroundColor: "var(--c-surface2)",
          border: "1px solid var(--c-border)",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: "#FF4655",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          V
        </div>
        <span
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            textTransform: "uppercase",
            letterSpacing: "3px",
            color: "var(--c-text)",
          }}
        >
          PLAYOFF BRACKETS
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <label
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "var(--c-text-dim)",
            }}
          >
            Tournament
          </label>
          <select
            value={selectedTourneyId}
            onChange={(e) => setSelectedTourneyId(e.target.value)}
            className="dash-select"
            style={{
              width: "auto",
              minWidth: 200,
              fontSize: 13,
              padding: "8px 14px",
              backgroundColor: "var(--c-surface3)",
              border: "1px solid var(--c-border)",
              borderRadius: 8,
              color: "var(--c-text)",
            }}
          >
            {brackets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.game}) — {b.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Hover Mode Toggle ─── */}
      {!hasNoMatches && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "var(--c-text-dim)",
              marginRight: 6,
            }}
          >
            HOVER
          </span>
          {hoverModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setHoverMode(mode.value)}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                border:
                  hoverMode === mode.value
                    ? "1px solid #8B5CF6"
                    : "1px solid var(--c-border)",
                color: hoverMode === mode.value ? "#fff" : "var(--c-text-dim)",
                backgroundColor:
                  hoverMode === mode.value
                    ? "rgba(139, 92, 246, 0.2)"
                    : "transparent",
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      )}

      {/* ─── Action Buttons ─── */}
      {showActions && hasNoMatches && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <button
            onClick={handleGenerateBracket}
            className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
          >
            Generate Bracket
          </button>
        </div>
      )}

      {/* ─── Tournament Info Bar ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
          padding: "10px 16px",
          borderRadius: 8,
          backgroundColor: "var(--c-surface2)",
          border: "1px solid var(--c-border)",
          fontSize: 11,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "1px" }}>Game:</span>
          <span
            style={{
              fontWeight: 700,
              color: selectedBracket.game === "MLBB" ? "#FACC15" : "#06B6D4",
              padding: "2px 8px",
              borderRadius: 4,
              backgroundColor: selectedBracket.game === "MLBB" ? "rgba(250,204,21,0.1)" : "rgba(6,182,212,0.1)",
            }}
          >
            {selectedBracket.game}
          </span>
        </div>
        <div style={{ width: 1, height: 16, backgroundColor: "var(--c-border)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "1px" }}>Status:</span>
          <span
            style={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 4,
              color:
                selectedBracket.status === "completed"
                  ? "#00F5D4"
                  : selectedBracket.status === "ongoing"
                  ? "#FACC15"
                  : "#8B5CF6",
              backgroundColor:
                selectedBracket.status === "completed"
                  ? "rgba(0,245,212,0.1)"
                  : selectedBracket.status === "ongoing"
                  ? "rgba(250,204,21,0.1)"
                  : "rgba(139,92,246,0.1)",
            }}
          >
            {selectedBracket.status}
          </span>
        </div>
        <div style={{ width: 1, height: 16, backgroundColor: "var(--c-border)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "1px" }}>Rounds:</span>
          <span style={{ fontWeight: 600, color: "var(--c-text)" }}>{totalRounds}</span>
        </div>
      </div>

      {/* ─── Bracket Content (Or Empty State) ─── */}
      {hasNoMatches ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 24px",
            borderRadius: 12,
            backgroundColor: "var(--c-surface2)",
            border: "1px dashed var(--c-border)",
            textAlign: "center",
            marginTop: 20,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}>🏆</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
            No Bracket Generated Yet
          </h3>
          <p style={{ fontSize: 13, color: "var(--c-text-dim)", maxWidth: 400, marginBottom: 20 }}>
            This tournament is currently in the <strong>{selectedBracket.status}</strong> phase.
            {showActions && " Generate the bracket to initialize the single-elimination matchups."}
          </p>
          {showActions && (
            <button
              onClick={handleGenerateBracket}
              className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-lg transition-colors"
            >
              Generate Bracket
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            paddingBottom: 16,
          }}
        >
          <div
            ref={bracketContainerRef}
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: `repeat(${totalRounds}, minmax(180px, 1fr))`,
              gap: "clamp(24px, 4vw, 48px)",
              alignItems: "start",
              minWidth: totalRounds * 200,
              padding: "8px 4px",
            }}
          >
            {/* SVG connector layer */}
            <BracketConnectors lines={connectorLines} />

            {/* Round columns */}
            {rounds.map((round, roundIndex) => {
              const verticalGap = roundIndex === 0 ? 16 : 16 + roundIndex * 56;
              const topPad = roundIndex === 0 ? 0 : (Math.pow(2, roundIndex) - 1) * 24;

              return (
                <div
                  key={round.title}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {/* Round header */}
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                      color: "var(--c-text-dim)",
                      marginBottom: 12,
                      textAlign: "center",
                      padding: "6px 10px",
                      borderRadius: 6,
                      backgroundColor: "var(--c-surface2)",
                      border: "1px solid var(--c-border)",
                    }}
                  >
                    {round.title}
                  </div>

                  {/* Match cards with spacing */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: verticalGap,
                      paddingTop: topPad,
                    }}
                  >
                    {round.matches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        hoverMode={hoverMode}
                        hoveredId={hoveredId}
                        onHover={setHoveredId}
                        onLeave={() => setHoveredId(null)}
                        matchRef={setMatchRef(match.id)}
                        onClick={() => setMatchesState && setEditingMatchId(match.id)}
                        isClickable={!!setMatchesState}
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
      {!hasNoMatches && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginTop: 8,
            padding: "10px 16px",
            borderRadius: 8,
            backgroundColor: "var(--c-surface2)",
            border: "1px solid var(--c-border)",
            fontSize: 10,
            color: "var(--c-text-dim)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 24, height: 2, backgroundColor: "var(--c-border2)", borderRadius: 1 }} />
            <span>Flow Line</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 4,
                backgroundColor: "rgba(0,245,212,0.15)",
                border: "1px solid #00F5D4",
              }}
            />
            <span>Winner</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#FF4655",
              }}
            />
            <span>Score Badge</span>
          </div>
        </div>
      )}

      {/* ─── Edit Result Modal ─── */}
      {editingMatchId && activeMatch && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              backgroundColor: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              color: "var(--c-text)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: "#fff",
                  margin: 0,
                }}
              >
                Record Match Result
              </h3>
              <button
                onClick={() => setEditingMatchId(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--c-text-dim)",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ✕
              </button>
            </div>

            {isTbdMatch ? (
              <div style={{ padding: "16px 0", color: "#FF4655", fontSize: 13, textAlign: "center" }}>
                ⚠️ Cannot record results for TBD matchups. Wait for preceding rounds to resolve.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Team A Field */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <TeamLogo name={modalTeamA} size={24} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{modalTeamA}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input
                      type="number"
                      value={modalScoreA}
                      onChange={(e) => setModalScoreA(Number(e.target.value))}
                      style={{
                        width: 60,
                        padding: "6px 8px",
                        backgroundColor: "var(--c-surface3)",
                        border: "1px solid var(--c-border)",
                        borderRadius: 6,
                        color: "#fff",
                        textAlign: "center",
                      }}
                    />
                    <button
                      onClick={() => setModalWinner("teamA")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        cursor: "pointer",
                        border: modalWinner === "teamA" ? "1px solid #00F5D4" : "1px solid var(--c-border)",
                        backgroundColor: modalWinner === "teamA" ? "rgba(0, 245, 212, 0.15)" : "transparent",
                        color: modalWinner === "teamA" ? "#00F5D4" : "var(--c-text-dim)",
                      }}
                    >
                      Winner
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, backgroundColor: "var(--c-border)" }} />

                {/* Team B Field */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <TeamLogo name={modalTeamB} size={24} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{modalTeamB}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input
                      type="number"
                      value={modalScoreB}
                      onChange={(e) => setModalScoreB(Number(e.target.value))}
                      style={{
                        width: 60,
                        padding: "6px 8px",
                        backgroundColor: "var(--c-surface3)",
                        border: "1px solid var(--c-border)",
                        borderRadius: 6,
                        color: "#fff",
                        textAlign: "center",
                      }}
                    />
                    <button
                      onClick={() => setModalWinner("teamB")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        cursor: "pointer",
                        border: modalWinner === "teamB" ? "1px solid #00F5D4" : "1px solid var(--c-border)",
                        backgroundColor: modalWinner === "teamB" ? "rgba(0, 245, 212, 0.15)" : "transparent",
                        color: modalWinner === "teamB" ? "#00F5D4" : "var(--c-text-dim)",
                      }}
                    >
                      Winner
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "flex-end" }}>
              <button
                onClick={() => setEditingMatchId(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--c-border)",
                  backgroundColor: "transparent",
                  color: "var(--c-text-dim)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              {!isTbdMatch && (
                <button
                  onClick={handleModalSubmit}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "none",
                    backgroundColor: "#FF4655",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
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
