"use client";
import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;        // "YYYY-MM-DD"
  time: string;        // "HH:MM" 24h
  status: "pending" | "approved";
  submittedBy: string;
  submittedByName: string;
  createdAt?: unknown;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const fmt12 = (t: string) => {
  if (!t) return "";
  try {
    const [h, m] = t.split(":").map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  } catch { return t; }
};

export default function OrganizerCalendarManagementModule() {
  const { profile } = useAuth();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  // Calendar view
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const allowed = profile?.role === "organizer";

  // ── Firestore listener — only approved events visible in calendar
  //    organizer can also see their own pending ones ─────────────────────────
  useEffect(() => {
    if (!allowed) return;

    const q = query(
      collection(db, "calendar_events"),
      orderBy("date", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CalendarEvent, "id">),
        }));
        // Show approved events + own pending events
        setEvents(
          all.filter(
            (e) =>
              e.status === "approved" ||
              (e.status === "pending" && e.submittedBy === profile?.uid)
          )
        );
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [allowed, profile?.uid]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!title.trim() || !date) {
      setSubmitErr("Title and date are required.");
      return;
    }
    if (!profile) return;

    setSubmitting(true);
    setSubmitErr(null);
    try {
      await addDoc(collection(db, "calendar_events"), {
        title: title.trim(),
        date,
        time: time || "",
        status: "pending",
        submittedBy: profile.uid,
        submittedByName: `${profile.firstName} ${profile.lastName}`,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setDate("");
      setTime("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setSubmitErr("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!allowed) {
    return <div className="p-6 text-red-400 text-sm">Access denied. Organizers only.</div>;
  }

  // ── Calendar grid ─────────────────────────────────────────────────────────
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = today.toISOString().slice(0, 10);

  const eventsByDate: Record<string, CalendarEvent[]> = {};
  for (const e of events) {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push(e);
  }

  const monthName = new Date(viewYear, viewMonth).toLocaleString("default", {
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

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-xl font-bold">Calendar</h2>
        <p className="text-white/40 text-sm mt-0.5">
          Submit events for admin approval
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Submit form ─────────────────────────────────────────── */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">Submit an Event</h3>

          <div className="space-y-3">
            <div>
              <label className="text-white/50 text-xs mb-1 block">Event Title *</label>
              <input
                type="text"
                placeholder="e.g. MLBB Qualifiers Round 2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-white/50 text-xs mb-1 block">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-white/50 text-xs mb-1 block">Time (optional)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {submitErr && (
            <p className="text-red-400 text-xs">{submitErr}</p>
          )}

          {submitted && (
            <p className="text-emerald-400 text-xs">
              ✓ Event submitted! Waiting for admin approval.
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition"
          >
            {submitting ? "Submitting…" : "Submit for Approval"}
          </button>
        </div>

        {/* ── Right: Calendar ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="text-white/50 hover:text-white px-2 py-1 text-lg transition">‹</button>
            <h3 className="text-white font-semibold">{monthName}</h3>
            <button onClick={nextMonth} className="text-white/50 hover:text-white px-2 py-1 text-lg transition">›</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-white/30 text-xs py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="text-center py-12 text-white/40 text-sm">Loading…</div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = eventsByDate[dateStr] ?? [];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-lg text-xs transition
                      ${isToday ? "bg-indigo-600 text-white font-bold" : ""}
                      ${isSelected && !isToday ? "bg-white/15 text-white" : ""}
                      ${!isToday && !isSelected ? "text-white/70 hover:bg-white/10" : ""}
                    `}
                  >
                    {day}
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                        {dayEvents.slice(0, 3).map((e, ei) => (
                          <span
                            key={ei}
                            className={`w-1 h-1 rounded-full ${
                              e.status === "approved" ? "bg-emerald-400" : "bg-amber-400"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected day events */}
          {selectedDate && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-2 space-y-2">
              <h4 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">
                {new Date(selectedDate + "T12:00:00").toLocaleDateString(undefined, {
                  weekday: "long", month: "long", day: "numeric",
                })}
              </h4>
              {selectedEvents.length === 0 ? (
                <p className="text-white/30 text-sm">No events on this day.</p>
              ) : (
                selectedEvents.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-start gap-3 bg-white/5 rounded-lg p-3"
                  >
                    <span
                      className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        e.status === "approved" ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{e.title}</p>
                      {e.time && (
                        <p className="text-white/40 text-xs">{fmt12(e.time)}</p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] shrink-0 px-2 py-0.5 rounded-full ${
                        e.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {e.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
