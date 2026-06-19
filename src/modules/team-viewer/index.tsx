"use client";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import StatCard from "@/components/shared/stat-card";

interface TeamDoc {
  id: string;
  name: string;
  game: string;
  head: string;
  players: string[];   // array of player full names
  status: string;
}

export default function TeamViewerModule() {
  const { profile, loading: authLoading } = useAuth();
  const [team,    setTeam]    = useState<TeamDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!profile?.teamId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "teams", profile.teamId!));
        if (cancelled) return;
        if (snap.exists()) {
          setTeam({ id: snap.id, ...(snap.data() as Omit<TeamDoc, "id">) });
        } else {
          setError("Team document not found.");
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load team.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [profile?.teamId, authLoading]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-[#FF4655] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not on a team ────────────────────────────────────────────────────────
  if (!profile?.teamId || !team) {
    return (
      <div className="space-y-5">
        <div
          className="dash-card p-8 text-center"
          style={{ color: "var(--c-text-muted)" }}
        >
          {error ?? "You are not currently assigned to a team."}
        </div>
      </div>
    );
  }

  const maxPlayers = 5;
  const rosterFilled = `${team.players.length}/${maxPlayers}`;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard value={team.name}       label="Team Name"    accent="teal" />
        <StatCard value={rosterFilled}    label="Roster Slots" accent={team.players.length < maxPlayers ? "red" : undefined} />
        <StatCard value={team.game}       label="Game" />
      </div>

      {/* Roster table */}
      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {["#", "Player", "Role", "Status"].map((h) => (
                <th key={h} className="dash-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {team.players.map((playerName, idx) => {
              const isLeader = playerName === team.head;
              return (
                <tr key={idx} className="dash-tr">
                  <td className="dash-td-dim">{idx + 1}</td>
                  <td className="dash-td font-medium">{playerName}</td>
                  <td className="dash-td">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                        isLeader ? "bg-[#FF4655]/20 text-[#FF4655]" : ""
                      }`}
                      style={
                        !isLeader
                          ? { backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" }
                          : {}
                      }
                    >
                      {isLeader ? "Team Leader" : "Member"}
                    </span>
                  </td>
                  <td className="dash-td">
                    <span className="bg-[#00F5D4]/15 text-[#00F5D4] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                      active
                    </span>
                  </td>
                </tr>
              );
            })}

            {/* Empty roster slots */}
            {Array.from({ length: Math.max(0, maxPlayers - team.players.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="dash-tr">
                <td className="dash-td-dim">{team.players.length + i + 1}</td>
                <td className="dash-td-muted italic" colSpan={3}>— Open Slot —</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Team status footer */}
      <div className="dash-card p-4 flex items-center gap-3">
        <span className="dash-label" style={{ marginBottom: 0 }}>Team Status:</span>
        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
            team.status === "active"
              ? "bg-[#00F5D4]/15 text-[#00F5D4]"
              : "bg-[#FF4655]/20 text-[#FF4655]"
          }`}
        >
          {team.status}
        </span>
      </div>
    </div>
  );
}
