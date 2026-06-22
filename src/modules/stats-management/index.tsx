"use client";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

interface Player {
  id: string;
  name: string;
  ign: string;
  game: string;
  role: string;
  rank: string;
  winRate: string;
  kda: string;
  history: string[];
  drafted: boolean;
  team: string | null;
}

type SortKey = "name" | "kda" | "winRate" | "game";

export default function StatsManagementModule() {
  const { profile } = useAuth();

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("kda");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const allowed =
    profile?.role === "organizer" || profile?.role === "admin";

  // ── Firestore listener ────────────────────────────────────────────────────
  useEffect(() => {
    if (!allowed) return;

    const q = query(collection(db, "players"), orderBy("name", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setPlayers(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Player, "id">),
          }))
        );
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [allowed]);

  if (!allowed) {
    return <div className="p-6 text-red-400 text-sm">Access denied.</div>;
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const games = [...new Set(players.map((p) => p.game).filter(Boolean))];

  const parseNum = (val: string) => parseFloat(val?.replace("%", "") || "0") || 0;

  const filtered = players
    .filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        p.name?.toLowerCase().includes(q) ||
        p.ign?.toLowerCase().includes(q) ||
        p.role?.toLowerCase().includes(q) ||
        p.team?.toLowerCase().includes(q);
      const matchGame = gameFilter === "all" || p.game === gameFilter;
      return matchSearch && matchGame;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "game") cmp = a.game.localeCompare(b.game);
      else if (sortKey === "kda") cmp = parseNum(a.kda) - parseNum(b.kda);
      else if (sortKey === "winRate") cmp = parseNum(a.winRate) - parseNum(b.winRate);
      return sortDir === "desc" ? -cmp : cmp;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      <span className="ml-1" style={{ color: "var(--c-accent)" }}>{sortDir === "desc" ? "↓" : "↑"}</span>
    ) : (
      <span className="ml-1" style={{ color: "var(--c-text-dim)", opacity: 0.3 }}>↕</span>
    );

  const histColor = (r: string) =>
    r === "Win" ? "bg-emerald-500/20 text-emerald-400" :
    r === "Loss" ? "bg-red-500/20 text-red-400" :
    "bg-surface2 text-dim";

  // KPI summary
  const totalPlayers = players.length;
  const drafted = players.filter((p) => p.drafted).length;
  const freeAgents = totalPlayers - drafted;
  const avgKda =
    totalPlayers > 0
      ? (players.reduce((s, p) => s + parseNum(p.kda), 0) / totalPlayers).toFixed(2)
      : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-theme text-xl font-bold">Player Statistics</h2>
        <p className="text-muted text-sm mt-0.5">
          Live from Firestore — {totalPlayers} player{totalPlayers !== 1 ? "s" : ""} tracked
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Players", value: totalPlayers, color: "text-theme" },
          { label: "Drafted",       value: drafted,      color: "text-indigo-400" },
          { label: "Free Agents",   value: freeAgents,   color: "text-amber-400" },
          { label: "Avg KDA",       value: avgKda,       color: "text-emerald-400" },
        ].map((c) => (
<<<<<<< HEAD
          <div key={c.label} className="rounded-xl p-4" style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
            <p className="text-dim text-xs mb-1">{c.label}</p>
=======
          <div key={c.label} className="dash-card p-4">
            <p className="text-muted text-xs mb-1">{c.label}</p>
>>>>>>> 064334c78f6ef58853ee32f1fd04db10a6b447e9
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name, IGN, role, team…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="dash-input flex-1 min-w-48"
        />
        <select
          value={gameFilter}
          onChange={(e) => setGameFilter(e.target.value)}
<<<<<<< HEAD
          className="dash-select"
=======
          className="dash-select md:w-48"
>>>>>>> 064334c78f6ef58853ee32f1fd04db10a6b447e9
        >
          <option value="all">All Games</option>
          {games.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
<<<<<<< HEAD
        <div className="text-center py-16 text-dim text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">
          No players match your search.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--c-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="uppercase text-[11px] tracking-wider" style={{ backgroundColor: "var(--c-surface2)", color: "var(--c-text-dim)" }}>
                <th
                  className="px-4 py-3 text-left cursor-pointer transition"
                  style={{ color: "var(--c-text-dim)" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--c-text)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--c-text-dim)"}
=======
        <div className="text-center py-16 text-muted text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-dim text-sm">
          No players match your search.
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="w-full text-sm">
            <thead className="dash-thead">
              <tr>
                <th
                  className="dash-th cursor-pointer hover:text-theme/80 transition"
>>>>>>> 064334c78f6ef58853ee32f1fd04db10a6b447e9
                  onClick={() => toggleSort("name")}
                >
                  Player <SortIcon k="name" />
                </th>
                <th
<<<<<<< HEAD
                  className="px-4 py-3 text-left cursor-pointer transition"
                  style={{ color: "var(--c-text-dim)" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--c-text)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--c-text-dim)"}
=======
                  className="dash-th cursor-pointer hover:text-theme/80 transition"
>>>>>>> 064334c78f6ef58853ee32f1fd04db10a6b447e9
                  onClick={() => toggleSort("game")}
                >
                  Game <SortIcon k="game" />
                </th>
                <th className="dash-th">Role</th>
                <th className="dash-th">Rank</th>
                <th
<<<<<<< HEAD
                  className="px-4 py-3 text-center cursor-pointer transition"
                  style={{ color: "var(--c-text-dim)" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--c-text)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--c-text-dim)"}
=======
                  className="dash-th text-center cursor-pointer hover:text-theme/80 transition"
>>>>>>> 064334c78f6ef58853ee32f1fd04db10a6b447e9
                  onClick={() => toggleSort("winRate")}
                >
                  Win Rate <SortIcon k="winRate" />
                </th>
                <th
<<<<<<< HEAD
                  className="px-4 py-3 text-center cursor-pointer transition"
                  style={{ color: "var(--c-text-dim)" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--c-text)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--c-text-dim)"}
=======
                  className="dash-th text-center cursor-pointer hover:text-theme/80 transition"
>>>>>>> 064334c78f6ef58853ee32f1fd04db10a6b447e9
                  onClick={() => toggleSort("kda")}
                >
                  KDA <SortIcon k="kda" />
                </th>
                <th className="dash-th">Team</th>
                <th className="dash-th text-center">Recent</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--c-border)" }}>
              {filtered.map((p) => (
<<<<<<< HEAD
                <tr key={p.id} className="transition" style={{ color: "var(--c-text)" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--c-surface2)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: "var(--c-text)" }}>{p.name}</p>
                    <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>{p.ign}</p>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--c-text-muted)" }}>{p.game}</td>
                  <td className="px-4 py-3" style={{ color: "var(--c-text-muted)" }}>{p.role}</td>
=======
                <tr key={p.id} className="dash-tr text-theme">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-muted text-xs">{p.ign}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.game}</td>
                  <td className="px-4 py-3 text-muted">{p.role}</td>
>>>>>>> 064334c78f6ef58853ee32f1fd04db10a6b447e9
                  <td className="px-4 py-3">
                    <span className="bg-amber-500/15 text-amber-400 text-xs px-2 py-0.5 rounded-full">
                      {p.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-medium">
                    {p.winRate}
                  </td>
                  <td className="px-4 py-3 text-center text-indigo-400 font-bold">
                    {p.kda}
                  </td>
<<<<<<< HEAD
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--c-text-muted)" }}>
=======
                  <td className="px-4 py-3 text-muted text-xs">
>>>>>>> 064334c78f6ef58853ee32f1fd04db10a6b447e9
                    {p.team ?? (
                      <span className="text-amber-400">Free Agent</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center flex-wrap">
                      {(p.history ?? []).slice(-5).map((r, i) => (
                        <span
                          key={i}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${histColor(r)}`}
                        >
                          {r[0]}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
