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

interface CalendarEventDoc {
  id: string;
  title: string;
  submittedByName: string;
  date: string;
  time: string;
  status: "pending" | "approved" | "rejected";
}

export default function ApprovalsManagementModule() {
  const { profile } = useAuth();

  const [announcements, setAnnouncements] = useState<AnnouncementDoc[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventDoc[]>([]);
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
    let resolved = 0;
    const total = 2;
    const maybeReady = () => { resolved++; if (resolved >= total) setLoading(false); };

    // Show ALL announcements (pending + already reviewed) so admin has full history
    const announcementsQ = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );

    const unsubAnnouncements = onSnapshot(
      announcementsQ,
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
        setAnnouncements(rows);
        maybeReady();
      },
      (err) => {
        console.error("announcements snapshot error:", err);
        setError("Failed to load announcements.");
        maybeReady();
      }
    );

    // Show ALL calendar events (pending + already reviewed) so admin has full history
    const calendarEventsQ = query(
      collection(db, "calendar_events"),
      orderBy("date", "asc")
    );

    const unsubCalendarEvents = onSnapshot(
      calendarEventsQ,
      (snap) => {
        const rows: CalendarEventDoc[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title ?? "—",
            submittedByName: data.submittedByName ?? "—",
            date: data.date ?? "—",
            time: data.time ?? "—",
            status: data.status ?? "pending",
          };
        });
        setCalendarEvents(rows);
        maybeReady();
      },
      (err) => {
        console.error("calendar events snapshot error:", err);
        setError("Failed to load calendar events.");
        maybeReady();
      }
    );

    return () => {
      unsubAnnouncements();
      unsubCalendarEvents();
    };
  }, []);

  const handleAnnouncementAction = async (id: string, action: "approved" | "rejected") => {
    if (!profile) return;
    setActionLoading(id + "-ann-" + action);
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

  const handleCalendarEventAction = async (id: string, action: "approved" | "rejected") => {
    if (!profile) return;
    setActionLoading(id + "-cal-" + action);
    setError(null);
    try {
      await updateDoc(doc(db, "calendar_events", id), {
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

  const pendingAnnouncements = announcements.filter((i) => i.status === "pending");
  const reviewedAnnouncements = announcements.filter((i) => i.status !== "pending");
  const pendingCalendarEvents = calendarEvents.filter((i) => i.status === "pending");
  const reviewedCalendarEvents = calendarEvents.filter((i) => i.status !== "pending");

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-[#FF4655]/10 border border-[#FF4655]/30 text-[#FF4655] text-xs rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-xs py-8" style={{ color: "var(--c-text-dim)" }}>
          Loading approval items…
        </div>
      ) : (
        <>
          {/* Pending Announcements section */}
          <div className="dash-card p-5">
            <div className="dash-section-title">
              Pending Announcements
              {pendingAnnouncements.length > 0 && (
                <span className="ml-2 bg-[#FF4655]/20 text-[#FF4655] text-[10px] font-bold px-2 py-0.5 rounded">
                  {pendingAnnouncements.length}
                </span>
              )}
            </div>
            {pendingAnnouncements.length === 0 ? (
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
                    {pendingAnnouncements.map((item) => {
                      const busy = actionLoading?.startsWith(item.id + "-ann-");
                      return (
                        <tr key={item.id} className="dash-tr">
                          <td className="dash-td font-medium">{item.title}</td>
                          <td className="dash-td-muted">{item.submittedBy}</td>
                          <td className="dash-td-dim">{item.submittedAt}</td>
                          <td className="dash-td">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAnnouncementAction(item.id, "approved")}
                                disabled={!!busy}
                                className="bg-[#00F5D4]/20 text-[#00F5D4] hover:bg-[#00F5D4]/30 text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                              >
                                {actionLoading === item.id + "-ann-approved" ? "…" : "Approve"}
                              </button>
                              <button
                                onClick={() => handleAnnouncementAction(item.id, "rejected")}
                                disabled={!!busy}
                                className="dash-btn-ghost text-xs px-3 py-1.5 rounded disabled:opacity-50"
                              >
                                {actionLoading === item.id + "-ann-rejected" ? "…" : "Reject"}
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

          {/* Pending Calendar Events section */}
          <div className="dash-card p-5">
            <div className="dash-section-title">
              Pending Calendar Events
              {pendingCalendarEvents.length > 0 && (
                <span className="ml-2 bg-[#FF4655]/20 text-[#FF4655] text-[10px] font-bold px-2 py-0.5 rounded">
                  {pendingCalendarEvents.length}
                </span>
              )}
            </div>
            {pendingCalendarEvents.length === 0 ? (
              <div className="text-xs py-4" style={{ color: "var(--c-text-dim)" }}>
                No pending calendar events.
              </div>
            ) : (
              <div className="dash-table-wrap mt-3">
                <table className="w-full border-collapse">
                  <thead className="dash-thead">
                    <tr>
                      {["Event", "Date", "Time", "Submitted By", "Actions"].map((h) => (
                        <th key={h} className="dash-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCalendarEvents.map((item) => {
                      const busy = actionLoading?.startsWith(item.id + "-cal-");
                      return (
                        <tr key={item.id} className="dash-tr">
                          <td className="dash-td font-medium">{item.title}</td>
                          <td className="dash-td-muted">{item.date}</td>
                          <td className="dash-td-muted">{item.time || "—"}</td>
                          <td className="dash-td-muted">{item.submittedByName}</td>
                          <td className="dash-td">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCalendarEventAction(item.id, "approved")}
                                disabled={!!busy}
                                className="bg-[#00F5D4]/20 text-[#00F5D4] hover:bg-[#00F5D4]/30 text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                              >
                                {actionLoading === item.id + "-cal-approved" ? "…" : "Approve"}
                              </button>
                              <button
                                onClick={() => handleCalendarEventAction(item.id, "rejected")}
                                disabled={!!busy}
                                className="dash-btn-ghost text-xs px-3 py-1.5 rounded disabled:opacity-50"
                              >
                                {actionLoading === item.id + "-cal-rejected" ? "…" : "Reject"}
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
          {(reviewedAnnouncements.length > 0 || reviewedCalendarEvents.length > 0) && (
            <>
              <div className="dash-card p-5">
                <div className="dash-section-title">Review History</div>
                <div className="dash-table-wrap mt-3">
                  <table className="w-full border-collapse">
                    <thead className="dash-thead">
                      <tr>
                        {["Type", "Title/Event", "Submitted By", "Date", "Status"].map((h) => (
                          <th key={h} className="dash-th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reviewedAnnouncements.map((item) => (
                        <tr key={item.id} className="dash-tr">
                          <td className="dash-td">Announcement</td>
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
                      {reviewedCalendarEvents.map((item) => (
                        <tr key={item.id} className="dash-tr">
                          <td className="dash-td">Calendar Event</td>
                          <td className="dash-td font-medium">{item.title}</td>
                          <td className="dash-td-muted">{item.submittedByName}</td>
                          <td className="dash-td-dim">{item.date}</td>
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
            </>
          )}
        </>
      )}
    </div>
  );
}
