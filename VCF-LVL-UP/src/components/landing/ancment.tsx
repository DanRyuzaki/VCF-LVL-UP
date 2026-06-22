"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface LiveAnnouncement {
  id: string;
  title: string;
  content: string;
  submittedAt: string;
  isRecent: boolean;
}

const NEW_WINDOW_MS = 1000 * 60 * 60 * 24 * 3; // badge as "NEW" for 3 days

export default function AncmentSection() {
  const [announcements, setAnnouncements] = useState<LiveAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Matches the real schema used by announcement-management/admin approvals:
    // status is "pending" | "approved" | "rejected" — the public site only
    // ever shows approved announcements.
    const q = query(
      collection(db, "announcements"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const now = Date.now();
        const rows: LiveAnnouncement[] = snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt?.toDate?.();
          return {
            id: d.id,
            title: data.title ?? "",
            content: data.content ?? "",
            submittedAt: ts ? ts.toISOString().slice(0, 10) : "—",
            isRecent: ts ? now - ts.getTime() < NEW_WINDOW_MS : false,
          };
        });
        setAnnouncements(rows.slice(0, 6));
        setLoading(false);
      },
      (err) => {
        console.error("announcements snapshot error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return (
    <section id="announcements" className="py-16 px-6" style={{ backgroundColor: "var(--c-page-bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] uppercase tracking-[2px] mb-2" style={{ color: "var(--c-accent)" }}>
          Latest Updates
        </div>
        <h2 className="font-head text-3xl font-bold uppercase tracking-wide mb-8" style={{ color: "var(--c-text)" }}>
          ANNOUNCEMENTS
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#FF4655] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: "var(--c-text-dim)" }}>
            No announcements yet. Check back soon.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="border-l-4 border rounded-r-lg p-4"
                style={{
                  backgroundColor: "var(--c-surface2)",
                  borderLeftColor: a.isRecent ? "#FF4655" : "#8B5CF6",
                  borderColor: "var(--c-border)",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  {a.isRecent && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                      style={{ backgroundColor: "rgba(255,70,85,0.18)", color: "#FF4655" }}
                    >
                      NEW
                    </span>
                  )}
                  <span className="text-[11px]" style={{ color: "var(--c-text-dim)" }}>
                    {a.submittedAt}
                  </span>
                </div>
                <div className="font-semibold text-sm mb-1" style={{ color: "var(--c-text)" }}>
                  {a.title}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--c-text-muted)" }}>
                  {a.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
