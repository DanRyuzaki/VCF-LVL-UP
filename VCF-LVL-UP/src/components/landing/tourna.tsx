"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface LiveTournament {
  id: string;
  name: string;
  game: string;
  format: string;
  season: number;
  status: "registration" | "ongoing" | "completed";
  teamsRegistered: number;
  maxTeams: number;
  matchesPlayed: number;
  totalMatches: number;
}

function statusBadge(status: LiveTournament["status"]) {
  if (status === "ongoing")
    return (
      <span
        className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
        style={{ backgroundColor: "rgba(255,70,85,0.18)", color: "var(--c-accent)" }}
      >
        LIVE
      </span>
    );
  if (status === "registration")
    return (
      <span
        className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
        style={{ backgroundColor: "rgba(0,245,212,0.12)", color: "#00F5D4" }}
      >
        REGISTRATION
      </span>
    );
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
      style={{ backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" }}
    >
      COMPLETED
    </span>
  );
}

function statusColor(status: LiveTournament["status"]) {
  if (status === "ongoing")    return "#00F5D4";
  if (status === "registration") return "#00F5D4";
  return "var(--c-text-dim)";
}

export default function TournaSection() {
  const [tournaments, setTournaments] = useState<LiveTournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "tournaments"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: LiveTournament[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name ?? "",
            game: data.game ?? "",
            format: data.format ?? "Single Elimination",
            season: data.season ?? 1,
            status: data.status ?? "registration",
            teamsRegistered: data.teamsRegistered ?? 0,
            maxTeams: data.maxTeams ?? 0,
            matchesPlayed: data.matchesPlayed ?? 0,
            totalMatches: data.totalMatches ?? 0,
          };
        });
        // Surface the most relevant tournaments on the landing page:
        // ongoing and registration-open events first, then recent completed ones.
        const rank = (s: LiveTournament["status"]) => (s === "ongoing" ? 0 : s === "registration" ? 1 : 2);
        rows.sort((a, b) => rank(a.status) - rank(b.status));
        setTournaments(rows.slice(0, 6));
        setLoading(false);
      },
      (err) => {
        console.error("tournaments snapshot error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return (
    <section id="tournaments" className="py-16 px-6" style={{ backgroundColor: "var(--c-page-bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] uppercase tracking-[2px] mb-2" style={{ color: "var(--c-accent)" }}>
          Active Events
        </div>
        <h2 className="font-head text-3xl font-bold uppercase tracking-wide mb-8" style={{ color: "var(--c-text)" }}>
          TOURNAMENT OVERVIEW
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#FF4655] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: "var(--c-text-dim)" }}>
            No tournaments have been announced yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tournaments.map((t) => (
              <div
                key={t.id}
                className="rounded-lg p-5 border transition-colors"
                style={{
                  backgroundColor: "var(--c-surface2)",
                  borderColor: "var(--c-border)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  {statusBadge(t.status)}
                  <span className="text-[11px]" style={{ color: "var(--c-text-dim)" }}>
                    Season {t.season}
                  </span>
                </div>

                <div className="font-head text-lg font-bold uppercase tracking-wide mb-1" style={{ color: "var(--c-text)" }}>
                  {t.name}
                </div>
                <div className="text-xs mb-4" style={{ color: "var(--c-text-muted)" }}>
                  {t.game === "MLBB" ? "Mobile Legends: Bang Bang" : t.game === "CODM" ? "Call of Duty: Mobile" : t.game} · {t.format}
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-xs" style={{ color: "var(--c-text-dim)" }}>
                  <div>
                    Teams:{" "}
                    <span style={{ color: "var(--c-text)" }}>
                      {t.teamsRegistered}/{t.maxTeams}
                    </span>
                  </div>
                  <div>
                    Matches:{" "}
                    <span style={{ color: "var(--c-text)" }}>
                      {t.matchesPlayed}/{t.totalMatches}
                    </span>
                  </div>
                  <div>
                    Status:{" "}
                    <span style={{ color: statusColor(t.status) }}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    Format: <span style={{ color: "var(--c-text)" }}>{t.format}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
