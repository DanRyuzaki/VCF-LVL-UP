"use client";
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

interface Announcement {
  id: string;
  title: string;
  content: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  submittedByUid: string;
}

interface AnnouncementManagementModuleProps {
  showSubmitForm?: boolean;
}

// ── Detail Modal ────────────────────────────────────────────────────────────
function AnnouncementModal({
  announcement,
  onClose,
}: {
  announcement: Announcement;
  onClose: () => void;
}) {
  const statusStyles = {
    approved: "bg-[#00F5D4]/15 text-[#00F5D4]",
    rejected: "bg-[#FF4655]/20 text-[#FF4655]",
    pending: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl p-6 space-y-4 shadow-2xl"
        style={{
          backgroundColor: "var(--c-surface, #1a1a2e)",
          border: "1px solid var(--c-border, rgba(255,255,255,0.08))",
          color: "var(--c-text, #e2e8f0)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--c-text, #e2e8f0)" }}>
            {announcement.title}
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 text-lg leading-none opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: "var(--c-text, #e2e8f0)" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--c-border, rgba(255,255,255,0.08))" }} />

        {/* Content */}
        <p className="text-xs leading-relaxed" style={{ color: "var(--c-text-dim, #94a3b8)" }}>
          {announcement.content}
        </p>

        {/* Footer meta */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px]" style={{ color: "var(--c-text-dim, #94a3b8)" }}>
            Submitted {announcement.submittedAt}
            {announcement.submittedBy ? ` · ${announcement.submittedBy}` : ""}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${statusStyles[announcement.status]}`}
          >
            {announcement.status}
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full mt-2 text-xs font-semibold uppercase tracking-widest py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--c-border, rgba(255,255,255,0.08))",
            color: "var(--c-text, #e2e8f0)",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Main Module ─────────────────────────────────────────────────────────────
export default function AnnouncementManagementModule({
  showSubmitForm = true,
}: AnnouncementManagementModuleProps) {
  const { profile } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [annSuccess, setAnnSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Announcement | null>(null);

  useEffect(() => {
    setError(null);

    const col = collection(db, "announcements");
    let q;

    if (showSubmitForm && profile?.uid) {
      q = query(
        col,
        where("submittedByUid", "==", profile.uid),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        col,
        where("status", "==", "approved"),
        orderBy("createdAt", "desc")
      );
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Announcement[] = snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt?.toDate?.();
          return {
            id: d.id,
            title: data.title ?? "",
            content: data.content ?? "",
            submittedAt: ts ? ts.toISOString().slice(0, 10) : "—",
            status: data.status ?? "pending",
            submittedBy: data.submittedBy ?? "",
            submittedByUid: data.submittedByUid ?? "",
          };
        });
        setAnnouncements(rows);
        setLoading(false);
      },
      (err) => {
        console.error("announcements snapshot error:", err);
        setError("Failed to load announcements.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [showSubmitForm, profile?.uid]);

  const handleAnnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;
    if (!profile) { setError("You must be signed in to submit."); return; }

    setSubmitting(true);
    setError(null);
    try {
      await addDoc(collection(db, "announcements"), {
        title: newAnnTitle.trim(),
        content: newAnnContent.trim(),
        status: "pending",
        submittedBy: `${profile.firstName} ${profile.lastName}`.trim(),
        submittedByUid: profile.uid,
        createdAt: serverTimestamp(),
      });
      setNewAnnTitle("");
      setNewAnnContent("");
      setError(null);
      setAnnSuccess(true);
      setTimeout(() => setAnnSuccess(false), 3000);
    } catch (err) {
      console.error("addDoc error:", err);
      setError("Failed to submit announcement. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Detail modal */}
      {selected && (
        <AnnouncementModal announcement={selected} onClose={() => setSelected(null)} />
      )}

      <div className="space-y-6">
        {showSubmitForm && (
          <div className="dash-card p-5">
            <div className="dash-section-title">Submit Announcement for Admin Approval</div>
            {annSuccess && (
              <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-2 mb-4">
                Announcement submitted for admin approval.
              </div>
            )}
            {error && (
              <div className="bg-[#FF4655]/10 border border-[#FF4655]/30 text-[#FF4655] text-xs rounded-lg px-4 py-2 mb-4">
                {error}
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
                  disabled={submitting}
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
                  disabled={submitting}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit Announcement"}
              </button>
            </form>
          </div>
        )}

        <div className="dash-table-wrap">
          {loading ? (
            <div className="text-center text-xs py-8" style={{ color: "var(--c-text-dim)" }}>
              Loading announcements…
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center text-xs py-8" style={{ color: "var(--c-text-dim)" }}>
              {showSubmitForm ? "No announcements submitted yet." : "No approved announcements yet."}
            </div>
          ) : (
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
                  <tr
                    key={a.id}
                    className="dash-tr cursor-pointer hover:bg-white/5"
                    onClick={() => setSelected(a)}
                  >
                    <td className="dash-td font-medium">{a.title}</td>
                    <td className="dash-td-muted">{a.submittedAt}</td>
                    <td className="dash-td">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                          a.status === "approved"
                            ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                            : a.status === "rejected"
                            ? "bg-[#FF4655]/20 text-[#FF4655]"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}