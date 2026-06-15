import { announcements } from "@/data/announcements";
import { Announcement } from "@/types/announcement";

type CategoryKey = Announcement["category"];

const categoryStyles: Record<CategoryKey, { borderColor: string; badgeBg: string; badgeColor: string; label: string }> = {
  new:    { borderColor: "#FF4655", badgeBg: "rgba(255,70,85,0.18)",  badgeColor: "#FF4655",  label: "NEW"    },
  open:   { borderColor: "#00F5D4", badgeBg: "rgba(0,245,212,0.12)",  badgeColor: "#00F5D4",  label: "OPEN"   },
  info:   { borderColor: "#8B5CF6", badgeBg: "rgba(139,92,246,0.18)", badgeColor: "#8B5CF6",  label: "INFO"   },
  urgent: { borderColor: "#FF4655", badgeBg: "rgba(255,70,85,0.18)",  badgeColor: "#FF4655",  label: "URGENT" },
};

export default function AncmentSection() {
  const published = announcements.filter((a) => a.status === "published");

  return (
    <section id="announcements" className="py-16 px-6" style={{ backgroundColor: "var(--c-page-bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-[11px] uppercase tracking-[2px] mb-2" style={{ color: "var(--c-accent)" }}>
          Latest Updates
        </div>
        <h2 className="font-head text-3xl font-bold uppercase tracking-wide mb-8" style={{ color: "var(--c-text)" }}>
          ANNOUNCEMENTS
        </h2>

        <div className="flex flex-col gap-3">
          {published.map((a) => {
            const style = categoryStyles[a.category];
            return (
              <div
                key={a.id}
                className="border-l-4 border rounded-r-lg p-4"
                style={{
                  backgroundColor: "var(--c-surface2)",
                  borderLeftColor: style.borderColor,
                  borderColor: "var(--c-border)",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                    style={{ backgroundColor: style.badgeBg, color: style.badgeColor }}
                  >
                    {style.label}
                  </span>
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
