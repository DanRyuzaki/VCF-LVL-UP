"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ModalBackdrop from "@/components/shared/modal-backdrop";

interface ViewUserModalProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    created: string;
    lastLogin: string;
  };
  context: "admin" | "developer";
  onClose: () => void;
  onDelete: () => void;
}

// ---------------------------------------------------------------------------
// Real, Firestore-derived gamer stats.
// ---------------------------------------------------------------------------
// We don't have a direct uid -> players/{id} link in the schema, so we match
// on email (players docs store the gamer's email — see organizer-context.tsx).
// From the matched player doc we can chase: player.team -> teams/{name} ->
// tournaments whose teamsList includes that team name -> matches involving
// that team name. Everything else (login counts, per-user activity feed)
// has no Firestore source anywhere in this schema and is labeled as such
// rather than fabricated.
interface GamerStats {
  found: boolean;
  ign?: string;
  game?: string;
  inGameRole?: string;
  rank?: string;
  winRate?: string;
  kda?: string;
  recentForm?: string[]; // "Win" | "Loss"
  teamName?: string;
  tournaments: { name: string; season: number; teamName: string; status: string }[];
  matches: { tournamentName: string; round: string; opponent: string; result: "Win" | "Loss" | "Pending"; date: string }[];
}

function useGamerStats(email: string, isGamer: boolean) {
  const [stats, setStats] = useState<GamerStats | null>(null);
  const [loading, setLoading] = useState(isGamer);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isGamer || !email) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // 1. Find the player doc for this gamer by email.
        const playerSnap = await getDocs(
          query(collection(db, "players"), where("email", "==", email), limit(1))
        );
        if (cancelled) return;

        if (playerSnap.empty) {
          setStats({ found: false, tournaments: [], matches: [] });
          setLoading(false);
          return;
        }

        const player = playerSnap.docs[0].data();
        const teamName: string | undefined = player.team || undefined;

        let tournaments: GamerStats["tournaments"] = [];
        let matches: GamerStats["matches"] = [];

        if (teamName) {
          // 2. Tournaments this player's team is registered in.
          const tourneySnap = await getDocs(collection(db, "tournaments"));
          if (cancelled) return;

          const relevantTournaments = tourneySnap.docs
            .map((d) => ({ id: d.id, ...(d.data() as any) }))
            .filter((t) => (t.teamsList ?? []).some((tl: any) => tl.name === teamName));

          tournaments = relevantTournaments.map((t) => ({
            name: t.name ?? "—",
            season: t.season ?? 1,
            teamName,
            status: t.status ?? "registration",
          }));

          // 3. Matches involving this team, scoped to the relevant tournaments.
          const relevantTournamentIds = new Set(relevantTournaments.map((t) => t.id));
          const matchSnap = await getDocs(collection(db, "matches"));
          if (cancelled) return;

          matches = matchSnap.docs
            .map((d) => d.data() as any)
            .filter(
              (m) =>
                (m.teamA === teamName || m.teamB === teamName) &&
                (!m.tournamentId || relevantTournamentIds.has(m.tournamentId))
            )
            .map((m) => {
              const tourney = relevantTournaments.find((t) => t.id === m.tournamentId);
              const isTeamA = m.teamA === teamName;
              const opponent = isTeamA ? m.teamB : m.teamA;
              let result: "Win" | "Loss" | "Pending" = "Pending";
              if (m.status === "completed" && m.winner) {
                result = m.winner === teamName ? "Win" : "Loss";
              }
              return {
                tournamentName: tourney?.name ?? "—",
                round: m.round ?? "—",
                opponent: opponent ?? "—",
                result,
                date: m.date ?? "—",
              };
            });
        }

        setStats({
          found: true,
          ign: player.ign ?? undefined,
          game: player.game ?? undefined,
          inGameRole: player.role ?? undefined,
          rank: player.rank ?? undefined,
          winRate: player.winRate ?? undefined,
          kda: player.kda ?? undefined,
          recentForm: Array.isArray(player.history) ? player.history.slice(-5) : [],
          teamName,
          tournaments,
          matches,
        });
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load gamer stats:", err);
        setError("Couldn't load gamer stats right now.");
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [email, isGamer]);

  return { stats, loading, error };
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid var(--c-border)",
      }}
    >
      <span style={{ fontSize: "12px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </span>
      <span style={{ fontSize: "13px", fontWeight: 500, color: accent || "var(--c-text)" }}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  const isSuspended = status === "suspended";
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
      style={{
        backgroundColor: isActive
          ? "rgba(0,245,212,0.15)"
          : isSuspended
          ? "rgba(255,70,85,0.15)"
          : "var(--c-surface3)",
        color: isActive ? "#00F5D4" : isSuspended ? "#FF4655" : "var(--c-text-dim)",
      }}
    >
      {status}
    </span>
  );
}

function NotTracked({ label }: { label?: string }) {
  return (
    <span style={{ fontSize: "12px", color: "var(--c-text-dim)", fontStyle: "italic" }}>
      {label ?? "Not tracked"}
    </span>
  );
}

export default function ViewUserModal({ user, context, onClose, onDelete }: ViewUserModalProps) {
  const isAdmin = context === "admin";
  const isGamer = user.role === "Gamer";
  const { stats, loading: statsLoading, error: statsError } = useGamerStats(user.email, isGamer);

  return (
    <ModalBackdrop
      onClose={onClose}
      title="User Details"
      subtitle={isAdmin ? "Profile and activity information" : "Complete user record with system data"}
      maxWidth="540px"
    >
      {/* User header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,70,85,0.1)",
            border: "1.5px solid var(--c-accent)",
            color: "var(--c-accent)",
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "16px",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {user.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--c-text)" }}>{user.name}</div>
          <div style={{ fontSize: "12px", color: "var(--c-text-muted)" }}>{user.email}</div>
        </div>
      </div>

      {/* Section: Profile Information */}
      <div style={{ marginBottom: "20px" }}>
        <div className="dash-section-title" style={{ marginBottom: "8px" }}>
          Profile Information
        </div>
        <div
          style={{
            backgroundColor: "var(--c-surface2)",
            border: "1px solid var(--c-border)",
            borderRadius: "8px",
            padding: "4px 16px",
          }}
        >
          <InfoRow label="Full Name" value={user.name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Assigned Role" value={user.role} accent={
            user.role === "Admin" ? "#FF4655" : user.role === "Organizer" ? "#8B5CF6" : "#00F5D4"
          } />
          <InfoRow label="Account Status" value={user.status} />
          <InfoRow label="Registration Date" value={user.created} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
            <span style={{ fontSize: "12px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Status
            </span>
            <StatusBadge status={user.status} />
          </div>
        </div>
      </div>

      {/* Developer-only: Internal Data */}
      {!isAdmin && (
        <div style={{ marginBottom: "20px" }}>
          <div className="dash-section-title" style={{ marginBottom: "8px" }}>
            Internal System Data
          </div>
          <div
            style={{
              backgroundColor: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              padding: "4px 16px",
            }}
          >
            <InfoRow label="Internal UID" value={user.id} accent="#FF4655" />
            <InfoRow label="Last Login" value={user.lastLogin} />
            <InfoRow label="Account Created" value={user.created} />
            <InfoRow label="Auth Provider" value="Firebase Auth" />
            <InfoRow label="Role History" value={`${user.role} (since ${user.created})`} />
          </div>
        </div>
      )}

      {/* Gamer-only: In-Game Profile (real Firestore data from players collection) */}
      {isGamer && (
        <div style={{ marginBottom: "20px" }}>
          <div className="dash-section-title" style={{ marginBottom: "8px" }}>
            In-Game Profile
          </div>
          <div
            style={{
              backgroundColor: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              padding: "4px 16px",
            }}
          >
            {statsLoading ? (
              <div style={{ padding: "16px 0", fontSize: "12px", color: "var(--c-text-dim)" }}>Loading…</div>
            ) : statsError ? (
              <div style={{ padding: "16px 0", fontSize: "12px", color: "#FF4655" }}>{statsError}</div>
            ) : !stats?.found ? (
              <div style={{ padding: "16px 0", fontSize: "12px", color: "var(--c-text-dim)" }}>
                No free-agent/player record found for this email. This gamer may not have registered a player profile yet.
              </div>
            ) : (
              <>
                <InfoRow label="In-Game Name" value={stats.ign || "—"} />
                <InfoRow label="Game" value={stats.game || "—"} />
                <InfoRow label="In-Game Role" value={stats.inGameRole || "—"} />
                <InfoRow label="Rank" value={stats.rank || "—"} accent="#8B5CF6" />
                <InfoRow label="Win Rate" value={stats.winRate || "—"} />
                <InfoRow label="KDA" value={stats.kda || "—"} />
                <InfoRow label="Team" value={stats.teamName || "Free Agent (unassigned)"} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                  <span style={{ fontSize: "12px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Recent Form
                  </span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {stats.recentForm && stats.recentForm.length > 0 ? (
                      stats.recentForm.map((r, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold"
                          style={
                            r === "Win"
                              ? { backgroundColor: "rgba(0,245,212,0.15)", color: "#00F5D4" }
                              : { backgroundColor: "rgba(255,70,85,0.15)", color: "#FF4655" }
                          }
                        >
                          {r === "Win" ? "W" : "L"}
                        </span>
                      ))
                    ) : (
                      <NotTracked />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Activity Summary — login activity isn't counted anywhere in this
          schema, so we show what we genuinely have (last login) and label
          the rest honestly instead of inventing numbers. */}
      {isAdmin && (
        <div style={{ marginBottom: "20px" }}>
          <div className="dash-section-title" style={{ marginBottom: "8px" }}>
            Activity Summary
          </div>
          <div
            style={{
              backgroundColor: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              padding: "4px 16px",
            }}
          >
            <InfoRow label="Last Login" value={user.lastLogin} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
              <span style={{ fontSize: "12px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Total Logins
              </span>
              <NotTracked label="Not tracked yet" />
            </div>
            {isGamer && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                  <span style={{ fontSize: "12px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Tournaments Joined
                  </span>
                  {statsLoading ? (
                    <NotTracked label="Loading…" />
                  ) : (
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--c-text)" }}>
                      {stats?.tournaments.length ?? 0}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                  <span style={{ fontSize: "12px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Matches Played
                  </span>
                  {statsLoading ? (
                    <NotTracked label="Loading…" />
                  ) : (
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--c-text)" }}>
                      {stats?.matches.filter((m) => m.result !== "Pending").length ?? 0}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tournament Participation — Gamer only, real data from the chain:
          players (by email) -> team name -> tournaments.teamsList -> matches */}
      {isAdmin && isGamer && (
        <div style={{ marginBottom: "20px" }}>
          <div className="dash-section-title" style={{ marginBottom: "8px" }}>
            Tournament Participation History
          </div>
          <div
            style={{
              backgroundColor: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {statsLoading ? (
              <div style={{ padding: "16px", fontSize: "12px", color: "var(--c-text-dim)" }}>Loading…</div>
            ) : statsError ? (
              <div style={{ padding: "16px", fontSize: "12px", color: "#FF4655" }}>{statsError}</div>
            ) : !stats?.matches.length ? (
              <div style={{ padding: "16px", fontSize: "12px", color: "var(--c-text-dim)" }}>
                No match history found for this gamer's team.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "var(--c-surface3)" }}>
                  <tr>
                    {["Tournament", "Round", "Opponent", "Result"].map((h) => (
                      <th key={h} className="dash-th" style={{ padding: "10px 12px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.matches.map((m, i) => (
                    <tr key={i} style={{ borderTop: "1px solid var(--c-border)" }}>
                      <td style={{ padding: "10px 12px", fontSize: "13px", color: "var(--c-text)" }}>{m.tournamentName}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: "var(--c-text-dim)" }}>{m.round}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: "var(--c-text-muted)" }}>{m.opponent}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span
                          className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                          style={{
                            backgroundColor:
                              m.result === "Win"
                                ? "rgba(0,245,212,0.15)"
                                : m.result === "Loss"
                                ? "rgba(255,70,85,0.15)"
                                : "var(--c-surface3)",
                            color:
                              m.result === "Win"
                                ? "#00F5D4"
                                : m.result === "Loss"
                                ? "#FF4655"
                                : "var(--c-text-dim)",
                          }}
                        >
                          {m.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Developer-only: System Activity — there is no per-user activity
          collection in this schema (audit_logs has no uid field), so we say
          so honestly instead of fabricating a log. */}
      {!isAdmin && (
        <div style={{ marginBottom: "20px" }}>
          <div className="dash-section-title" style={{ marginBottom: "8px" }}>
            System Activity Records
          </div>
          <div
            style={{
              backgroundColor: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              padding: "16px",
              fontSize: "12px",
              color: "var(--c-text-dim)",
              fontStyle: "italic",
            }}
          >
            Per-user activity history isn't tracked yet — the audit log records system-wide events only,
            not actions tied to a specific account.
          </div>
        </div>
      )}

      {/* Delete User Button */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid var(--c-border)" }}>
        <button
          onClick={onDelete}
          className="text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
          style={{
            backgroundColor: "rgba(255,70,85,0.08)",
            border: "1px solid rgba(255,70,85,0.25)",
            color: "#FF4655",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget).style.backgroundColor = "#FF4655";
            (e.currentTarget).style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget).style.backgroundColor = "rgba(255,70,85,0.08)";
            (e.currentTarget).style.color = "#FF4655";
          }}
        >
          Delete User
        </button>
        <button onClick={onClose} className="dash-btn-ghost text-xs px-5 py-2 rounded-lg">
          Close
        </button>
      </div>
    </ModalBackdrop>
  );
}
