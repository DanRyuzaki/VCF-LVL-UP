"use client";
import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { IconPlay, IconPlus, IconEdit, IconX } from "@/components/shared/icons";
import AddStreamModal from "@/modules/livestream-management/add-stream-modal";
import { Livestream } from "@/types/announcement";
import { getEmbedUrl, detectPlatform } from "@/lib/embed-url";

interface LivestreamDoc extends Livestream {
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface Props { showManageControls?: boolean; }

/* ─── Platform badge colours ──────────────────────────────────────────────── */
const platformColors: Record<string, { bg: string; text: string; icon: string }> = {
  youtube:  { bg: "rgba(255,0,0,0.12)",   text: "#FF4444", icon: "▶" },
  facebook: { bg: "rgba(24,119,242,0.12)", text: "#1877F2", icon: "f" },
  twitch:   { bg: "rgba(145,70,255,0.12)", text: "#9146FF", icon: "⬤" },
  unknown:  { bg: "rgba(255,255,255,0.06)", text: "var(--c-text-muted)", icon: "?" },
};

/* ─── Stream Embed component ──────────────────────────────────────────────── */
function StreamEmbed({ stream }: { stream: LivestreamDoc }) {
  const { embedUrl, platform } = getEmbedUrl(stream.url, stream.platform);
  const pColors = platformColors[platform] || platformColors.unknown;

  if (!embedUrl) {
    // Fallback: can't embed — show link to watch externally
    return (
      <div
        className="relative rounded-lg overflow-hidden aspect-video flex items-center justify-center"
        style={{ backgroundColor: "var(--c-surface2)", border: "1px solid var(--c-border)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A0A0A] to-[#0A0A1A] opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-head text-[5rem] font-bold uppercase tracking-[8px] select-none"
            style={{ color: "rgba(255,70,85,0.08)" }}
          >
            LIVE
          </span>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-[#FF4655] rounded-full flex items-center justify-center">
            <IconPlay size={20} className="ml-1" />
          </div>
          <div
            className="font-head text-sm font-semibold uppercase tracking-[2px] flex items-center gap-2"
            style={{ color: "var(--c-text)" }}
          >
            <span className="w-2 h-2 bg-[#FF4655] rounded-full animate-pulse-dot inline-block" />
            LIVE NOW
          </div>
          <a
            href={stream.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline transition-opacity hover:opacity-80"
            style={{ color: pColors.text }}
          >
            Watch on {stream.platform || "External Site"} →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-border)" }}>
      {/* Live indicator bar */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{ backgroundColor: "var(--c-surface2)", borderBottom: "1px solid var(--c-border)" }}
      >
        <span className="w-2 h-2 bg-[#FF4655] rounded-full animate-pulse-dot inline-block" />
        <span
          className="font-head text-[10px] font-bold uppercase tracking-[2px]"
          style={{ color: "#FF4655" }}
        >
          LIVE
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ml-1"
          style={{ backgroundColor: pColors.bg, color: pColors.text }}
        >
          {platform === "unknown" ? (stream.platform || "Stream") : platform}
        </span>
        <span className="text-xs ml-auto" style={{ color: "var(--c-text-muted)" }}>
          {stream.tournamentName}
        </span>
      </div>
      {/* Iframe embed */}
      <div className="aspect-video w-full bg-black">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          title={stream.label || "Livestream"}
          style={{ border: "none" }}
        />
      </div>
      {/* Info bar */}
      <div
        className="flex items-center gap-3 px-4 py-2"
        style={{ backgroundColor: "var(--c-surface2)", borderTop: "1px solid var(--c-border)" }}
      >
        <span className="text-sm font-medium" style={{ color: "var(--c-text)" }}>
          {stream.label}
        </span>
        <a
          href={stream.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] ml-auto font-semibold uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{ color: pColors.text }}
        >
          Open in {platform === "unknown" ? (stream.platform || "Browser") : platform} ↗
        </a>
      </div>
    </div>
  );
}

/* ─── Main module ─────────────────────────────────────────────────────────── */

export default function LivestreamManagementModule({ showManageControls = false }: Props) {
  const { profile } = useAuth();

  const [streams,      setStreams]      = useState<LivestreamDoc[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMsg,   setSuccessMsg]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // ── Firestore real-time listener ──────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, "livestreams"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setStreams(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LivestreamDoc, "id">) })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  // ── Add stream ────────────────────────────────────────────────────────────
  const handleAddStream = async (stream: Livestream) => {
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = stream;
      // Auto-detect platform from URL if not set
      const detectedPlatform = detectPlatform(rest.url);
      await addDoc(collection(db, "livestreams"), {
        ...rest,
        platform: rest.platform || (detectedPlatform !== "unknown" ? detectedPlatform : "YouTube"),
        createdAt: serverTimestamp(),
      });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add stream.");
    }
  };

  // ── Remove stream ─────────────────────────────────────────────────────────
  const handleRemove = async (id: string) => {
    setError(null);
    try {
      await deleteDoc(doc(db, "livestreams", id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove stream.");
    }
  };

  // ── Toggle status (simple cycle: scheduled → live → ended) ───────────────
  const handleEdit = async (stream: LivestreamDoc) => {
    // For now, cycling status as a quick edit — a full edit modal can be added later
    const cycle: Record<string, "live" | "scheduled" | "ended"> = {
      scheduled: "live",
      live: "ended",
      ended: "scheduled",
    };
    try {
      await updateDoc(doc(db, "livestreams", stream.id), {
        status:    cycle[stream.status] ?? "scheduled",
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update stream.");
    }
  };

  const statusStyle = (s: string) => {
    if (s === "live")      return "bg-[#FF4655]/20 text-[#FF4655]";
    if (s === "scheduled") return "bg-[#8B5CF6]/20 text-[#8B5CF6]";
    return "";
  };

  const liveStreams = streams.filter((l) => l.status === "live");

  return (
    <div className="space-y-6">
      {/* ── Manage toolbar ──────────────────────────────────────────────── */}
      {showManageControls && (
        <div className="flex items-center justify-between">
          <div>
            {successMsg && (
              <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-2 inline-block">
                Livestream added successfully.
              </div>
            )}
            {error && (
              <div className="bg-[#FF4655]/10 border border-[#FF4655]/30 text-[#FF4655] text-xs rounded-lg px-4 py-2 inline-block">
                {error}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
          >
            <IconPlus size={13} /> Add Stream
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#FF4655] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Active stream embeds ───────────────────────────────────── */}
          {liveStreams.length > 0 && (
            <div className="space-y-6">
              {liveStreams.map((ls) => (
                <div key={ls.id} className="max-w-3xl">
                  <StreamEmbed stream={ls} />
                </div>
              ))}
            </div>
          )}

          {/* ── No live streams message ────────────────────────────────── */}
          {liveStreams.length === 0 && streams.length > 0 && (
            <div
              className="flex flex-col items-center justify-center py-12 rounded-xl"
              style={{ backgroundColor: "var(--c-surface2)", border: "1px solid var(--c-border)" }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: "var(--c-surface3)" }}>
                <IconPlay size={18} style={{ color: "var(--c-text-dim)" }} />
              </div>
              <div className="font-head text-sm font-semibold uppercase tracking-[2px] mb-1" style={{ color: "var(--c-text-dim)" }}>
                No Active Streams
              </div>
              <div className="text-xs" style={{ color: "var(--c-text-muted)" }}>
                Streams marked as &quot;Live&quot; will appear here with an embedded player.
              </div>
            </div>
          )}

          {/* ── Stream list ────────────────────────────────────────────── */}
          <div className="dash-table-wrap">
            <table className="w-full border-collapse">
              <thead className="dash-thead">
                <tr>
                  {[
                    "Label", "URL", "Tournament", "Platform", "Status",
                    ...(showManageControls ? ["Actions"] : []),
                  ].map((h) => (
                    <th key={h} className="dash-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {streams.length === 0 && (
                  <tr>
                    <td
                      colSpan={showManageControls ? 6 : 5}
                      className="dash-td text-center"
                      style={{ color: "var(--c-text-muted)" }}
                    >
                      No livestreams yet.
                    </td>
                  </tr>
                )}
                {streams.map((ls) => {
                  const detected = detectPlatform(ls.url);
                  const pColors = platformColors[detected] || platformColors.unknown;
                  return (
                    <tr key={ls.id} className="dash-tr">
                      <td className="dash-td font-medium">{ls.label}</td>
                      <td className="dash-td-dim max-w-[180px] truncate">
                        <a
                          href={ls.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline transition-opacity hover:opacity-70"
                          style={{ color: pColors.text }}
                        >
                          {ls.url.length > 45 ? ls.url.substring(0, 45) + "…" : ls.url}
                        </a>
                      </td>
                      <td className="dash-td-muted">{ls.tournamentName}</td>
                      <td className="dash-td">
                        <span
                          className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: pColors.bg, color: pColors.text }}
                        >
                          {ls.platform || detected}
                        </span>
                      </td>
                      <td className="dash-td">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${statusStyle(ls.status)}`}
                          style={
                            !statusStyle(ls.status)
                              ? { backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" }
                              : {}
                          }
                        >
                          {ls.status}
                        </span>
                      </td>
                      {showManageControls && (
                        <td className="dash-td">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(ls)}
                              className="flex items-center gap-1 dash-btn-ghost text-xs px-3 py-1 rounded"
                              title="Cycle status"
                            >
                              <IconEdit size={11} /> Edit
                            </button>
                            <button
                              onClick={() => handleRemove(ls.id)}
                              className="flex items-center gap-1 dash-btn-ghost text-xs px-3 py-1 rounded"
                            >
                              <IconX size={11} /> Remove
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Add Stream Modal ────────────────────────────────────────────── */}
      {showAddModal && (
        <AddStreamModal
          existingStreams={streams}
          onClose={() => setShowAddModal(false)}
          onSave={async (stream) => {
            await handleAddStream(stream);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

