"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StatCard from "@/components/shared/stat-card";
import { useOrganizerContext } from "@/lib/organizer-context";

interface AnnouncementItem {
  id: string;
  title: string;
  status: string;
}

export default function OverviewManagementModule() {
  const { tournaments, teams, draftedPlayers, matchesState, loading } = useOrganizerContext();

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "announcements"),
      where("status", "in", ["pending", "approved"]),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setAnnouncements(
          snap.docs.map((d) => ({
            id: d.id,
            title: d.data().title ?? "",
            status: d.data().status ?? "pending",
          }))
        );
      },
      (err) => console.error("overview announcements snapshot error:", err)
    );
    return () => unsub();
  }, []);

  // Only count tournaments that are NOT completed as "active"
  const activeTournaments = tournaments.filter((t) => t.status !== "completed");
  const pendingMatchCount = matchesState.filter((m) => m.status === "pending").length;
  const completedMatches  = matchesState.filter((m) => m.status === "completed").slice(-3);
  // Teams eligible to join tournaments (5+ players)
  const eligibleTeams     = teams.filter((t) => t.players.length >= 5);

  if (loading) {
    return (
      <div className="text-center py-12 text-xs text-[var(--c-text-muted)]">Loading overview…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={activeTournaments.length} label="Active Tournaments" accent="red" />
        <StatCard value={eligibleTeams.length}     label="Eligible Teams"     accent="teal" />
        <StatCard value={draftedPlayers.length}    label="Drafted Players"    accent="purple" />
        <StatCard value={pendingMatchCount}         label="Matches Upcoming" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dash-card p-5">
          <div className="dash-section-title">Announcement Pending Actions</div>
          {announcements.length === 0 ? (
            <div className="text-xs text-[var(--c-text-muted)] py-4">No announcements yet.</div>
          ) : (
            announcements.map((item) => (
              <div key={item.id} className="dash-row-item">
                <span className="text-sm font-semibold" style={{ color: "var(--c-text)" }}>
                  {item.title}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                    item.status === "pending"
                      ? "bg-[#FF4655]/20 text-[#FF4655]"
                      : "bg-[#00F5D4]/15 text-[#00F5D4]"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="dash-card p-5">
          <div className="dash-section-title">Recent Match Results</div>
          <div className="space-y-3">
            {completedMatches.length === 0 ? (
              <div className="text-xs text-[var(--c-text-muted)] py-4">No completed matches yet.</div>
            ) : (
              completedMatches.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-3 py-2 border-b border-[var(--c-border)]"
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[#FF4655]" />
                  <div>
                    <div className="text-xs font-bold text-[var(--c-text)]">
                      {m.teamA} vs {m.teamB} completed
                    </div>
                    <div className="text-[10px] text-[var(--c-text-muted)]">
                      Winner: {m.winner} ({m.scoreA}–{m.scoreB})
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tournament Status Summary */}
      <div className="dash-card p-5">
        <div className="dash-section-title">Tournament Status Summary</div>
        {tournaments.length === 0 ? (
          <div className="text-xs text-[var(--c-text-muted)] py-4">No tournaments created yet.</div>
        ) : (
          <div className="space-y-2 mt-2">
            {tournaments.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-[var(--c-border)] last:border-0">
                <div>
                  <span className="text-xs font-semibold text-[var(--c-text)]">{t.name}</span>
                  <span className="ml-2 text-[10px] text-[var(--c-text-muted)]">{t.game} · {t.format}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[var(--c-text-muted)]">
                    {t.teamsList.length}/{t.maxTeams} teams
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      t.status === "completed"
                        ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                        : t.status === "ongoing"
                        ? "bg-[#FACC15]/15 text-[#FACC15]"
                        : "bg-[#8B5CF6]/15 text-[#8B5CF6]"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}