"use client";
import { useState } from "react";
import { announcements as initialAnnouncements } from "@/data/announcements";

const statusStyle = (s: string) => {
  if (s === "approved" || s === "published") return "bg-[#00F5D4]/15 text-[#00F5D4]";
  if (s === "pending") return "bg-[#FF4655]/20 text-[#FF4655]";
  return "";
};

interface Props { showSubmitForm?: boolean; showApproveActions?: boolean; }

export default function AnnouncementManagementModule({ showSubmitForm = true, showApproveActions = false }: Props) {
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!title || !content) return;
    setSubmitted(true);
    setTitle(""); setContent("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      {showSubmitForm && (
        <div className="dash-card p-5">
          <div className="dash-section-title">New Announcement</div>
          {submitted && (
            <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-2 mb-4">
              Announcement submitted for admin approval.
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="dash-label">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title..." className="dash-input" />
            </div>
            <div>
              <label className="dash-label">Content</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Write your announcement..." className="dash-input" style={{ resize: "none" }} />
            </div>
            <button onClick={handleSubmit} className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">Submit for Approval</button>
          </div>
        </div>
      )}

      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {["Title", "Submitted", "Status", ...(showApproveActions ? ["Actions"] : [])].map((h) => (
                <th key={h} className="dash-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initialAnnouncements.map((a) => (
              <tr key={a.id} className="dash-tr">
                <td className="dash-td">{a.title}</td>
                <td className="dash-td-dim">{a.submittedAt}</td>
                <td className="dash-td">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${statusStyle(a.status)}`}
                    style={!statusStyle(a.status) ? { backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" } : {}}
                  >
                    {a.status}
                  </span>
                </td>
                {showApproveActions && (
                  <td className="dash-td">
                    {a.status === "pending" && (
                      <div className="flex gap-2">
                        <button className="bg-[#00F5D4]/20 text-[#00F5D4] hover:bg-[#00F5D4]/30 text-xs font-semibold px-3 py-1 rounded transition-colors">Approve</button>
                        <button className="dash-btn-ghost text-xs px-3 py-1 rounded">Reject</button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
