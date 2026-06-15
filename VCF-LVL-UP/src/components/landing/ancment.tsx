import { announcements } from "@/data/announcements";
import { Announcement } from "@/types/announcement";

const categoryStyles: Record<Announcement["category"], { border: string; badge: string; label: string }> = {
  new:  { border: "border-l-[#FF4655]", badge: "bg-[#FF4655]/20 text-[#FF4655]",   label: "NEW"  },
  open: { border: "border-l-[#00F5D4]", badge: "bg-[#00F5D4]/15 text-[#00F5D4]",   label: "OPEN" },
  info: { border: "border-l-[#8B5CF6]", badge: "bg-[#8B5CF6]/20 text-[#8B5CF6]",   label: "INFO" },
  urgent:{ border:"border-l-[#FF4655]", badge: "bg-[#FF4655]/20 text-[#FF4655]",   label: "URGENT" },
};

export default function AncmentSection() {
  const published = announcements.filter((a) => a.status === "published");

  return (
    <section id="announcements" className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] uppercase tracking-[2px] text-[#FF4655] mb-2">Latest Updates</div>
        <h2 className="font-head text-3xl font-bold uppercase tracking-wide mb-8">
          ANNOUNCEMENTS
        </h2>

        <div className="flex flex-col gap-3">
          {published.map((a) => {
            const style = categoryStyles[a.category];
            return (
              <div
                key={a.id}
                className={`bg-[#1A1A1A] border-l-4 ${style.border} border border-[#2E2E2E] rounded-r-lg p-4`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${style.badge}`}>
                    {style.label}
                  </span>
                  <span className="text-[11px] text-[#808080]">{a.submittedAt}</span>
                </div>
                <div className="font-semibold text-sm mb-1">{a.title}</div>
                <p className="text-[#B8B8B8] text-xs leading-relaxed">{a.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
