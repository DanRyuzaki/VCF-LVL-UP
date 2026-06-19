"use client";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { IconLock } from "@/components/shared/icons";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ErrorReport {
  id: string;
  time: string;
  error: string;
  page: string;
  severity: "High" | "Medium" | "Low";
}

// ---------------------------------------------------------------------------
// Access Denied guard — developer only
// ---------------------------------------------------------------------------
function AccessDenied() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", gap: "16px", color: "var(--c-text-dim)" }}>
      <IconLock size={40} style={{ opacity: 0.4 }} />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--c-text)", marginBottom: "6px" }}>Access Restricted</p>
        <p style={{ fontSize: "13px", lineHeight: 1.6 }}>Only Developers can view error reports.</p>
      </div>
    </div>
  );
}

function sevStyle(s: string) {
  if (s === "High")   return "bg-[#FF4655]/20 text-[#FF4655]";
  if (s === "Medium") return "bg-yellow-400/20 text-yellow-400";
  return "";
}
function sevBg(s: string) {
  return s === "Low" ? "var(--c-surface3)" : undefined;
}

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------
export default function ErrorReportsManagementModule() {
  const { profile } = useAuth();
  if (profile && profile.role !== "developer") return <AccessDenied />;
  return <ErrorReportsInner />;
}

function ErrorReportsInner() {
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [filterSev, setFilterSev] = useState("ALL");

  useEffect(() => {
    async function load() {
      try {
        // audit_logs collection filtered to type=ERROR
        const q = query(
          collection(db, "audit_logs"),
          where("type", "==", "ERROR"),
          orderBy("createdAt", "desc"),
          limit(100)
        );
        const snap = await getDocs(q);
        const rows: ErrorReport[] = snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date();
          return {
            id: d.id,
            time: ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            error: data.message ?? data.msg ?? "Unknown error",
            page: data.page ?? data.url ?? "—",
            severity: (data.severity ?? "Medium") as ErrorReport["severity"],
          };
        });
        setErrors(rows);
      } catch (err) {
        console.error("error-reports: failed to load", err);
        setLoadError("Could not load error reports. The audit_logs collection may not exist yet.");
      } finally {
        setHydrated(true);
      }
    }
    load();
  }, []);

  const filtered = filterSev === "ALL" ? errors : errors.filter((e) => e.severity === filterSev);

  if (!hydrated) {
    return <div className="text-center py-8 text-sm" style={{ color: "var(--c-text-dim)" }}>Loading error reports…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["ALL", "High", "Medium", "Low"].map((s) => (
          <button key={s} onClick={() => setFilterSev(s)} className={`dash-filter-btn ${filterSev === s ? "active" : ""}`}>{s}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--c-text-dim)", alignSelf: "center" }}>
          {filtered.length} entr{filtered.length === 1 ? "y" : "ies"}
        </span>
      </div>

      {loadError && (
        <div style={{ padding: "12px 16px", backgroundColor: "rgba(255,193,7,0.06)", border: "1px solid rgba(255,193,7,0.2)", borderRadius: "8px", fontSize: "12px", color: "#F59E0B" }}>
          {loadError}
          <p style={{ marginTop: "6px", color: "var(--c-text-dim)" }}>
            Errors will appear here once the system begins writing to the <code style={{ color: "var(--c-text-muted)" }}>audit_logs</code> collection with <code style={{ color: "var(--c-text-muted)" }}>type: "ERROR"</code>.
          </p>
        </div>
      )}

      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {["Time", "Error", "Page", "Severity"].map((h) => (
                <th key={h} className="dash-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="dash-td text-center" style={{ color: "var(--c-text-dim)", padding: "32px" }}>
                  {loadError ? "No error data available." : `No ${filterSev === "ALL" ? "" : filterSev + " severity "}errors recorded.`}
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id} className="dash-tr">
                  <td className="dash-td-dim font-mono">{e.time}</td>
                  <td className="dash-td">{e.error}</td>
                  <td className="dash-td-muted font-mono">{e.page}</td>
                  <td className="dash-td">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${sevStyle(e.severity)}`}
                      style={sevBg(e.severity) ? { backgroundColor: sevBg(e.severity) } : {}}
                    >
                      {e.severity}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
