"use client";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import StatCard from "@/components/shared/stat-card";

interface TournamentDoc {
  id: string;
  name: string;
  game: string;
  season: number;
  teamsRegistered: number;
  maxTeams: number;
  matchesPlayed: number;
  totalMatches: number;
  status: "registration" | "ongoing" | "completed";
}

function statusStyle(status: string) {
  if (status === "ongoing")      return { className: "bg-[#FF4655]/20 text-[#FF4655]",  style: {} };
  if (status === "registration") return { className: "bg-[#00F5D4]/15 text-[#00F5D4]",  style: {} };
  return { className: "text-[#808080]", style: { backgroundColor: "var(--c-surface3)" } };
}

export default function TournamentMonitorModule() {
  const { profile, profileError, loading: authLoading } = useAuth();
  const [tournaments, setTournaments] = useState<TournamentDoc[]>([]);
  const [loading,     setLoading]     = useState(true);

  // Aggregate counts
  const totalPlayers     = tournaments.reduce((s, t) => s + t.teamsRegistered * 5, 0);
  const totalTeams       = tournaments.reduce((s, t) => s + t.teamsRegistered, 0);
  const totalTournaments = tournaments.length;
  const matchesDone      = tournaments.reduce((s, t) => s + t.matchesPlayed, 0);

  useEffect(() => {
    // Only stop fetching once we've CONFIRMED the user isn't an admin.
    // An unresolved profile (still loading, or a transient profileError)
    // should not tear down a listener that may already be running.
    if (profile && profile.role !== "admin") {
      setLoading(false);
      return;
    }
    if (!profile) {
      return;
    }

    const q = query(collection(db, "tournaments"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTournaments(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TournamentDoc, "id">) }))
        );
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [profile]);

  if (profile && profile.role !== "admin") {
    return (
      <div className="dash-card p-6 text-center" style={{ color: "var(--c-text-muted)" }}>
        Access restricted to admins.
      </div>
    );
  }

  if (!profile && !authLoading && profileError) {
    return (
      <div className="dash-card p-6 text-center" style={{ color: "var(--c-text-muted)" }}>
        Couldn't verify your role right now. Try refreshing the page.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary stat cards — derived from live Firestore data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={loading ? "—" : String(totalPlayers)}     label="Total Players"   accent="teal" />
        <StatCard value={loading ? "—" : String(totalTeams)}       label="Total Teams" />
        <StatCard value={loading ? "—" : String(totalTournaments)} label="Tournaments"     accent="red" />
        <StatCard value={loading ? "—" : String(matchesDone)}      label="Matches Done"    accent="purple" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#FF4655] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="w-full border-collapse">
            <thead className="dash-thead">
              <tr>
                {["Tournament", "Game", "Teams", "Matches Played", "Status"].map((h) => (
                  <th key={h} className="dash-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tournaments.length === 0 && (
                <tr>
                  <td colSpan={5} className="dash-td text-center" style={{ color: "var(--c-text-muted)" }}>
                    No tournaments found.
                  </td>
                </tr>
              )}
              {tournaments.map((t) => {
                const { className, style } = statusStyle(t.status);
                return (
                  <tr key={t.id} className="dash-tr">
                    <td className="dash-td font-semibold">{t.name} S{t.season}</td>
                    <td className="dash-td-muted">{t.game}</td>
                    <td className="dash-td">{t.teamsRegistered}/{t.maxTeams}</td>
                    <td className="dash-td">{t.matchesPlayed}/{t.totalMatches}</td>
                    <td className="dash-td">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${className}`}
                        style={style}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
