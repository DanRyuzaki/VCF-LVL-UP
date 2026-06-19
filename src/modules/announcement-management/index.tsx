"use client";
import { useState } from "react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  submittedAt: string;
  status: string;
}

interface AnnouncementManagementModuleProps {
  showSubmitForm?: boolean;
}

const initialAnnouncements: Announcement[] = [
  { id: "a-1", title: "Season 4 Bracket Open",      content: "Registration is now open for MLBB Season 4.",  submittedAt: "2025-06-10", status: "published" },
  { id: "a-2", title: "Maintenance Notice",           content: "Scheduled downtime on June 15 from 2–4 AM.",  submittedAt: "2025-06-11", status: "pending" },
  { id: "a-3", title: "New Tournament Mode",          content: "Double-elimination brackets are now available.", submittedAt: "2025-06-12", status: "approved" },
];

export default function AnnouncementManagementModule({
  showSubmitForm = true,
}: AnnouncementManagementModuleProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [newAnnTitle, setNewAnnTitle]     = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [annSuccess, setAnnSuccess]       = useState(false);

  const handleAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;

    const newA: Announcement = {
      id: `a-${Date.now()}`,
      title: newAnnTitle,
      content: newAnnContent,
      submittedAt: new Date().toISOString().slice(0, 10),
      status: "pending",
    };
    setAnnouncements((prev) => [...prev, newA]);
    setNewAnnTitle("");
    setNewAnnContent("");
    setAnnSuccess(true);
    setTimeout(() => setAnnSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {showSubmitForm && (
        <div className="dash-card p-5">
          <div className="dash-section-title">Submit Announcement for Admin Approval</div>
          {annSuccess && (
            <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-2 mb-4">
              Announcement submitted for admin approval.
            </div>
          )}
          <form onSubmit={handleAnnSubmit} className="space-y-3">
            <div>
              <label className="dash-label">Title</label>
              <input
                value={newAnnTitle}
                onChange={(e) => setNewAnnTitle(e.target.value)}
                placeholder="Announcement title..."
                className="dash-input"
              />
            </div>
            <div>
              <label className="dash-label">Content</label>
              <textarea
                value={newAnnContent}
                onChange={(e) => setNewAnnContent(e.target.value)}
                rows={4}
                placeholder="Write announcement content..."
                className="dash-input"
                style={{ resize: "none" }}
              />
            </div>
            <button
              type="submit"
              className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
            >
              Submit Announcement
            </button>
          </form>
        </div>
      )}

      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {["Title", "Date Submitted", "Status"].map((h) => (
                <th key={h} className="dash-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {announcements.map((a) => (
              <tr key={a.id} className="dash-tr">
                <td className="dash-td font-medium">{a.title}</td>
                <td className="dash-td-muted">{a.submittedAt}</td>
                <td className="dash-td">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      a.status === "published" || a.status === "approved"
                        ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                        : "bg-[#FF4655]/20 text-[#FF4655]"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}