"use client";
import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import StatCard from "@/components/shared/stat-card";

interface ReportCounts {
  totalPlayers:     number;
  mlbbPlayers:      number;
  codmPlayers:      number;
  freeAgents:       number;
  totalTeams:       number;
  totalTournaments: number;
  matchesCompleted: number;
  announcementsPublished: number;
  calendarEvents:   number;
  livestreamSessions: number;
}

export default function ReportsManagementModule() {
  const { profile } = useAuth();
  const [counts,  setCounts]  = useState<ReportCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || profile.role !== "admin") {
      setLoading(false);
      return;
    }

    // We run multiple listeners and merge into one counts object
    const state: ReportCounts = {
      totalPlayers: 0, mlbbPlayers: 0, codmPlayers: 0, freeAgents: 0,
      totalTeams: 0, totalTournaments: 0, matchesCompleted: 0,
      announcementsPublished: 0, calendarEvents: 0, livestreamSessions: 0,
    };

    let resolved = 0;
    const TOTAL_LISTENERS = 6;
    const maybeSetCounts = () => {
      resolved++;
      if (resolved >= TOTAL_LISTENERS) {
        setCounts({ ...state });
        setLoading(false);
      }
    };

    // Players
    const unsubPlayers = onSnapshot(collection(db, "players"), (snap) => {
      state.totalPlayers = snap.size;
      state.mlbbPlayers  = snap.docs.filter((d) => d.data().game === "MLBB").length;
      state.codmPlayers  = snap.docs.filter((d) => d.data().game === "CODM").length;
      state.freeAgents   = snap.docs.filter((d) => d.data().drafted === false).length;
      setCounts((prev) => prev ? { ...prev, ...state } : null);
      maybeSetCounts();
    }, () => maybeSetCounts());

    // Teams
    const unsubTeams = onSnapshot(collection(db, "teams"), (snap) => {
      state.totalTeams = snap.size;
      setCounts((prev) => prev ? { ...prev, totalTeams: snap.size } : null);
      maybeSetCounts();
    }, () => maybeSetCounts());

    // Tournaments
    const unsubTournaments = onSnapshot(collection(db, "tournaments"), (snap) => {
      state.totalTournaments = snap.size;
      setCounts((prev) => prev ? { ...prev, totalTournaments: snap.size } : null);
      maybeSetCounts();
    }, () => maybeSetCounts());

    // Completed matches
    const qMatches = query(collection(db, "matches"), where("status", "==", "completed"));
    const unsubMatches = onSnapshot(qMatches, (snap) => {
      state.matchesCompleted = snap.size;
      setCounts((prev) => prev ? { ...prev, matchesCompleted: snap.size } : null);
      maybeSetCounts();
    }, () => maybeSetCounts());

    // Approved announcements
    const qAnn = query(collection(db, "announcements"), where("status", "==", "approved"));
    const unsubAnn = onSnapshot(qAnn, (snap) => {
      state.announcementsPublished = snap.size;
      setCounts((prev) => prev ? { ...prev, announcementsPublished: snap.size } : null);
      maybeSetCounts();
    }, () => maybeSetCounts());

    // Calendar events (approved)
    const qCal = query(collection(db, "calendar_events"), where("status", "==", "approved"));
    const unsubCal = onSnapshot(qCal, (snap) => {
      state.calendarEvents = snap.size;
      setCounts((prev) => prev ? { ...prev, calendarEvents: snap.size } : null);
      maybeSetCounts();
    }, () => maybeSetCounts());

    return () => {
      unsubPlayers();
      unsubTeams();
      unsubTournaments();
      unsubMatches();
      unsubAnn();
      unsubCal();
    };
  }, [profile]);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  if (profile && profile.role !== "admin") {
    return (
      <div className="dash-card p-6 text-center" style={{ color: "var(--c-text-muted)" }}>
        Access restricted to admins.
      </div>
    );
  }

  if (loading || !counts) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-[#FF4655] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const participants = [
    { l: "MLBB Players", v: counts.mlbbPlayers,  c: "#00F5D4" },
    { l: "CODM Players", v: counts.codmPlayers,  c: "#8B5CF6" },
    { l: "Free Agents",  v: counts.freeAgents,   c: "var(--c-text-dim)" },
  ];

  const engagement = [
    { l: "Announcements Published", v: counts.announcementsPublished },
    { l: "Calendar Events",         v: counts.calendarEvents },
    { l: "Matches Completed",       v: counts.matchesCompleted },
  ];

  return (
    <div className="space-y-5">
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={String(counts.totalPlayers)}     label="Total Players"      accent="teal" />
        <StatCard value={String(counts.totalTeams)}       label="Total Teams" />
        <StatCard value={String(counts.totalTournaments)} label="Total Tournaments"  accent="red" />
        <StatCard value={String(counts.matchesCompleted)} label="Matches Completed"  accent="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Player breakdown */}
        <div className="dash-card p-5">
          <div className="dash-section-title">Player Breakdown</div>
          {participants.map((r) => (
            <div key={r.l} className="dash-row-item">
              <span className="text-sm" style={{ color: "var(--c-text)" }}>{r.l}</span>
              <span className="font-head text-lg font-bold" style={{ color: r.c }}>{r.v}</span>
            </div>
          ))}
        </div>

        {/* Engagement */}
        <div className="dash-card p-5">
          <div className="dash-section-title">Engagement</div>
          {engagement.map((r) => (
            <div key={r.l} className="dash-row-item">
              <span className="text-sm" style={{ color: "var(--c-text)" }}>{r.l}</span>
              <span className="font-head text-lg font-bold" style={{ color: "var(--c-text)" }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
