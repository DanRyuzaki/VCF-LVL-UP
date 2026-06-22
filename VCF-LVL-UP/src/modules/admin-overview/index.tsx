"use client";
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
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

// Generic async slice: tracks its own loading/error/data independently so
// one stuck or failing query can't hold the rest of the page hostage, and
// each card can show its own Loading → Error → Empty → Data state.
interface Slice<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

function initSlice<T>(initial: T): Slice<T> {
  return { data: initial, loading: true, error: null };
}

export default function AdminOverviewModule() {
  const { profile } = useAuth();

  const [pending, setPending] = useState<Slice<{ count: number; items: PendingAnnouncement[] }>>(
    initSlice({ count: 0, items: [] })
  );
  const [players, setPlayers] = useState<Slice<number>>(initSlice(0));
  const [activeTournaments, setActiveTournaments] = useState<Slice<number>>(initSlice(0));
  const [liveStreams, setLiveStreams] = useState<Slice<number>>(initSlice(0));
  const [tournamentHealth, setTournamentHealth] = useState<Slice<TournamentHealth[]>>(
    initSlice<TournamentHealth[]>([])
  );

  useEffect(() => {
    // Live count of pending announcements
    const pendingQ = query(
      collection(db, "announcements"),
      where("status", "==", "pending")
    );
    const unsubPending = onSnapshot(
      pendingQ,
      (snap) => {
        const items: PendingAnnouncement[] = snap.docs.slice(0, 3).map((d) => ({
          id: d.id,
          title: d.data().title ?? "—",
          submittedBy: d.data().submittedBy ?? "Organizer",
        }));
        setPending({ data: { count: snap.size, items }, loading: false, error: null });
      },
      (err) => {
        console.error("admin-overview: pending announcements listener failed:", err);
        setPending((prev) => ({ ...prev, loading: false, error: "Failed to load pending approvals." }));
      }
    );

    // Count of gamer accounts
    const gamerQ = query(
      collection(db, "users"),
      where("role", "==", "gamer"),
      where("status", "==", "active")
    );
    const unsubGamers = onSnapshot(
      gamerQ,
      (snap) => setPlayers({ data: snap.size, loading: false, error: null }),
      (err) => {
        console.error("admin-overview: registered players listener failed:", err);
        setPlayers((prev) => ({ ...prev, loading: false, error: "Failed to load." }));
      }
    );

    // Count of active tournaments (not completed)
    const activeTournamentsQ = query(
      collection(db, "tournaments"),
      where("status", "in", ["registration", "ongoing"])
    );
    const unsubActiveTournaments = onSnapshot(
      activeTournamentsQ,
      (snap) => setActiveTournaments({ data: snap.size, loading: false, error: null }),
      (err) => {
        console.error("admin-overview: active tournaments listener failed:", err);
        setActiveTournaments((prev) => ({ ...prev, loading: false, error: "Failed to load." }));
      }
    );

    // Count of live streams
    const liveStreamsQ = query(
      collection(db, "livestreams"),
      where("status", "==", "live")
    );
    const unsubLiveStreams = onSnapshot(
      liveStreamsQ,
      (snap) => setLiveStreams({ data: snap.size, loading: false, error: null }),
      (err) => {
        console.error("admin-overview: live streams listener failed:", err);
        setLiveStreams((prev) => ({ ...prev, loading: false, error: "Failed to load." }));
      }
    );

    // Fetch tournament data for health calculation
    const tournamentsQ = query(collection(db, "tournaments"));
    const unsubTournaments = onSnapshot(
      tournamentsQ,
      (snap) => {
        const healthData: TournamentHealth[] = snap.docs.map((doc) => {
          const data = doc.data();
          const name = `${data.name ?? ""} S${data.season ?? 1}`;
          let pct = 0;
          let color = "#808080"; // default gray for unknown status

          const status = data.status ?? "registration";
          const teamsRegistered = data.teamsRegistered ?? 0;
          const maxTeams = data.maxTeams ?? 1;
          const matchesPlayed = data.matchesPlayed ?? 0;
          const totalMatches = data.totalMatches ?? 1;

          if (status === "registration") {
            // Health based on team registration progress
            pct = Math.round((teamsRegistered / maxTeams) * 100);
            color = "#00F5D4"; // teal
          } else if (status === "ongoing") {
            // Health based on match progress
            pct = Math.round((matchesPlayed / totalMatches) * 100);
            color = "#FACC15"; // yellow
          } else if (status === "completed") {
            // Health based on completion
            pct = 100;
            color = "#00F5D4"; // teal
          }

          return {
            name,
            pct: Math.min(100, Math.max(0, pct)),
            color,
          };
        });
        setTournamentHealth({ data: healthData, loading: false, error: null });
      },
      (err) => {
        console.error("admin-overview: tournament health listener failed:", err);
        setTournamentHealth((prev) => ({ ...prev, loading: false, error: "Failed to load tournament health." }));
      }
    );

    return () => {
      unsubPending();
      unsubGamers();
      unsubActiveTournaments();
      unsubLiveStreams();
      unsubTournaments();
    };
  }, []);

  // A stat card shows the value once loaded, "—" while loading, and "!" on error.
  const statValue = (slice: Slice<number>) =>
    slice.error ? "!" : slice.loading ? "—" : String(slice.data);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={pending.error ? "!" : pending.loading ? "—" : String(pending.data.count)} label="Pending Approvals" accent="red" />
        <StatCard value={statValue(players)} label="Registered Players" accent="teal" />
        <StatCard value={statValue(activeTournaments)} label="Active Tournaments" />
        <StatCard value={statValue(liveStreams)} label="Live Streams" accent="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dash-card p-5">
          <div className="dash-section-title">
            Pending Approvals
            {pending.data.count > 0 && !pending.loading && !pending.error && (
              <span className="ml-2 bg-[#FF4655]/20 text-[#FF4655] text-[10px] font-bold px-2 py-0.5 rounded">
                {pending.data.count}
              </span>
            )}
          </div>
          {pending.loading ? (
            <div className="text-xs py-4" style={{ color: "var(--c-text-dim)" }}>
              Loading…
            </div>
          ) : pending.error ? (
            <div className="text-xs py-4" style={{ color: "#FF4655" }}>
              {pending.error}
            </div>
          ) : pending.data.items.length === 0 ? (
            <div className="text-xs py-4" style={{ color: "var(--c-text-dim)" }}>
              No pending announcements.
            </div>
          ) : (
            pending.data.items.map((item) => (
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
          {!pending.loading && !pending.error && pending.data.count > 3 && (
            <div className="text-xs mt-2" style={{ color: "var(--c-text-dim)" }}>
              +{pending.data.count - 3} more — review in Approvals Management.
            </div>
          )}
        </div>

        <div className="dash-card p-5">
          <div className="dash-section-title">Tournament Health</div>
          {tournamentHealth.loading ? (
            <div className="text-xs text-[var(--c-text-dim)] py-4">Loading…</div>
          ) : tournamentHealth.error ? (
            <div className="text-xs py-4" style={{ color: "#FF4655" }}>
              {tournamentHealth.error}
            </div>
          ) : tournamentHealth.data.length === 0 ? (
            <div className="text-xs text-[var(--c-text-muted)] py-4">No tournament data available.</div>
          ) : (
            tournamentHealth.data.map((t) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
