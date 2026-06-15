"use client";
import { useState } from "react";
import { livestreams as initial } from "@/data/livestreams";
import { IconPlay, IconPlus, IconEdit, IconX } from "@/components/shared/icons";

interface Props { showManageControls?: boolean; }

export default function LivestreamManagementModule({ showManageControls = false }: Props) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!label || !url) return;
    setAdded(true);
    setLabel(""); setUrl("");
    setTimeout(() => setAdded(false), 3000);
  };

  const statusStyle = (s: string) => {
    if (s === "live") return "bg-[#FF4655]/20 text-[#FF4655]";
    if (s === "scheduled") return "bg-[#8B5CF6]/20 text-[#8B5CF6]";
    return "bg-[#232323] text-[#808080]";
  };

  return (
    <div className="space-y-6">
      {showManageControls && (
        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#B8B8B8] mb-4">Add Livestream</div>
          {added && (
            <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-2 mb-4">Livestream added successfully.</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">Label</label>
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. MLBB QF Day 1" className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white placeholder-[#808080] outline-none focus:border-[#FF4655]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-[1.5px] text-[#808080] mb-1.5">Stream URL</label>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full bg-[#232323] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white placeholder-[#808080] outline-none focus:border-[#FF4655]" />
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
          <div className="relative bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg overflow-hidden aspect-video flex items-center justify-center cursor-pointer group hover:border-[#FF4655]/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A0A0A] to-[#0A0A1A]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-head text-[5rem] font-bold uppercase tracking-[8px] text-[#FF4655]/10 select-none">LIVE</span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-[#FF4655] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <IconPlay size={20} className="ml-1" />
              </div>
              <div className="font-head text-sm font-semibold uppercase tracking-[2px] flex items-center gap-2">
                <span className="w-2 h-2 bg-[#FF4655] rounded-full animate-pulse-dot inline-block" />
                LIVE NOW
              </div>
              <div className="text-[#B8B8B8] text-xs">{ls.tournamentName}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${statusStyle(ls.status)}`}>{ls.status}</span>
            <span className="text-[#B8B8B8] text-sm">{ls.label}</span>
          </div>
        </div>
      ))}

      {/* Stream list */}
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#232323]">
              {["Label", "URL", "Tournament", "Status", ...(showManageControls ? ["Actions"] : [])].map((h) => (
                <th key={h} className="text-left text-[10px] uppercase tracking-[1.5px] text-[#808080] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initial.map((ls) => (
              <tr key={ls.id} className="border-t border-[#2E2E2E] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-sm font-medium">{ls.label}</td>
                <td className="px-4 py-3 text-xs text-[#808080] max-w-[180px] truncate">{ls.url}</td>
                <td className="px-4 py-3 text-xs text-[#B8B8B8]">{ls.tournamentName}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${statusStyle(ls.status)}`}>{ls.status}</span>
                </td>
                {showManageControls && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 text-xs border border-[#2E2E2E] text-[#808080] hover:text-white px-3 py-1 rounded transition-all"><IconEdit size={11} /> Edit</button>
                      <button className="flex items-center gap-1 text-xs border border-[#2E2E2E] text-[#808080] hover:text-[#FF4655] px-3 py-1 rounded transition-all"><IconX size={11} /> Remove</button>
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
