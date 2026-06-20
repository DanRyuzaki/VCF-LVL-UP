"use client";
import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { fsUpdateTeam, fsUpdatePlayer, fsUpdateUserTeamId } from "@/lib/organizer-context";
import StatCard from "@/components/shared/stat-card";

interface TeamDoc {
  id: string;
  name: string;
  game: string;
  head: string;
  players: string[];         // array of player full names
  pendingPlayers: string[];  // names awaiting the leader's accept/reject
  status: string;
}

export default function TeamViewerModule() {
  const { profile, loading: authLoading } = useAuth();
  const [team,    setTeam]    = useState<TeamDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Per-row pending state so one Accept/Reject click doesn't disable every row
  const [actioningName, setActioningName] = useState<string | null>(null);
  const [actionError,   setActionError]   = useState<string | null>(null);

  // ── Team snapshot ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!profile?.teamId) {
      setLoading(false);
      setTeam(null);
      return;
    }

    setLoading(true);
    const unsub = onSnapshot(
      doc(db, "teams", profile.teamId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setTeam({
            id: snap.id,
            name: data.name,
            game: data.game,
            head: data.head,
            players: data.players ?? [],
            pendingPlayers: data.pendingPlayers ?? [],
            status: data.status,
          });
          setError(null);
        } else {
          setTeam(null);
          setError("Team document not found.");
        }
        setLoading(false);
      },
      (err) => {
        setError(err instanceof Error ? err.message : "Failed to load team.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [profile?.teamId, authLoading]);

  // ── Self-healing gamerType sync ───────────────────────────────────────────
  // Must be declared here — above ALL early returns — so hooks are called
  // unconditionally on every render (React Rules of Hooks).
  //
  // If Firestore hasn't stamped gamerType:"team_leader" on the user doc yet
  // (e.g. the team was created before this write path existed, or a write
  // failed transiently), stamp it now so the communication module — which
  // gates access on profile.gamerType === "team_leader" — works correctly.
  //
  // selfHealedRef ensures the Firestore write fires at most once per mount,
  // even when the effect re-runs due to dependency changes.
  const selfHealedRef = useRef(false);
  useEffect(() => {
    if (authLoading || loading) return;           // wait for both loads to settle
    if (!team || !profile?.email) return;         // no team or no email — nothing to do
    if (selfHealedRef.current) return;            // already fired this mount

    const fullName = `${profile.firstName ?? ""}${profile.middleInitial ? ` ${profile.middleInitial}.` : ""} ${profile.lastName ?? ""}`
      .replace(/\s+/g, " ")
      .trim();
    const isLeaderNow = team.head === fullName;

    if (!isLeaderNow) return;                     // not the leader — nothing to stamp
    if (profile.gamerType === "team_leader") {    // already correct — just mark done
      selfHealedRef.current = true;
      return;
    }

    selfHealedRef.current = true;
    fsUpdateUserTeamId(profile.email, profile.teamId, true).catch((err) =>
      console.error("gamerType self-heal failed:", err)
    );
  }, [authLoading, loading, team, profile?.email, profile?.gamerType, profile?.teamId,
      profile?.firstName, profile?.middleInitial, profile?.lastName]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-[#FF4655] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not on a team ─────────────────────────────────────────────────────────
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

  const fullName = `${profile.firstName ?? ""}${profile.middleInitial ? ` ${profile.middleInitial}.` : ""} ${profile.lastName ?? ""}`
    .replace(/\s+/g, " ")
    .trim();
  const isLeader = team.head === fullName;

  // Look up a player's `players` doc id by name — same matching convention
  // team-management already uses (players are keyed by name string, no
  // direct uid link). Returns null if no match is found.
  async function findPlayerDocId(playerName: string): Promise<string | null> {
    const snap = await getDocs(
      query(collection(db, "players"), where("name", "==", playerName), limit(1))
    );
    return snap.empty ? null : snap.docs[0].id;
  }

  const handleAccept = async (playerName: string) => {
    if (!team) return;
    setActioningName(playerName);
    setActionError(null);
    try {
      const newPending = team.pendingPlayers.filter((n) => n !== playerName);
      const newPlayers = [...team.players, playerName];
      await fsUpdateTeam(team.id, {
        pendingPlayers: newPending,
        players: newPlayers,
        status: newPlayers.length >= 5 ? "eligible" : "incomplete",
      });

      const playerDocId = await findPlayerDocId(playerName);
      if (playerDocId) {
        await fsUpdatePlayer(playerDocId, { drafted: true, team: team.name, pendingTeam: undefined });
        const playerSnap = await getDocs(
          query(collection(db, "players"), where("name", "==", playerName), limit(1))
        );
        const email = playerSnap.empty ? undefined : playerSnap.docs[0].data().email;
        if (email) await fsUpdateUserTeamId(email, team.id);
      }
      // onSnapshot above will refresh `team` automatically once the write lands.
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to accept player.");
    } finally {
      setActioningName(null);
    }
  };

  const handleReject = async (playerName: string) => {
    if (!team) return;
    setActioningName(playerName);
    setActionError(null);
    try {
      const newPending = team.pendingPlayers.filter((n) => n !== playerName);
      await fsUpdateTeam(team.id, { pendingPlayers: newPending });

      const playerDocId = await findPlayerDocId(playerName);
      if (playerDocId) {
        await fsUpdatePlayer(playerDocId, { pendingTeam: undefined });
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reject player.");
    } finally {
      setActioningName(null);
    }
  };

  const handleRemoveMember = async (playerName: string) => {
    if (!team || playerName === team.head) return;
    setActioningName(playerName);
    setActionError(null);
    try {
      const newPlayers = team.players.filter((n) => n !== playerName);
      await fsUpdateTeam(team.id, {
        players: newPlayers,
        status: newPlayers.length >= 5 ? "eligible" : "incomplete",
      });

      const playerDocId = await findPlayerDocId(playerName);
      if (playerDocId) {
        const playerSnap = await getDocs(
          query(collection(db, "players"), where("name", "==", playerName), limit(1))
        );
        const email = playerSnap.empty ? undefined : playerSnap.docs[0].data().email;
        await fsUpdatePlayer(playerDocId, { drafted: false, team: undefined });
        if (email) await fsUpdateUserTeamId(email, null, false);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to remove member.");
    } finally {
      setActioningName(null);
    }
  };

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
      {actionError && (
        <p className="text-xs px-1" style={{ color: "#EF4444" }}>⚠️ {actionError}</p>
      )}
      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {["#", "Player", "Role", "Status", ...(isLeader ? ["Actions"] : [])].map((h) => (
                <th key={h} className="dash-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {team.players.map((playerName, idx) => {
              const playerIsLeader = playerName === team.head;
              const isBusy = actioningName === playerName;
              return (
                <tr key={idx} className="dash-tr">
                  <td className="dash-td-dim">{idx + 1}</td>
                  <td className="dash-td font-medium">{playerName}</td>
                  <td className="dash-td">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                        playerIsLeader ? "bg-[#FF4655]/20 text-[#FF4655]" : ""
                      }`}
                      style={
                        !playerIsLeader
                          ? { backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" }
                          : {}
                      }
                    >
                      {playerIsLeader ? "Team Leader" : "Member"}
                    </span>
                  </td>
                  <td className="dash-td">
                    <span className="bg-[#00F5D4]/15 text-[#00F5D4] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                      active
                    </span>
                  </td>
                  {isLeader && (
                    <td className="dash-td">
                      {!playerIsLeader && (
                        <button
                          onClick={() => handleRemoveMember(playerName)}
                          disabled={isBusy}
                          className="text-[10px] text-[#FF4655] px-2 py-0.5 rounded border border-[#FF4655]/20 hover:bg-[#FF4655]/10 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isBusy ? "…" : "Remove"}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}

            {/* Empty roster slots */}
            {Array.from({ length: Math.max(0, maxPlayers - team.players.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="dash-tr">
                <td className="dash-td-dim">{team.players.length + i + 1}</td>
                <td className="dash-td-muted italic" colSpan={isLeader ? 4 : 3}>— Open Slot —</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending approval — leader-only. Mirrors the data the organizer's
          team modal shows, but the accept/reject ACTION now lives here,
          with the leader, not in the organizer's view. */}
      {isLeader && team.pendingPlayers.length > 0 && (
        <div className="dash-card p-4">
          <div className="dash-section-title mb-2">
            Pending Approval ({team.pendingPlayers.length})
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--c-text-muted)" }}>
            These free agents were drafted onto your roster by an organizer and are
            waiting for you, as team leader, to accept or reject them.
          </p>
          {actionError && (
            <p className="text-xs mb-2" style={{ color: "#EF4444" }}>{actionError}</p>
          )}
          <div className="space-y-1">
            {team.pendingPlayers.map((p, i) => {
              const isBusy = actioningName === p;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5 border-b border-[var(--c-border)] last:border-0"
                >
                  <span className="text-xs text-[var(--c-text)]">{p}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(p)}
                      disabled={isBusy}
                      className="text-[10px] text-[#00F5D4] px-2 py-0.5 rounded border border-[#00F5D4]/20 hover:bg-[#00F5D4]/10 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBusy ? "…" : "Accept"}
                    </button>
                    <button
                      onClick={() => handleReject(p)}
                      disabled={isBusy}
                      className="text-[10px] text-[#FF4655] px-2 py-0.5 rounded border border-[#FF4655]/20 hover:bg-[#FF4655]/10 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBusy ? "…" : "Reject"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
