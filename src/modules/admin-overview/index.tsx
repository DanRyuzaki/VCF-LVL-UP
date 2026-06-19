"use client";
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import StatCard from "@/components/shared/stat-card";

interface PendingAnnouncement {
  id: string;
  title: string;
  submittedBy: string;
}

interface TournamentHealth {
  name: string;
  pct: number;
  color: string;
}

export default function AdminOverviewModule() {
  const { profile } = useAuth();

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [pendingItems, setPendingItems] = useState<PendingAnnouncement[]>([]);
  const [tournamentHealth] = useState<TournamentHealth[]>([
    { name: "MLBB Championship S4", pct: 75, color: "#00F5D4" },
    { name: "CODM Clash S1", pct: 50, color: "#FF4655" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Live count of pending announcements
    const pendingQ = query(
      collection(db, "announcements"),
      where("status", "==", "pending")
    );
    const unsubPending = onSnapshot(pendingQ, (snap) => {
      setPendingCount(snap.size);
      // Show up to 3 in the overview card
      const rows: PendingAnnouncement[] = snap.docs.slice(0, 3).map((d) => ({
        id: d.id,
        title: d.data().title ?? "—",
        submittedBy: d.data().submittedBy ?? "Organizer",
      }));
      setPendingItems(rows);
      setLoading(false);
    });

    // Count of gamer accounts
    const gamerQ = query(
      collection(db, "users"),
      where("role", "==", "gamer"),
      where("status", "==", "active")
    );
    const unsubGamers = onSnapshot(gamerQ, (snap) => {
      setPlayerCount(snap.size);
    });

    return () => {
      unsubPending();
      unsubGamers();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={String(pendingCount)} label="Pending Approvals" accent="red" />
        <StatCard value={String(playerCount)} label="Registered Players" accent="teal" />
        <StatCard value="2" label="Active Tournaments" />
        <StatCard value="1" label="Live Streams" accent="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dash-card p-5">
          <div className="dash-section-title">
            Pending Approvals
            {pendingCount > 0 && (
              <span className="ml-2 bg-[#FF4655]/20 text-[#FF4655] text-[10px] font-bold px-2 py-0.5 rounded">
                {pendingCount}
              </span>
            )}
          </div>
          {loading ? (
            <div className="text-xs py-4" style={{ color: "var(--c-text-dim)" }}>
              Loading…
            </div>
          ) : pendingItems.length === 0 ? (
            <div className="text-xs py-4" style={{ color: "var(--c-text-dim)" }}>
              No pending announcements.
            </div>
          ) : (
            pendingItems.map((item) => (
              <div key={item.id} className="dash-row-item">
                <div>
                  <div className="text-sm font-medium" style={{ color: "var(--c-text)" }}>
                    {item.title}
                  </div>
                  <div className="text-xs" style={{ color: "var(--c-text-dim)" }}>
                    Announcement · Submitted by {item.submittedBy}
                  </div>
                </div>
              </div>
            ))
          )}
          {pendingCount > 3 && (
            <div className="text-xs mt-2" style={{ color: "var(--c-text-dim)" }}>
              +{pendingCount - 3} more — review in Approvals Management.
            </div>
          )}
        </div>

        <div className="dash-card p-5">
          <div className="dash-section-title">Tournament Health</div>
          {tournamentHealth.map((t) => (
            <div key={t.name} className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: "var(--c-text)" }}>{t.name}</span>
                <span style={{ color: t.color }}>{t.pct}%</span>
              </div>
              <div
                className="rounded-full h-1.5 overflow-hidden"
                style={{ backgroundColor: "var(--c-border)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${t.pct}%`, background: t.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
