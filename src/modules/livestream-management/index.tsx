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

interface LivestreamDoc extends Livestream {
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface Props { showManageControls?: boolean; }

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
      await addDoc(collection(db, "livestreams"), {
        ...rest,
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
          {/* ── Active stream embed ────────────────────────────────────── */}
          {liveStreams.map((ls) => (
            <div key={ls.id} className="max-w-2xl">
              <div
                className="relative rounded-lg overflow-hidden aspect-video flex items-center justify-center cursor-pointer group transition-colors"
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
                  <div className="w-14 h-14 bg-[#FF4655] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconPlay size={20} className="ml-1" />
                  </div>
                  <div
                    className="font-head text-sm font-semibold uppercase tracking-[2px] flex items-center gap-2"
                    style={{ color: "var(--c-text)" }}
                  >
                    <span className="w-2 h-2 bg-[#FF4655] rounded-full animate-pulse-dot inline-block" />
                    LIVE NOW
                  </div>
                  <div className="text-xs" style={{ color: "var(--c-text-muted)" }}>{ls.tournamentName}</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${statusStyle(ls.status)}`}>
                  {ls.status}
                </span>
                <span className="text-sm" style={{ color: "var(--c-text-muted)" }}>{ls.label}</span>
              </div>
            </div>
          ))}

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
                {streams.map((ls) => (
                  <tr key={ls.id} className="dash-tr">
                    <td className="dash-td font-medium">{ls.label}</td>
                    <td className="dash-td-dim max-w-[180px] truncate">{ls.url}</td>
                    <td className="dash-td-muted">{ls.tournamentName}</td>
                    <td className="dash-td-muted">{ls.platform || "YouTube"}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Add Stream Modal ────────────────────────────────────────────── */}
      {showAddModal && (
        <AddStreamModal
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
