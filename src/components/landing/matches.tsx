"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface LiveMatch {
  id: string;
  teamA: string;
  teamB: string;
  round: string;
  date: string;
  time: string;
  status: "pending" | "ongoing" | "completed";
  tournamentName?: string;
}

export default function MatchesSection() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "matches"), where("status", "==", "pending"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: LiveMatch[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              teamA: data.teamA ?? "",
              teamB: data.teamB ?? "",
              round: data.round ?? "",
              date: data.date ?? "",
              time: data.time ?? "TBD",
              status: data.status ?? "pending",
              tournamentName: data.tournamentName ?? undefined,
            };
          })
          // Only show matches that have real opponents and a real scheduled date
          // (bracket-management seeds unscheduled matches with date = today and
          // time = "TBD" — those aren't meaningfully "upcoming" yet).
          .filter((m) => m.teamA && m.teamB && m.teamA !== "TBD" && m.teamB !== "TBD" && m.time !== "TBD")
          .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
          .slice(0, 4);
        setMatches(rows);
        setLoading(false);
      },
      (err) => {
        console.error("matches snapshot error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return (
    <section
      id="matches"
      className="py-16 px-6"
      style={{ backgroundColor: "var(--c-surface)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] uppercase tracking-[2px] mb-2" style={{ color: "var(--c-accent)" }}>
          Schedule
        </div>
        <h2 className="font-head text-3xl font-bold uppercase tracking-wide mb-8" style={{ color: "var(--c-text)" }}>
          UPCOMING MATCHES
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#FF4655] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: "var(--c-text-dim)" }}>
            No matches are scheduled right now. Check back once brackets are set.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {matches.map((m) => {
              const dateObj = new Date(m.date);
              const valid = !isNaN(dateObj.getTime());
              const day   = valid ? dateObj.toLocaleDateString("en-PH", { weekday: "short" }) : "—";
              const num   = valid ? dateObj.getDate() : "–";
              const month = valid ? dateObj.toLocaleDateString("en-PH", { month: "short" }) : "";

              return (
                <div
                  key={m.id}
                  className="rounded-lg px-5 py-4 flex items-center gap-4 border transition-colors"
                  style={{
                    backgroundColor: "var(--c-surface2)",
                    borderColor: "var(--c-border)",
                  }}
                >
                  {/* Date block */}
                  <div className="text-center min-w-[64px]">
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--c-text-dim)" }}>
                      {day}
                    </div>
                    <div className="font-head text-2xl font-bold leading-none" style={{ color: "var(--c-accent)" }}>
                      {num}
                    </div>
                    <div className="text-[10px]" style={{ color: "var(--c-text-dim)" }}>
                      {month}
                    </div>
                  </div>

                  <div className="h-10 w-px" style={{ backgroundColor: "var(--c-border)" }} />

                  {/* Teams */}
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-head text-base font-semibold uppercase" style={{ color: "var(--c-text)" }}>
                      {m.teamA}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" }}
                    >
                      VS
                    </span>
                    <span className="font-head text-base font-semibold uppercase" style={{ color: "var(--c-text)" }}>
                      {m.teamB}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="text-right shrink-0">
                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                        style={{ backgroundColor: "rgba(255,70,85,0.18)", color: "var(--c-accent)" }}
                      >
                        {m.round}{m.tournamentName ? ` · ${m.tournamentName}` : ""}
                      </span>
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: "var(--c-text-dim)" }}>
                      {m.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
