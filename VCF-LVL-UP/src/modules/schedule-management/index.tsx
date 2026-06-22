"use client";
import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

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
  status: "pending" | "completed";
  tournamentId: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (iso: string) => {
  if (!iso) return "TBD";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
    });
  } catch { return iso; }
};

const fmt12 = (t: string) => {
  if (!t) return "TBD";
  try {
    const [h, m] = t.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = ((h + 11) % 12) + 1;
    return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
  } catch { return t; }
};

export default function ScheduleManagementModule() {
  const { profile } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "completed" | "all">("upcoming");

  const allowed = profile?.role === "gamer" || profile?.role === "organizer" || profile?.role === "admin";

  // ── Firestore listener — all matches, filter client-side by team ───────────
  useEffect(() => {
    if (!allowed) return;

    const q = query(collection(db, "matches"), orderBy("date", "asc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Match, "id">),
        }));

        // For gamers: show only matches their team is in
        // profile.teamId is the team doc ID, but matches store team *names*
        // We can't cheaply join here — the gamer reads team-viewer to see their
        // team name. Best approach: load team name from profile or pass it in.
        // Until full team-name denormalization is done, show all for gamers
        // (same experience as the old static file). Organizer/admin see all.
        setMatches(all);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [allowed]);

  if (!allowed) {
    return <div className="p-6 text-red-400 text-sm">Access denied.</div>;
  }

  // ── Filter by tab ─────────────────────────────────────────────────────────
  const now = new Date().toISOString().slice(0, 10);

  const displayed = matches.filter((m) => {
    if (tab === "upcoming") return m.status === "pending" || m.date >= now;
    if (tab === "completed") return m.status === "completed";
    return true;
  });

  const TABS: { key: typeof tab; label: string }[] = [
    { key: "upcoming",  label: "Upcoming"  },
    { key: "completed", label: "Completed" },
    { key: "all",       label: "All"       },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-xl font-bold">Match Schedule</h2>
        <p className="text-white/40 text-sm mt-0.5">
          Live from Firestore — {matches.length} match{matches.length !== 1 ? "es" : ""} total
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 text-sm rounded-md transition font-medium ${
              tab === key
                ? "bg-indigo-600 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 text-white/40 text-sm">Loading schedule…</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">
          No {tab === "all" ? "" : tab + " "}matches found.
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((m) => {
            const isCompleted = m.status === "completed";
            const winnerA = isCompleted && m.winner === m.teamA;
            const winnerB = isCompleted && m.winner === m.teamB;

            return (
              <div
                key={m.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                {/* Round + date */}
                <div className="min-w-[130px]">
                  <p className="text-indigo-400 text-xs font-medium uppercase tracking-wider">
                    {m.round || "Match"}
                  </p>
                  <p className="text-white text-sm font-medium mt-0.5">{fmtDate(m.date)}</p>
                  <p className="text-white/40 text-xs">{fmt12(m.time)}</p>
                </div>

                {/* Teams */}
                <div className="flex-1 flex items-center gap-3">
                  <span className={`font-semibold text-sm ${winnerA ? "text-emerald-400" : "text-white"}`}>
                    {m.teamA || "TBD"}
                  </span>

                  {isCompleted ? (
                    <span className="text-white/60 text-sm font-mono bg-white/10 px-3 py-1 rounded-lg">
                      {m.scoreA ?? 0} — {m.scoreB ?? 0}
                    </span>
                  ) : (
                    <span className="text-white/30 text-xs bg-white/5 px-3 py-1 rounded-lg">
                      VS
                    </span>
                  )}

                  <span className={`font-semibold text-sm ${winnerB ? "text-emerald-400" : "text-white"}`}>
                    {m.teamB || "TBD"}
                  </span>
                </div>

                {/* Status badge */}
                <div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      isCompleted
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {isCompleted ? "Completed" : "Pending"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
