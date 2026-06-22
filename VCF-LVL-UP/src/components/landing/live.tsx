"use client";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { IconPlay } from "@/components/shared/icons";
import { getEmbedUrl, detectPlatform } from "@/lib/embed-url";

interface LivestreamData {
  id: string;
  label: string;
  url: string;
  status: "live" | "scheduled" | "ended";
  tournamentName: string;
  platform?: string;
}

const platformColors: Record<string, { bg: string; text: string }> = {
  youtube:  { bg: "rgba(255,0,0,0.12)",   text: "#FF4444" },
  facebook: { bg: "rgba(24,119,242,0.12)", text: "#1877F2" },
  twitch:   { bg: "rgba(145,70,255,0.12)", text: "#9146FF" },
  unknown:  { bg: "rgba(255,255,255,0.06)", text: "var(--c-text-muted)" },
};

export default function LiveSection() {
  const [liveStreams, setLiveStreams] = useState<LivestreamData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "livestreams"), where("status", "==", "live"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLiveStreams(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LivestreamData, "id">) }))
        );
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  const active = liveStreams.length > 0 ? liveStreams[0] : null;

  return (
    <section id="livestream" className="py-16 px-6" style={{ backgroundColor: "var(--c-page-bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] uppercase tracking-[2px] mb-2" style={{ color: "var(--c-accent)" }}>
          Live Coverage
        </div>
        <h2 className="font-head text-3xl font-bold uppercase tracking-wide mb-8" style={{ color: "var(--c-text)" }}>
          LIVESTREAM ACCESS
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#FF4655] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : active ? (
          /* ── Embedded live player ────────────────────────────────────── */
          (() => {
            const { embedUrl, platform } = getEmbedUrl(active.url, active.platform);
            const pColors = platformColors[platform] || platformColors.unknown;

            if (embedUrl) {
              return (
                <div className="max-w-3xl">
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-border)" }}>
                    {/* Top bar */}
                    <div
                      className="flex items-center gap-2 px-4 py-2"
                      style={{ backgroundColor: "var(--c-surface2)", borderBottom: "1px solid var(--c-border)" }}
                    >
                      <span className="w-2 h-2 bg-[#FF4655] rounded-full animate-pulse-dot inline-block" />
                      <span
                        className="font-head text-[10px] font-bold uppercase tracking-[2px]"
                        style={{ color: "#FF4655" }}
                      >
                        LIVE NOW
                      </span>
                      <span
                        className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ml-1"
                        style={{ backgroundColor: pColors.bg, color: pColors.text }}
                      >
                        {platform === "unknown" ? (active.platform || "Stream") : platform}
                      </span>
                      <span className="text-xs ml-auto" style={{ color: "var(--c-text-muted)" }}>
                        {active.tournamentName}
                      </span>
                    </div>
                    {/* Iframe */}
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                        title={active.label || "Livestream"}
                        style={{ border: "none" }}
                      />
                    </div>
                    {/* Bottom bar */}
                    <div
                      className="flex items-center gap-3 px-4 py-2"
                      style={{ backgroundColor: "var(--c-surface2)", borderTop: "1px solid var(--c-border)" }}
                    >
                      <span className="text-sm font-medium" style={{ color: "var(--c-text)" }}>
                        {active.label}
                      </span>
                      <a
                        href={active.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] ml-auto font-semibold uppercase tracking-widest transition-opacity hover:opacity-80"
                        style={{ color: pColors.text }}
                      >
                        Open in {platform === "unknown" ? (active.platform || "Browser") : platform} ↗
                      </a>
                    </div>
                  </div>
                </div>
              );
            }

            // URL not embeddable — show fallback with external link
            return (
              <div className="max-w-2xl">
                <div
                  className="relative border rounded-lg overflow-hidden aspect-video flex items-center justify-center cursor-pointer group transition-colors"
                  style={{ backgroundColor: "var(--c-surface2)", borderColor: "var(--c-border)" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1A0A0A] to-[#0A0A1A] opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-head text-[5rem] font-bold uppercase tracking-[8px] select-none"
                      style={{ color: "rgba(255,70,85,0.08)" }}>
                      LIVE
                    </span>
                  </div>
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: "var(--c-accent)" }}
                    >
                      <IconPlay size={20} className="ml-1" />
                    </div>
                    <div className="font-head text-sm font-semibold uppercase tracking-[2px] flex items-center gap-2"
                      style={{ color: "var(--c-text)" }}>
                      <span className="w-2 h-2 rounded-full animate-pulse-dot inline-block"
                        style={{ backgroundColor: "var(--c-accent)" }} />
                      LIVE NOW
                    </div>
                    <div className="text-xs" style={{ color: "var(--c-text-muted)" }}>
                      {active.tournamentName}
                    </div>
                    <a
                      href={active.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline transition-opacity hover:opacity-80"
                      style={{ color: pColors.text }}
                    >
                      Watch on {active.platform || "External Site"} →
                    </a>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          /* ── Offline state ──────────────────────────────────────────── */
          <div className="max-w-2xl">
            <div
              className="relative border rounded-lg overflow-hidden aspect-video flex items-center justify-center transition-colors"
              style={{ backgroundColor: "var(--c-surface2)", borderColor: "var(--c-border)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1A0A0A] to-[#0A0A1A] opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-head text-[5rem] font-bold uppercase tracking-[8px] select-none"
                  style={{ color: "rgba(255,70,85,0.08)" }}>
                  LIVE
                </span>
              </div>
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--c-surface3)" }}
                >
                  <IconPlay size={20} className="ml-1" style={{ color: "var(--c-text-dim)" }} />
                </div>
                <div className="font-head text-sm font-semibold uppercase tracking-[2px]"
                  style={{ color: "var(--c-text-dim)" }}>
                  STREAM OFFLINE
                </div>
                <div className="text-xs" style={{ color: "var(--c-text-muted)" }}>
                  Check back when a tournament is live
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

