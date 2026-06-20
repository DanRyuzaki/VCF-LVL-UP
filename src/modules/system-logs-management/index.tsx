"use client";
import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { IconLock } from "@/components/shared/icons";

interface AuditLog {
  id: string;
  time: string;
  type: "INFO" | "WARN" | "ERROR";
  msg: string;
  rawTs: number;
}

function AccessDenied() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", gap: "16px", color: "var(--c-text-dim)" }}>
      <IconLock size={40} style={{ opacity: 0.4 }} />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--c-text)", marginBottom: "6px" }}>Access Restricted</p>
        <p style={{ fontSize: "13px", lineHeight: 1.6 }}>Only Developers can view system logs.</p>
      </div>
    </div>
  );
}

function logTypeColor(type: string) {
  if (type === "ERROR") return "#FF4655";
  if (type === "WARN")  return "#EAB308";
  return "#00F5D4";
}

export default function SystemLogsManagementModule() {
  const { profile } = useAuth();
  if (profile && profile.role !== "developer") return <AccessDenied />;
  return <SystemLogsInner />;
}

function SystemLogsInner() {
  const [logs, setLogs]         = useState<AuditLog[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter]     = useState("ALL");

  useEffect(() => {
    const q = query(
      collection(db, "audit_logs"),
      orderBy("createdAt", "desc"),
      limit(200)
    );

    // onSnapshot instead of getDocs — new log entries appear in real time
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: AuditLog[] = snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date();
          const timeStr = ts.toISOString().replace("T", " ").slice(0, 19);
          return {
            id: d.id,
            time: timeStr,
            type: (data.type ?? "INFO") as AuditLog["type"],
            msg: data.message ?? data.msg ?? "",
            rawTs: ts.getTime(),
          };
        });
        setLogs(rows);
        setLoadError("");
        setHydrated(true);
      },
      (err) => {
        console.error("system-logs: snapshot error", err);
        setLoadError("Could not load system logs. The audit_logs collection may not exist yet.");
        setHydrated(true);
      }
    );

    return unsub;
  }, []);

  const filtered = filter === "ALL" ? logs : logs.filter((l) => l.type === filter);

  if (!hydrated) {
    return <div className="text-center py-8 text-sm" style={{ color: "var(--c-text-dim)" }}>Loading logs…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["ALL", "INFO", "WARN", "ERROR"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`dash-filter-btn ${filter === f ? "active" : ""}`}>{f}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--c-text-dim)", alignSelf: "center" }}>
          {filtered.length} entr{filtered.length === 1 ? "y" : "ies"}
        </span>
      </div>

      {loadError && (
        <div style={{ padding: "12px 16px", backgroundColor: "rgba(255,193,7,0.06)", border: "1px solid rgba(255,193,7,0.2)", borderRadius: "8px", fontSize: "12px", color: "#F59E0B" }}>
          {loadError}
          <p style={{ marginTop: "6px", color: "var(--c-text-dim)" }}>
            Logs will appear here automatically once the system begins writing to the <code style={{ color: "var(--c-text-muted)" }}>audit_logs</code> collection.
          </p>
        </div>
      )}

      <div className="dash-table-wrap">
        <div className="p-4 font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-8" style={{ color: "var(--c-text-dim)" }}>
              {loadError ? "No logs available." : `No ${filter === "ALL" ? "" : filter + " "}logs yet.`}
            </div>
          ) : (
            filtered.map((log) => (
              <div key={log.id} className="flex gap-4 py-1" style={{ borderBottom: "1px solid var(--c-border)" }}>
                <span className="shrink-0" style={{ color: "var(--c-text-dim)" }}>{log.time}</span>
                <span className="w-12 shrink-0 font-bold" style={{ color: logTypeColor(log.type) }}>{log.type}</span>
                <span style={{ color: "var(--c-text-muted)" }}>{log.msg}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}