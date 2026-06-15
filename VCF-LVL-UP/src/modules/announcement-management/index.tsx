"use client";
import { useState } from "react";
import { announcements as initialAnnouncements } from "@/data/announcements";
import { Announcement } from "@/types/announcement";

const statusStyle = (s: string) => {
  if (s === "approved" || s === "published") return "bg-[#00F5D4]/15 text-[#00F5D4]";
  if (s === "pending") return "bg-[#FF4655]/20 text-[#FF4655]";
  return "bg-[#232323] text-[#808080]";
};

interface Props { showSubmitForm?: boolean; showApproveActions?: boolean; }

export default function AnnouncementManagementModule({ showSubmitForm = true, showApproveActions = false }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!title || !content) return;
    setSubmitted(true);
    setTitle("");
    setContent("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      {showSubmitForm && (
        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#B8B8B8] mb-4">New Announcement</div>
          {submitted && (
            <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-2 mb-4">
              Announcement submitted for admin approval.
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title..." className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white placeholder-[#808080] outline-none focus:border-[#FF4655]" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">Content</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Write your announcement..." className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white placeholder-[#808080] outline-none focus:border-[#FF4655] resize-none" />
            </div>
            <button onClick={handleSubmit} className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">Submit for Approval</button>
          </div>
        </div>
      )}

      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#232323]">
              {["Title", "Submitted", "Status", ...(showApproveActions ? ["Actions"] : [])].map((h) => (
                <th key={h} className="text-left text-[10px] uppercase tracking-[1.5px] text-[#808080] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initialAnnouncements.map((a) => (
              <tr key={a.id} className="border-t border-[#2E2E2E] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-sm">{a.title}</td>
                <td className="px-4 py-3 text-xs text-[#808080]">{a.submittedAt}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${statusStyle(a.status)}`}>{a.status}</span>
                </td>
                {showApproveActions && (
                  <td className="px-4 py-3">
                    {a.status === "pending" && (
                      <div className="flex gap-2">
                        <button className="bg-[#00F5D4]/20 text-[#00F5D4] hover:bg-[#00F5D4]/30 text-xs font-semibold px-3 py-1 rounded transition-colors">Approve</button>
                        <button className="border border-[#2E2E2E] text-[#808080] hover:text-white text-xs px-3 py-1 rounded transition-all">Reject</button>
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
