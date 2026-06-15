"use client";
import { useState } from "react";

const calendarEvents = [
  { id: "ce1", title: "QF Match Day 1",   date: "2025-06-14", time: "2:00 PM", status: "approved" },
  { id: "ce2", title: "QF Match Day 2",   date: "2025-06-15", time: "2:00 PM", status: "approved" },
  { id: "ce3", title: "Semifinals",        date: "2025-06-21", time: "2:00 PM", status: "approved" },
  { id: "ce4", title: "Finals",            date: "2025-06-28", time: "3:00 PM", status: "approved" },
  { id: "ce5", title: "CODM Finals Event", date: "2025-07-05", time: "2:00 PM", status: "pending"  },
];

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

interface Props { showSubmitForm?: boolean; showApproveActions?: boolean; }

export default function CalendarManagementModule({ showSubmitForm = true, showApproveActions = false }: Props) {
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate]   = useState("");
  const [eventTime, setEventTime]   = useState("");
  const [submitted, setSubmitted]   = useState(false);

  const handleSubmit = () => {
    if (!eventTitle || !eventDate) return;
    setSubmitted(true);
    setEventTitle(""); setEventDate(""); setEventTime("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  const year = 2025, month = 5;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getEventsForDay = (day: number) => {
    const dateStr = `2025-06-${String(day).padStart(2, "0")}`;
    return calendarEvents.filter((e) => e.date === dateStr);
  };

  return (
    <div className="space-y-6">
      {showSubmitForm && (
        <div className="dash-card p-5">
          <div className="dash-section-title">Request New Event</div>
          {submitted && (
            <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-2 mb-4">Event submitted for admin approval.</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="dash-label">Event Title</label>
              <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="e.g. QF Match Day" className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Date</label>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Time</label>
              <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="dash-input" />
            </div>
          </div>
          <button onClick={handleSubmit} className="mt-4 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">Submit for Approval</button>
        </div>
      )}

      {/* Calendar grid */}
      <div className="dash-card p-5">
        <div className="font-head text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--c-text)" }}>June 2025</div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] uppercase tracking-wider py-1" style={{ color: "var(--c-text-dim)" }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const evs = getEventsForDay(day);
            return (
              <div
                key={day}
                className="rounded min-h-[56px] p-1"
                style={{ backgroundColor: "var(--c-surface3)" }}
              >
                <div className="text-[10px] mb-1" style={{ color: "var(--c-text-dim)" }}>{day}</div>
                {evs.map((ev) => (
                  <div key={ev.id} className="bg-[#FF4655]/20 text-[#FF4655] text-[9px] rounded px-1 py-0.5 mb-0.5 truncate">{ev.title}</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {showApproveActions && (
        <div className="dash-table-wrap">
          <table className="w-full border-collapse">
            <thead className="dash-thead">
              <tr>{["Event","Date","Time","Status","Actions"].map((h) => <th key={h} className="dash-th">{h}</th>)}</tr>
            </thead>
            <tbody>
              {calendarEvents.map((e) => (
                <tr key={e.id} className="dash-tr">
                  <td className="dash-td">{e.title}</td>
                  <td className="dash-td-muted">{e.date}</td>
                  <td className="dash-td-muted">{e.time}</td>
                  <td className="dash-td">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${e.status === "approved" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-[#FF4655]/20 text-[#FF4655]"}`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="dash-td">
                    {e.status === "pending" && (
                      <div className="flex gap-2">
                        <button className="bg-[#00F5D4]/20 text-[#00F5D4] text-xs font-semibold px-3 py-1 rounded">Approve</button>
                        <button className="dash-btn-ghost text-xs px-3 py-1 rounded">Reject</button>
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
  );
}
