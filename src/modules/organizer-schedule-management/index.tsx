"use client";
import { useState } from "react";
import { useOrganizerContext, fsUpdateMatch, fsAddCalendarEvent } from "@/lib/organizer-context";
import { useAuth } from "@/lib/auth-context";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const fmtDate = (iso: string) => {
  if (!iso) return "TBD";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
    });
  } catch { return iso; }
};

const fmt12 = (t: string) => {
  if (!t || t === "TBD") return "TBD";
  try {
    const [h, m] = t.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = ((h + 11) % 12) + 1;
    return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
  } catch { return t; }
};

/* ── Inline Schedule Editor ────────────────────────────────────────────────── */

interface ScheduleEditorProps {
  matchId: string;
  teamA: string;
  teamB: string;
  round: string;
  currentDate: string;
  currentTime: string;
  tournamentName?: string;
  tournamentId?: string;
  onClose: () => void;
}

function ScheduleEditor({
  matchId, teamA, teamB, round,
  currentDate, currentTime,
  tournamentName, tournamentId,
  onClose,
}: ScheduleEditorProps) {
  const { profile } = useAuth();
  const [date, setDate] = useState(currentDate && currentDate !== new Date().toISOString().split("T")[0] ? currentDate : "");
  const [time, setTime] = useState(currentTime && currentTime !== "TBD" ? currentTime : "");
  const [saving, setSaving] = useState(false);
  const [synced, setSynced] = useState(false);

  const handleSave = async () => {
    if (!date || !time) return;
    setSaving(true);
    try {
      await fsUpdateMatch(matchId, { date, time });

      const eventTitle = `${tournamentName ?? "Match"}: ${teamA} vs ${teamB} (${round})`;
      await fsAddCalendarEvent({
        title: eventTitle,
        date,
        time,
        status: "approved",
        submittedBy: profile?.uid ?? "organizer",
        submittedByName: profile ? `${profile.firstName} ${profile.lastName}`.trim() : "Organizer",
        matchId,
        tournamentId,
      });

      setSynced(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      console.error("Failed to schedule match:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: 12, padding: "14px 16px", borderRadius: 8, backgroundColor: "var(--c-surface3)", border: "1px solid rgba(139,92,246,0.4)" }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1px", color: "#8B5CF6", marginBottom: 10 }}>Set Date & Time</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="dash-input"
          style={{ flex: 1, minWidth: 140 }}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="dash-input"
          style={{ flex: 1, minWidth: 120 }}
        />
        <button
          onClick={handleSave}
          disabled={saving || !date || !time}
          style={{ padding: "8px 16px", borderRadius: 6, border: "none", backgroundColor: date && time ? "#8B5CF6" : "var(--c-border)", color: date && time ? "#fff" : "var(--c-text-dim)", fontSize: 11, fontWeight: 700, cursor: date && time ? "pointer" : "not-allowed", opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "Saving…" : synced ? "✅ Saved!" : "Save & Sync"}
        </button>
        <button
          onClick={onClose}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--c-border)", backgroundColor: "transparent", color: "var(--c-text-dim)", fontSize: 11, cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
      {synced && (
        <div style={{ marginTop: 8, fontSize: 10, color: "#00F5D4" }}>
          ✓ Calendar event created automatically.
        </div>
      )}
      {date && time && !synced && (
        <div style={{ marginTop: 8, fontSize: 10, color: "var(--c-text-dim)" }}>
          📅 Saving will auto-create a calendar event visible on the Calendar module.
        </div>
      )}
    </div>
  );
}

/* ── Main Module ─────────────────────────────────────────────────────────────── */

type TabKey = "upcoming" | "completed" | "all";

export default function OrganizerScheduleModule() {
  const { matchesState, tournaments, loading } = useOrganizerContext();

  const [tab, setTab] = useState<TabKey>("upcoming");
  const [filterTournamentId, setFilterTournamentId] = useState<string>("all");
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

  const now = new Date().toISOString().slice(0, 10);

  // Build tournament lookup for display names
  const tourneyMap = Object.fromEntries(tournaments.map((t) => [t.id, t]));

  // Filter matches
  const filtered = matchesState.filter((m) => {
    const tabMatch =
      tab === "upcoming" ? (m.status === "pending" || (m.date >= now && m.status !== "completed")) :
      tab === "completed" ? m.status === "completed" :
      true;
    const tourneyMatch = filterTournamentId === "all" || m.tournamentId === filterTournamentId;
    return tabMatch && tourneyMatch;
  });

  // Sort upcoming by date, then pending at end
  const sorted = [...filtered].sort((a, b) => {
    if (tab === "completed") return 0;
    if (!a.date && b.date) return 1;
    if (a.date && !b.date) return -1;
    if (a.date && b.date && a.date !== b.date) return a.date.localeCompare(b.date);
    return 0;
  });

  const TABS: { key: TabKey; label: string }[] = [
    { key: "upcoming",  label: "Upcoming"  },
    { key: "completed", label: "Completed" },
    { key: "all",       label: "All"       },
  ];

  const statusColor = (s: string) =>
    s === "completed" ? { color: "#00F5D4", bg: "rgba(0,245,212,0.08)" } : { color: "#FACC15", bg: "rgba(250,204,21,0.08)" };

  const unscheduled = matchesState.filter((m) => m.status === "pending" && (!m.time || m.time === "TBD")).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="text-theme text-xl font-bold">Match Schedule</h2>
          <p className="text-muted text-sm mt-0.5">
            {matchesState.length} match{matchesState.length !== 1 ? "es" : ""} total
            {unscheduled > 0 && (
              <span style={{ marginLeft: 8, color: "#FACC15" }}>· {unscheduled} unscheduled</span>
            )}
          </p>
        </div>
        {/* Tournament filter */}
        <select
          value={filterTournamentId}
          onChange={(e) => setFilterTournamentId(e.target.value)}
          className="dash-select"
          style={{ minWidth: 200 }}
        >
          <option value="all">All Tournaments</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface3 border border-theme rounded-lg p-1 w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 text-sm rounded-md transition font-medium ${
              tab === key
                ? "bg-indigo-600 text-white"
                : "text-muted hover:text-theme"
            }`}
            style={{ border: "none", cursor: "pointer" }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 text-muted text-sm">Loading schedule…</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-dim text-sm">
          No {tab === "all" ? "" : tab + " "}matches
          {filterTournamentId !== "all" ? ` for ${tourneyMap[filterTournamentId]?.name ?? "this tournament"}` : ""}.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.map((m) => {
            const isCompleted = m.status === "completed";
            const winnerA = isCompleted && m.winner === m.teamA;
            const winnerB = isCompleted && m.winner === m.teamB;
            const isUnscheduled = !m.time || m.time === "TBD";
            const sc = statusColor(m.status);
            const tourney = m.tournamentId ? tourneyMap[m.tournamentId] : undefined;
            const isEditing = editingMatchId === m.id;

            return (
              <div
                key={m.id}
                style={{
                  backgroundColor: "var(--c-surface2)",
                  border: "1px solid var(--c-border)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  transition: "border-color 0.15s, background-color 0.25s",
                  ...(isEditing ? { borderColor: "rgba(139,92,246,0.5)" } : {}),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  {/* Round + Date/Time column */}
                  <div style={{ minWidth: 140 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "#818CF8", marginBottom: 2 }}>
                      {m.round || "Match"}
                    </div>
                    {tourney && (
                      <div style={{ fontSize: 10, color: "var(--c-text-dim)", marginBottom: 3 }}>{tourney.name}</div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 500, color: isUnscheduled ? "var(--c-text-dim)" : "var(--c-text)" }}>
                      {isUnscheduled ? "⏰ Not scheduled" : fmtDate(m.date)}
                    </div>
                    {!isUnscheduled && (
                      <div style={{ fontSize: 11, color: "var(--c-text-muted)" }}>{fmt12(m.time)}</div>
                    )}
                  </div>

                  {/* Teams */}
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: winnerA ? "#34D399" : "var(--c-text)" }}>
                      {m.teamA || "TBD"}
                    </span>
                    {isCompleted ? (
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text-muted)", backgroundColor: "var(--c-surface3)", padding: "4px 12px", borderRadius: 8, fontFamily: "monospace" }}>
                        {m.scoreA ?? 0} — {m.scoreB ?? 0}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--c-text-dim)", backgroundColor: "var(--c-surface)", padding: "3px 10px", borderRadius: 6 }}>
                        VS
                      </span>
                    )}
                    <span style={{ fontWeight: 600, fontSize: 13, color: winnerB ? "#34D399" : "var(--c-text)" }}>
                      {m.teamB || "TBD"}
                    </span>
                  </div>

                  {/* Right side: status + actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, backgroundColor: sc.bg, color: sc.color }}>
                      {isCompleted ? "Completed" : "Pending"}
                    </span>
                    {!isCompleted && (
                      <button
                        onClick={() => setEditingMatchId(isEditing ? null : m.id)}
                        style={{
                          fontSize: 10, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600,
                          border: isEditing ? "1px solid #8B5CF6" : "1px solid var(--c-border)",
                          backgroundColor: isEditing ? "rgba(139,92,246,0.2)" : "transparent",
                          color: isEditing ? "#8B5CF6" : "var(--c-text-muted)",
                          transition: "all 0.15s",
                        }}
                      >
                        {isEditing ? "Cancel" : isUnscheduled ? "📅 Schedule" : "✏️ Edit"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline schedule editor */}
                {isEditing && !isCompleted && (
                  <ScheduleEditor
                    matchId={m.id}
                    teamA={m.teamA}
                    teamB={m.teamB}
                    round={m.round}
                    currentDate={m.date}
                    currentTime={m.time}
                    tournamentName={tourney?.name}
                    tournamentId={m.tournamentId}
                    onClose={() => setEditingMatchId(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
