"use client";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  winner: string;
  scoreA: number;
  scoreB: number;
  status: "pending" | "completed";
  tournamentId?: string | null;
}

interface Standing {
  team: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
}

export default function StandingsManagementModule() {
  const { profile } = useAuth();

  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [tournamentIds, setTournamentIds] = useState<string[]>([]);

  const allowed =
    profile?.role === "organizer" || profile?.role === "admin";

  // ── Listen to completed matches ───────────────────────────────────────────
  useEffect(() => {
    if (!allowed) return;

    const q = query(
      collection(db, "matches"),
      where("status", "==", "completed")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const matches = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Match, "id">),
        }));

        // Collect unique tournament IDs for filter dropdown
        const tIds = [...new Set(matches.map((m) => m.tournamentId ?? "").filter(Boolean))];
        setTournamentIds(tIds);

        // Filter if a tournament is selected
        const filtered =
          filter === "all" ? matches : matches.filter((m) => m.tournamentId === filter);

        // Build standings map
        const map: Record<string, Standing> = {};

        const ensure = (name: string) => {
          if (!map[name]) {
            map[name] = { team: name, played: 0, wins: 0, losses: 0, points: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0 };
          }
        };

        for (const m of filtered) {
          if (!m.teamA || !m.teamB || m.teamA === "TBD" || m.teamB === "TBD") continue;

          ensure(m.teamA);
          ensure(m.teamB);

          map[m.teamA].played++;
          map[m.teamB].played++;
          map[m.teamA].goalsFor   += m.scoreA ?? 0;
          map[m.teamA].goalsAgainst += m.scoreB ?? 0;
          map[m.teamB].goalsFor   += m.scoreB ?? 0;
          map[m.teamB].goalsAgainst += m.scoreA ?? 0;

          if (m.winner === m.teamA) {
            map[m.teamA].wins++;
            map[m.teamA].points += 3;
            map[m.teamB].losses++;
          } else if (m.winner === m.teamB) {
            map[m.teamB].wins++;
            map[m.teamB].points += 3;
            map[m.teamA].losses++;
          }
        }

        // Compute goal diff
        for (const s of Object.values(map)) {
          s.goalDiff = s.goalsFor - s.goalsAgainst;
        }

        // Sort: points desc → goalDiff desc → goalsFor desc → name asc
        const sorted = Object.values(map).sort((a, b) =>
          b.points !== a.points ? b.points - a.points :
          b.goalDiff !== a.goalDiff ? b.goalDiff - a.goalDiff :
          b.goalsFor !== a.goalsFor ? b.goalsFor - a.goalsFor :
          a.team.localeCompare(b.team)
        );

        setStandings(sorted);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [allowed, filter]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (!allowed) {
    return (
      <div className="p-6 text-red-400 text-sm">
        Access denied.
      </div>
    );
  }

  const rankColor = (i: number) =>
    i === 0 ? "text-yellow-400" :
    i === 1 ? "text-slate-300" :
    i === 2 ? "text-amber-600" : "text-white/50";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-white text-xl font-bold">Standings</h2>
          <p className="text-white/40 text-sm mt-0.5">
            Computed live from completed match results
          </p>
        </div>

        {tournamentIds.length > 0 && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Tournaments</option>
            {tournamentIds.map((id) => (
              <option key={id} value={id}>
                Tournament {id.slice(0, 8)}…
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-white/40 text-sm">
          Loading standings…
        </div>
      ) : standings.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">
          No completed matches yet. Standings will appear once results are recorded.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-white/50 uppercase text-[11px] tracking-wider">
                <th className="px-4 py-3 text-left w-8">#</th>
                <th className="px-4 py-3 text-left">Team</th>
                <th className="px-4 py-3 text-center">P</th>
                <th className="px-4 py-3 text-center">W</th>
                <th className="px-4 py-3 text-center">L</th>
                <th className="px-4 py-3 text-center">GF</th>
                <th className="px-4 py-3 text-center">GA</th>
                <th className="px-4 py-3 text-center">GD</th>
                <th className="px-4 py-3 text-center font-bold text-white/70">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {standings.map((s, i) => (
                <tr
                  key={s.team}
                  className="hover:bg-white/5 transition text-white"
                >
                  <td className={`px-4 py-3 font-bold text-sm ${rankColor(i)}`}>
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">{s.team}</td>
                  <td className="px-4 py-3 text-center text-white/70">{s.played}</td>
                  <td className="px-4 py-3 text-center text-emerald-400">{s.wins}</td>
                  <td className="px-4 py-3 text-center text-red-400">{s.losses}</td>
                  <td className="px-4 py-3 text-center text-white/60">{s.goalsFor}</td>
                  <td className="px-4 py-3 text-center text-white/60">{s.goalsAgainst}</td>
                  <td className={`px-4 py-3 text-center ${s.goalDiff > 0 ? "text-emerald-400" : s.goalDiff < 0 ? "text-red-400" : "text-white/50"}`}>
                    {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-indigo-400">
                    {s.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-white/20 text-[11px]">
        P = Played · W = Wins · L = Losses · GF = Goals For · GA = Goals Against · GD = Goal Difference · PTS = Points
      </p>
    </div>
  );
}
