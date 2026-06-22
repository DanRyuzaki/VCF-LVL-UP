"use client";
import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  status: "pending" | "approved";
  submittedBy: string;
  submittedByName: string;
  createdAt?: unknown;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

interface Props {
  showSubmitForm?:     boolean;
  showApproveActions?: boolean;
}

// ── Day Detail Modal ─────────────────────────────────────────────────────────
function DayModal({
  day,
  month,
  year,
  events,
  onClose,
}: {
  day: number;
  month: number;
  year: number;
  events: CalendarEvent[];
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const dateObj  = new Date(year, month, day);
  const dayName  = DAY_NAMES[dateObj.getDay()];
  const monthName = MONTH_NAMES[month];

  const fmt12h = (t: string) => {
    if (!t) return "All day";
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--c-surface, #1a1a2e)",
          border: "1px solid var(--c-border, rgba(255,255,255,0.08))",
          color: "var(--c-text, #e2e8f0)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--c-border, rgba(255,255,255,0.08))" }}
        >
          <div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--c-text-dim, #94a3b8)" }}>
              {dayName}
            </div>
            <div className="text-sm font-bold uppercase tracking-wider mt-0.5">
              {monthName} {day}, {year}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-lg leading-none opacity-40 hover:opacity-100 transition-opacity"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Event list */}
        <div className="px-5 py-4 space-y-3 max-h-72 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: "var(--c-text-dim, #94a3b8)" }}>
              No events on this day.
            </p>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-3 rounded-lg px-3 py-3"
                style={{ backgroundColor: "var(--c-surface3, rgba(255,255,255,0.04))" }}
              >
                {/* Dot */}
                <span
                  className="mt-0.5 shrink-0 w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      ev.status === "approved" ? "#00F5D4" : "#8B5CF6",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{ev.title}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "var(--c-text-dim, #94a3b8)" }}>
                    {fmt12h(ev.time)}
                  </div>
                  <span
                    className={`inline-block mt-1.5 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      ev.status === "approved"
                        ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                        : "bg-[#8B5CF6]/20 text-[#8B5CF6]"
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3"
          style={{ borderTop: "1px solid var(--c-border, rgba(255,255,255,0.08))" }}
        >
          <button
            onClick={onClose}
            className="w-full text-xs font-semibold uppercase tracking-widest py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--c-border, rgba(255,255,255,0.08))",
              color: theme === "light" ? "#ffffff" : "#000000",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Module ──────────────────────────────────────────────────────────────
export default function CalendarManagementModule({
  showSubmitForm    = true,
  showApproveActions = false,
}: Props) {
  const { profile } = useAuth();

  const [events,  setEvents]  = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate,  setEventDate]  = useState("");
  const [eventTime,  setEventTime]  = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitErr,  setSubmitErr]  = useState<string | null>(null);

  // Calendar view
  const today      = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Day modal
  const [modalDay, setModalDay] = useState<number | null>(null);

  // ── Firestore listener ───────────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, "calendar_events"), orderBy("date", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setEvents(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CalendarEvent, "id">) })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const monthKey = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const getEventsForDay = (day: number) => {
    const key = monthKey(viewYear, viewMonth, day);
    return events.filter((e) => e.date === key);
  };

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString("default", {
    month: "long", year: "numeric",
  });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitErr(null);
    if (!eventTitle.trim() || !eventDate) { setSubmitErr("Title and date are required."); return; }
    if (!profile) { setSubmitErr("You must be signed in."); return; }

    const now = new Date();
    const selectedDate = new Date(`${eventDate}T${eventTime || "00:00"}`);
    if (!eventTime) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setSubmitErr("Event date cannot be in the past.");
        return;
      }
    } else {
      if (selectedDate < now) {
        setSubmitErr("Event date and time cannot be in the past.");
        return;
      }
    }

    const isDoubleBooked = events.some(
      (e) => e.date === eventDate && e.time === (eventTime || "")
    );
    if (isDoubleBooked) {
      setSubmitErr("An event is already scheduled at this date and time.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "calendar_events"), {
        title:           eventTitle.trim(),
        date:            eventDate,
        time:            eventTime || "",
        status:          showApproveActions ? "approved" : "pending",
        submittedBy:     profile.uid,
        submittedByName: `${profile.firstName} ${profile.lastName}`,
        createdAt:       serverTimestamp(),
      });
      setEventTitle(""); setEventDate(""); setEventTime("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setSubmitErr(err instanceof Error ? err.message : "Failed to submit event.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Approve / Reject ─────────────────────────────────────────────────────
  const handleApprove = async (id: string) =>
    updateDoc(doc(db, "calendar_events", id), { status: "approved" });
  const handleReject  = async (id: string) =>
    updateDoc(doc(db, "calendar_events", id), { status: "rejected" });

  return (
    <>
      {/* Day detail modal */}
      {modalDay !== null && (
        <DayModal
          day={modalDay}
          month={viewMonth}
          year={viewYear}
          events={getEventsForDay(modalDay)}
          onClose={() => setModalDay(null)}
        />
      )}

      <div className="space-y-6">
        {/* ── Submit form ──────────────────────────────────────────────── */}
        {showSubmitForm && (
          <div className="dash-card p-5">
            <div className="dash-section-title">Request New Event</div>
            {submitted && (
              <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-2 mb-4">
                {showApproveActions ? "Event added to the calendar." : "Event submitted for admin approval."}
              </div>
            )}
            {submitErr && (
              <div className="bg-[#FF4655]/10 border border-[#FF4655]/30 text-[#FF4655] text-xs rounded-lg px-4 py-2 mb-4">
                {submitErr}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="dash-label">Event Title <span style={{ color: "#EF4444" }}>*</span></label>
                <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="e.g. QF Match Day" className="dash-input" />
              </div>
              <div>
                <label className="dash-label">Date <span style={{ color: "#EF4444" }}>*</span></label>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="dash-input" />
              </div>
              <div>
                <label className="dash-label">Time</label>
                <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="dash-input" />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-4 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting…" : showApproveActions ? "Add Event" : "Submit for Approval"}
            </button>
          </div>
        )}

        {/* ── Calendar grid ─────────────────────────────────────────────── */}
        <div className="dash-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-head text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--c-text)" }}>
              {monthLabel}
            </div>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="dash-btn-ghost text-xs px-2 py-1 rounded">‹</button>
              <button onClick={nextMonth} className="dash-btn-ghost text-xs px-2 py-1 rounded">›</button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-[#FF4655] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] uppercase tracking-wider py-1" style={{ color: "var(--c-text-dim)" }}>
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const evs = getEventsForDay(day);
                  const isToday =
                    day === today.getDate() &&
                    viewMonth === today.getMonth() &&
                    viewYear === today.getFullYear();

                  return (
                    <div
                      key={day}
                      onClick={() => setModalDay(day)}
                      className="rounded min-h-[56px] p-1 cursor-pointer transition-colors hover:bg-white/5"
                      style={{
                        backgroundColor: "var(--c-surface3)",
                        outline: isToday ? "1px solid #FF4655" : undefined,
                      }}
                    >
                      <div
                        className="text-[10px] mb-1 font-semibold"
                        style={{ color: isToday ? "#FF4655" : "var(--c-text-dim)" }}
                      >
                        {day}
                      </div>
                      {evs.map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-[9px] rounded px-1 py-0.5 mb-0.5 truncate ${
                            ev.status === "approved"
                              ? "bg-[#FF4655]/20 text-[#FF4655]"
                              : "bg-[#8B5CF6]/20 text-[#8B5CF6]"
                          }`}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ── Approve actions table (admin only) ────────────────────────── */}
        {showApproveActions && (
          <div className="dash-table-wrap">
            <table className="w-full border-collapse">
              <thead className="dash-thead">
                <tr>
                  {["Event", "Date", "Time", "Submitted By", "Status", "Actions"].map((h) => (
                    <th key={h} className="dash-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.length === 0 && (
                  <tr>
                    <td colSpan={6} className="dash-td text-center" style={{ color: "var(--c-text-muted)" }}>
                      No events yet.
                    </td>
                  </tr>
                )}
                {events.map((e) => (
                  <tr key={e.id} className="dash-tr">
                    <td className="dash-td font-medium">{e.title}</td>
                    <td className="dash-td-muted">{e.date}</td>
                    <td className="dash-td-muted">{e.time || "—"}</td>
                    <td className="dash-td-muted">{e.submittedByName || "—"}</td>
                    <td className="dash-td">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                          e.status === "approved"
                            ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                            : "bg-[#8B5CF6]/20 text-[#8B5CF6]"
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="dash-td">
                      {e.status === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(e.id)} className="bg-[#00F5D4]/20 text-[#00F5D4] text-xs font-semibold px-3 py-1 rounded">
                            Approve
                          </button>
                          <button onClick={() => handleReject(e.id)} className="dash-btn-ghost text-xs px-3 py-1 rounded">
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}