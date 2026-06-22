import Link from "next/link";

export default function AccessSection() {
  return (
    <section
      className="py-16 px-6 border-t"
      style={{
        backgroundColor: "var(--c-surface)",
        borderColor: "var(--c-border)",
      }}
    >
      <div className="max-w-6xl mx-auto text-center">
        <div className="text-[11px] uppercase tracking-[2px] mb-3" style={{ color: "var(--c-accent)" }}>
          Get Started
        </div>
        <h2 className="font-head text-3xl font-bold uppercase tracking-wide mb-3" style={{ color: "var(--c-text)" }}>
          JOIN THE COMPETITION
        </h2>
        <p className="text-sm max-w-md mx-auto mb-8 leading-relaxed" style={{ color: "var(--c-text-muted)" }}>
          Access your role dashboard to manage tournaments, view brackets, check announcements,
          and watch live matches.
        </p>
        <Link
          href="/login"
          className="inline-block text-white font-semibold uppercase tracking-widest text-sm px-10 py-3 rounded-lg transition-colors"
          style={{ backgroundColor: "var(--c-accent)" }}
        >
          Login to Dashboard
        </Link>
      </div>
    </section>
  );
}
