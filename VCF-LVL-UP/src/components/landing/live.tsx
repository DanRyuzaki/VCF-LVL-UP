import { IconPlay } from "@/components/shared/icons";
import { livestreams } from "@/data/livestreams";

export default function LiveSection() {
  const active = livestreams.find((l) => l.status === "live");

  return (
    <section id="livestream" className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] uppercase tracking-[2px] text-[#FF4655] mb-2">Live Coverage</div>
        <h2 className="font-head text-3xl font-bold uppercase tracking-wide mb-8">
          LIVESTREAM ACCESS
        </h2>

        <div className="max-w-2xl">
          <div className="relative bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg overflow-hidden aspect-video flex items-center justify-center cursor-pointer group hover:border-[#FF4655]/50 transition-colors">
            {/* Background texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A0A0A] to-[#0A0A1A]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-head text-[5rem] font-bold uppercase tracking-[8px] text-[#FF4655]/10 select-none">
                LIVE
              </span>
            </div>

            {/* Overlay */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-[#FF4655] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <IconPlay size={20} className="ml-1" />
              </div>
              <div className="font-head text-sm font-semibold uppercase tracking-[2px] flex items-center gap-2">
                <span className="w-2 h-2 bg-[#FF4655] rounded-full animate-pulse-dot inline-block" />
                {active ? "LIVE NOW" : "STREAM OFFLINE"}
              </div>
              {active && (
                <div className="text-[#B8B8B8] text-xs">{active.tournamentName}</div>
              )}
            </div>
          </div>

          {active && (
            <div className="mt-3 flex items-center gap-3">
              <span className="bg-[#FF4655]/20 text-[#FF4655] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                LIVE
              </span>
              <span className="text-[#B8B8B8] text-sm">{active.label}</span>
              <span className="text-[#808080] text-xs ml-auto">
                {active.url.substring(0, 40)}...
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
