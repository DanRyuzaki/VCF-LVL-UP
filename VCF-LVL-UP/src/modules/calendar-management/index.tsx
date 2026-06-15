"use client";
import { useState } from "react";

const calendarEvents = [
  { id: "ce1", title: "QF Match Day 1",  date: "2025-06-14", time: "2:00 PM", status: "approved" },
  { id: "ce2", title: "QF Match Day 2",  date: "2025-06-15", time: "2:00 PM", status: "approved" },
  { id: "ce3", title: "Semifinals",       date: "2025-06-21", time: "2:00 PM", status: "approved" },
  { id: "ce4", title: "Finals",           date: "2025-06-28", time: "3:00 PM", status: "approved" },
  { id: "ce5", title: "CODM Finals Event",date: "2025-07-05", time: "2:00 PM", status: "pending"  },
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

  // Build June 2025 calendar
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
        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#B8B8B8] mb-4">Request New Event</div>
          {submitted && (
            <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-2 mb-4">Event submitted for admin approval.</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">Event Title</label>
              <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="e.g. QF Match Day" className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white placeholder-[#808080] outline-none focus:border-[#FF4655]" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">Date</label>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FF4655]" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">Time</label>
              <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FF4655]" />
            </div>
          </div>
          <button onClick={handleSubmit} className="mt-4 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">Submit for Approval</button>
        </div>
      )}

      {/* Calendar grid */}
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-5">
        <div className="font-head text-sm font-semibold uppercase tracking-wider mb-4">June 2025</div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] text-[#808080] uppercase tracking-wider py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const evs = getEventsForDay(day);
            return (
              <div key={day} className="bg-[#232323] rounded min-h-[56px] p-1">
                <div className="text-[10px] text-[#808080] mb-1">{day}</div>
                {evs.map((ev) => (
                  <div key={ev.id} className="bg-[#FF4655]/20 text-[#FF4655] text-[9px] rounded px-1 py-0.5 mb-0.5 truncate">{ev.title}</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {showApproveActions && (
        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#232323]">
                {["Event","Date","Time","Status","Actions"].map((h) => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-[1.5px] text-[#808080] px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarEvents.map((e) => (
                <tr key={e.id} className="border-t border-[#2E2E2E] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm">{e.title}</td>
                  <td className="px-4 py-3 text-xs text-[#B8B8B8]">{e.date}</td>
                  <td className="px-4 py-3 text-xs text-[#B8B8B8]">{e.time}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${e.status === "approved" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-[#FF4655]/20 text-[#FF4655]"}`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {e.status === "pending" && (
                      <div className="flex gap-2">
                        <button className="bg-[#00F5D4]/20 text-[#00F5D4] text-xs font-semibold px-3 py-1 rounded">Approve</button>
                        <button className="border border-[#2E2E2E] text-[#808080] hover:text-white text-xs px-3 py-1 rounded">Reject</button>
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
