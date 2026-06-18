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
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;

  // Form state
  newAnnTitle: string;
  setNewAnnTitle: React.Dispatch<React.SetStateAction<string>>;
  newAnnContent: string;
  setNewAnnContent: React.Dispatch<React.SetStateAction<string>>;

  // Success state
  annSuccess: boolean;
  setAnnSuccess: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AnnouncementManagementModule({
  announcements,
  setAnnouncements,

  newAnnTitle,
  setNewAnnTitle,
  newAnnContent,
  setNewAnnContent,

  annSuccess,
  setAnnSuccess,
}: AnnouncementManagementModuleProps) {
  const handleAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;

    const newA = {
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

  const statusStyle = (s: string) => {
    if (s === "approved" || s === "published") return "bg-[#00F5D4]/15 text-[#00F5D4]";
    if (s === "pending") return "bg-[#FF4655]/20 text-[#FF4655]";
    return "";
  };

  return (
    <div className="space-y-6">
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
                      a.status === "published" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-[#FF4655]/20 text-[#FF4655]"
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