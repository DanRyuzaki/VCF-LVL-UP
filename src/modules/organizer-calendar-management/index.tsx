"use client";
import { useState } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
}

const initialEvents: CalendarEvent[] = [
  { id: "ce1", title: "QF Match Day 1", date: "2026-06-14", time: "2:00 PM", status: "approved" },
  { id: "ce2", title: "QF Match Day 2", date: "2026-06-15", time: "2:00 PM", status: "approved" },
  { id: "ce3", title: "Semifinals",     date: "2026-06-21", time: "2:00 PM", status: "approved" },
  { id: "ce4", title: "Finals",         date: "2026-06-28", time: "3:00 PM", status: "approved" },
];

export default function OrganizerCalendarModule() {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialEvents);

  const [calTitle,   setCalTitle]   = useState("");
  const [calDate,    setCalDate]    = useState("");
  const [calTime,    setCalTime]    = useState("");
  const [calError,   setCalError]   = useState("");
  const [calSuccess, setCalSuccess] = useState(false);

  const handleCalendarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calTitle || !calDate || !calTime) return;

    const today = new Date("2026-06-18");
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(calDate);

    if (inputDate < today) {
      setCalError("Error: Events cannot be scheduled in the past (e.g. June 9 1991). Date is invalidated.");
      setCalSuccess(false);
      return;
    }

    setCalError("");
    setCalendarEvents((prev) => [
      ...prev,
      { id: `ce-${Date.now()}`, title: calTitle, date: calDate, time: calTime, status: "pending" },
    ]);
    setCalTitle("");
    setCalDate("");
    setCalTime("");
    setCalSuccess(true);
    setTimeout(() => setCalSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="dash-card p-5">
        <div className="dash-section-title">Request New Event</div>

        {calSuccess && (
          <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-2 mb-4">
            Event request submitted for approval.
          </div>
        )}
        {calError && (
          <div className="bg-[#FF4655]/10 border border-[#FF4655]/30 text-[#FF4655] text-xs rounded-lg px-4 py-2 mb-4">
            {calError}
          </div>
        )}

        <form onSubmit={handleCalendarSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="dash-label">Event Title</label>
            <input
              value={calTitle}
              onChange={(e) => setCalTitle(e.target.value)}
              placeholder="e.g. Finals Match"
              className="dash-input"
            />
          </div>
          <div>
            <label className="dash-label">Date</label>
            <input
              type="date"
              value={calDate}
              onChange={(e) => setCalDate(e.target.value)}
              className="dash-input"
            />
          </div>
          <div>
            <label className="dash-label">Time</label>
            <input
              type="time"
              value={calTime}
              onChange={(e) => setCalTime(e.target.value)}
              className="dash-input"
            />
          </div>
          <button
            type="submit"
            className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors md:col-span-3"
          >
            Submit for Approval
          </button>
        </form>
      </div>

      <div className="dash-card p-5">
        <div className="font-head text-sm font-semibold uppercase tracking-wider mb-4 text-[var(--c-text)]">
          Upcoming Requested & Approved Events
        </div>
        <div className="dash-table-wrap">
          <table className="w-full border-collapse">
            <thead className="dash-thead">
              <tr>
                {["Event Title", "Date", "Time", "Status"].map((h) => (
                  <th key={h} className="dash-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarEvents.map((e) => (
                <tr key={e.id} className="dash-tr">
                  <td className="dash-td font-semibold">{e.title}</td>
                  <td className="dash-td-muted">{e.date}</td>
                  <td className="dash-td-muted">{e.time}</td>
                  <td className="dash-td">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                        e.status === "approved"
                          ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                          : "bg-[#FF4655]/20 text-[#FF4655]"
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}