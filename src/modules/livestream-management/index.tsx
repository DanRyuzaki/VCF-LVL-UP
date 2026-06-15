"use client";
import { useState } from "react";
import { livestreams as initial } from "@/data/livestreams";
import { IconPlay, IconPlus, IconEdit, IconX } from "@/components/shared/icons";

interface Props { showManageControls?: boolean; }

export default function LivestreamManagementModule({ showManageControls = false }: Props) {
  const [url, setUrl]     = useState("");
  const [label, setLabel] = useState("");
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!label || !url) return;
    setAdded(true);
    setLabel(""); setUrl("");
    setTimeout(() => setAdded(false), 3000);
  };

  const statusStyle = (s: string) => {
    if (s === "live")      return "bg-[#FF4655]/20 text-[#FF4655]";
    if (s === "scheduled") return "bg-[#8B5CF6]/20 text-[#8B5CF6]";
    return "";
  };

  return (
    <div className="space-y-6">
      {showManageControls && (
        <div className="dash-card p-5">
          <div className="dash-section-title">Add Livestream</div>
          {added && (
            <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-2 mb-4">Livestream added successfully.</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="dash-label">Label</label>
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. MLBB QF Day 1" className="dash-input" />
            </div>
            <div className="md:col-span-2">
              <label className="dash-label">Stream URL</label>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="dash-input" />
            </div>
          </div>
          <button onClick={handleAdd} className="mt-4 flex items-center gap-2 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">
            <IconPlus size={13} /> Add Stream
          </button>
        </div>
      )}

      {/* Active stream embed */}
      {initial.filter((l) => l.status === "live").map((ls) => (
        <div key={ls.id} className="max-w-2xl">
          <div
            className="relative rounded-lg overflow-hidden aspect-video flex items-center justify-center cursor-pointer group transition-colors"
            style={{ backgroundColor: "var(--c-surface2)", border: "1px solid var(--c-border)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A0A0A] to-[#0A0A1A] opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-head text-[5rem] font-bold uppercase tracking-[8px] select-none" style={{ color: "rgba(255,70,85,0.08)" }}>LIVE</span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-[#FF4655] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <IconPlay size={20} className="ml-1" />
              </div>
              <div className="font-head text-sm font-semibold uppercase tracking-[2px] flex items-center gap-2" style={{ color: "var(--c-text)" }}>
                <span className="w-2 h-2 bg-[#FF4655] rounded-full animate-pulse-dot inline-block" />
                LIVE NOW
              </div>
              <div className="text-xs" style={{ color: "var(--c-text-muted)" }}>{ls.tournamentName}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${statusStyle(ls.status)}`}>{ls.status}</span>
            <span className="text-sm" style={{ color: "var(--c-text-muted)" }}>{ls.label}</span>
          </div>
        </div>
      ))}

      {/* Stream list */}
      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {["Label", "URL", "Tournament", "Status", ...(showManageControls ? ["Actions"] : [])].map((h) => (
                <th key={h} className="dash-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initial.map((ls) => (
              <tr key={ls.id} className="dash-tr">
                <td className="dash-td font-medium">{ls.label}</td>
                <td className="dash-td-dim max-w-[180px] truncate">{ls.url}</td>
                <td className="dash-td-muted">{ls.tournamentName}</td>
                <td className="dash-td">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${statusStyle(ls.status)}`}
                    style={!statusStyle(ls.status) ? { backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" } : {}}
                  >
                    {ls.status}
                  </span>
                </td>
                {showManageControls && (
                  <td className="dash-td">
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 dash-btn-ghost text-xs px-3 py-1 rounded"><IconEdit size={11} /> Edit</button>
                      <button className="flex items-center gap-1 dash-btn-ghost text-xs px-3 py-1 rounded"><IconX size={11} /> Remove</button>
                    </div>
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
