"use client";

import { useMemo, useState } from "react";
import { useOrganizerContext } from "@/lib/organizer-context";
import StatCard from "@/components/shared/stat-card";

/**
 * Free Agents Directory (Organizer — read-only)
 * ──────────────────────────────────────────────
 * Lets an organizer browse gamers currently listed as free agents
 * (i.e. not yet drafted onto a team and not pending approval).
 *
 * Only metadata that's actually useful for scouting/drafting decisions
 * is surfaced here — recruitment-relevant fields like in-game role,
 * rank, win rate, KDA, and recent match form. Personal contact details
 * (email) and internal bookkeeping fields (doc id, drafted/pending
 * status) are intentionally left out, since this view is a browsing
 * directory, not a player account record.
 *
 * This module has no create/edit/delete actions — drafting a free
 * agent onto a team is handled in the Team & Draft Management module.
 */
export default function FreeAgentsDirectoryModule() {
  const { freeAgents, loading } = useOrganizerContext();

  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState("All");

  const games = useMemo(() => {
    const unique = Array.from(new Set(freeAgents.map((fa) => fa.game).filter(Boolean)));
    return ["All", ...unique];
  }, [freeAgents]);

  const filtered = useMemo(() => {
    return freeAgents.filter((fa) => {
      const matchesGame = gameFilter === "All" || fa.game === gameFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        fa.name.toLowerCase().includes(q) ||
        fa.ign.toLowerCase().includes(q) ||
        fa.role.toLowerCase().includes(q);
      return matchesGame && matchesSearch;
    });
  }, [freeAgents, search, gameFilter]);

  const totalFreeAgents = freeAgents.length;
  const mlbbCount = freeAgents.filter((fa) => fa.game === "MLBB").length;
  const codmCount = freeAgents.filter((fa) => fa.game === "CODM").length;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard value={totalFreeAgents} label="Total Free Agents" accent="purple" />
        <StatCard value={mlbbCount} label="MLBB Free Agents" accent="teal" />
        <StatCard value={codmCount} label="CODM Free Agents" accent="red" />
      </div>

      {/* Filters */}
      <div className="dash-card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, IGN, or role..."
              className="dash-input"
<<<<<<< HEAD
=======
              style={{ paddingLeft: "36px" }}
>>>>>>> 064334c78f6ef58853ee32f1fd04db10a6b447e9
            />
          </div>
          <select
            value={gameFilter}
            onChange={(e) => setGameFilter(e.target.value)}
            className="dash-select md:w-48"
          >
            {games.map((g) => (
              <option key={g} value={g}>
                {g === "All" ? "All Games" : g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Free Agents Table — read-only */}
      <div className="dash-card p-4">
        <div className="dash-section-title">Free Agent Gamers</div>
        <p className="text-xs text-[var(--c-text-muted)] mb-4">
          Browse gamers currently available for drafting. To add a free agent to a team, use the
          Team &amp; Draft Management page.
        </p>

        {loading ? (
          <div className="text-center py-8 text-xs text-[var(--c-text-muted)]">Loading free agents…</div>
        ) : (
          <div className="dash-table-wrap">
            <table className="w-full border-collapse">
              <thead className="dash-thead">
                <tr>
                  {["Name", "IGN", "Game", "Role", "Rank", "Win Rate", "KDA", "Recent Form"].map((h) => (
                    <th key={h} className="dash-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((fa) => (
                  <tr key={fa.ign} className="dash-tr">
                    <td className="dash-td font-semibold">{fa.name}</td>
                    <td className="dash-td-muted">{fa.ign}</td>
                    <td className="dash-td">{fa.game}</td>
                    <td className="dash-td">{fa.role}</td>
                    <td className="dash-td font-bold text-purple-300">{fa.rank}</td>
                    <td className="dash-td">{fa.winRate}</td>
                    <td className="dash-td">{fa.kda}</td>
                    <td className="dash-td">
                      <div className="flex gap-1">
                        {fa.history.slice(-5).map((result, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold"
                            style={
                              result === "Win"
                                ? { backgroundColor: "rgba(0,245,212,0.15)", color: "#00F5D4" }
                                : { backgroundColor: "rgba(255,70,85,0.15)", color: "#FF4655" }
                            }
                            title={result}
                          >
                            {result === "Win" ? "W" : "L"}
                          </span>
                        ))}
                        {fa.history.length === 0 && (
                          <span className="text-[var(--c-text-dim)] text-xs">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-xs text-[var(--c-text-muted)]">
                      No free agents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
