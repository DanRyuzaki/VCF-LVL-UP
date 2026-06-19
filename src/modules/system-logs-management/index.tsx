"use client";
import { useState } from "react";

const systemLogs = [
  { time: "2025-06-12 14:02:11", type: "INFO",  msg: "User login: marco@faith.com [Organizer]" },
  { time: "2025-06-12 14:01:55", type: "INFO",  msg: "Bracket generated: MLBB S4 — 8 teams" },
  { time: "2025-06-12 13:58:30", type: "WARN",  msg: "Announcement submission queued — awaiting approval" },
  { time: "2025-06-12 13:45:22", type: "ERROR", msg: "Firebase Auth timeout — retry successful" },
  { time: "2025-06-12 13:40:01", type: "INFO",  msg: "Match result submitted: Team Blaze 2-0 Team Storm" },
  { time: "2025-06-12 13:22:44", type: "INFO",  msg: "Player drafted: Ana Lim → Team Frost" },
  { time: "2025-06-12 13:15:09", type: "WARN",  msg: "Slow page load detected: /organizer/brackets (2.4s)" },
  { time: "2025-06-12 12:59:55", type: "INFO",  msg: "User logout: admin@faith.com" },
];

function logTypeColor(type: string) {
  if (type === "ERROR") return "#FF4655";
  if (type === "WARN")  return "#EAB308";
  return "#00F5D4";
}

export default function SystemLogsManagementModule() {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter === "ALL" ? systemLogs : systemLogs.filter((l) => l.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["ALL", "INFO", "WARN", "ERROR"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`dash-filter-btn ${filter === f ? "active" : ""}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="dash-table-wrap">
        <div className="p-4 font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
          {filtered.map((log, i) => (
            <div
              key={i}
              className="flex gap-4 py-1"
              style={{ borderBottom: "1px solid var(--c-border)" }}
            >
              <span className="shrink-0" style={{ color: "var(--c-text-dim)" }}>{log.time}</span>
              <span className="w-12 shrink-0 font-bold" style={{ color: logTypeColor(log.type) }}>{log.type}</span>
              <span style={{ color: "var(--c-text-muted)" }}>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}