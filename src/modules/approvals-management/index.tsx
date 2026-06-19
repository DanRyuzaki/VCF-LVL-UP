"use client";
import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

interface AnnouncementDoc {
  id: string;
  title: string;
  submittedBy: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export default function ApprovalsManagementModule() {
  const { profile } = useAuth();

  const [items, setItems] = useState<AnnouncementDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Admin-only guard
  if (profile && profile.role !== "admin") {
    return (
      <div className="text-center text-xs py-8" style={{ color: "var(--c-text-dim)" }}>
        Access restricted to admins.
      </div>
    );
  }

  useEffect(() => {
    // Show ALL announcements (pending + already reviewed) so admin has full history
    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: AnnouncementDoc[] = snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt?.toDate?.();
          return {
            id: d.id,
            title: data.title ?? "—",
            submittedBy: data.submittedBy ?? "—",
            submittedAt: ts ? ts.toISOString().slice(0, 10) : "—",
            status: data.status ?? "pending",
          };
        });
        setItems(rows);
        setLoading(false);
      },
      (err) => {
        console.error("approvals snapshot error:", err);
        setError("Failed to load announcements.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    if (!profile) return;
    setActionLoading(id + action);
    setError(null);
    try {
      await updateDoc(doc(db, "announcements", id), {
        status: action,
        reviewedBy: profile.uid,
        reviewedByName: `${profile.firstName} ${profile.lastName}`.trim(),
        reviewedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("updateDoc error:", err);
      setError("Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const pending = items.filter((i) => i.status === "pending");
  const reviewed = items.filter((i) => i.status !== "pending");

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-[#FF4655]/10 border border-[#FF4655]/30 text-[#FF4655] text-xs rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-xs py-8" style={{ color: "var(--c-text-dim)" }}>
          Loading announcements…
        </div>
      ) : (
        <>
          {/* Pending section */}
          <div className="dash-card p-5">
            <div className="dash-section-title">
              Pending Announcements
              {pending.length > 0 && (
                <span className="ml-2 bg-[#FF4655]/20 text-[#FF4655] text-[10px] font-bold px-2 py-0.5 rounded">
                  {pending.length}
                </span>
              )}
            </div>
            {pending.length === 0 ? (
              <div className="text-xs py-4" style={{ color: "var(--c-text-dim)" }}>
                No pending announcements.
              </div>
            ) : (
              <div className="dash-table-wrap mt-3">
                <table className="w-full border-collapse">
                  <thead className="dash-thead">
                    <tr>
                      {["Title", "Submitted By", "Date", "Actions"].map((h) => (
                        <th key={h} className="dash-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((item) => {
                      const busy = actionLoading?.startsWith(item.id);
                      return (
                        <tr key={item.id} className="dash-tr">
                          <td className="dash-td font-medium">{item.title}</td>
                          <td className="dash-td-muted">{item.submittedBy}</td>
                          <td className="dash-td-dim">{item.submittedAt}</td>
                          <td className="dash-td">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAction(item.id, "approved")}
                                disabled={!!busy}
                                className="bg-[#00F5D4]/20 text-[#00F5D4] hover:bg-[#00F5D4]/30 text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                              >
                                {actionLoading === item.id + "approved" ? "…" : "Approve"}
                              </button>
                              <button
                                onClick={() => handleAction(item.id, "rejected")}
                                disabled={!!busy}
                                className="dash-btn-ghost text-xs px-3 py-1.5 rounded disabled:opacity-50"
                              >
                                {actionLoading === item.id + "rejected" ? "…" : "Reject"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Reviewed history */}
          {reviewed.length > 0 && (
            <div className="dash-card p-5">
              <div className="dash-section-title">Review History</div>
              <div className="dash-table-wrap mt-3">
                <table className="w-full border-collapse">
                  <thead className="dash-thead">
                    <tr>
                      {["Title", "Submitted By", "Date", "Status"].map((h) => (
                        <th key={h} className="dash-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reviewed.map((item) => (
                      <tr key={item.id} className="dash-tr">
                        <td className="dash-td font-medium">{item.title}</td>
                        <td className="dash-td-muted">{item.submittedBy}</td>
                        <td className="dash-td-dim">{item.submittedAt}</td>
                        <td className="dash-td">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                              item.status === "approved"
                                ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                                : "bg-[#FF4655]/20 text-[#FF4655]"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
