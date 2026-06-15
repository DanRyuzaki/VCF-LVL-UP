import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="min-h-[90vh] flex items-center justify-center text-center px-6 py-20 relative overflow-hidden"
      style={{ backgroundColor: "var(--c-page-bg)" }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[120px]"
          style={{ backgroundColor: "rgba(255,70,85,0.07)" }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Tag */}
        <div
          className="inline-block text-[11px] uppercase tracking-[2px] px-4 py-1.5 rounded mb-6 border"
          style={{
            backgroundColor: "rgba(255,70,85,0.12)",
            borderColor: "rgba(255,70,85,0.25)",
            color: "var(--c-accent)",
          }}
        >
          ⚡ Word Baptist Church, Inc. — Youth Ministry
        </div>

        {/* Title */}
        <h1
          className="font-head text-[clamp(2.5rem,7vw,5rem)] font-bold uppercase leading-[1.05] tracking-wide mb-4"
          style={{ color: "var(--c-text)" }}
        >
          COMPETE.
          <br />
          <span style={{ color: "var(--c-accent)" }}>CONQUER.</span>
          <br />
          GLORIFY.
        </h1>

        {/* Subtitle */}
        <p
          className="text-base leading-relaxed max-w-lg mx-auto mb-10"
          style={{ color: "var(--c-text-muted)" }}
        >
          The official digital management system for Faith-Based Youth eSports Events —
          Mobile Legends: Bang Bang &amp; Call of Duty: Mobile competitions.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/login"
            className="text-white font-semibold uppercase tracking-widest text-sm px-8 py-3 rounded-lg transition-colors"
            style={{ backgroundColor: "var(--c-accent)" }}
          >
            Get Started
          </Link>
          <a
            href="#tournaments"
            className="font-semibold uppercase tracking-widest text-sm px-8 py-3 rounded-lg transition-all border"
            style={{
              borderColor: "var(--c-border)",
              color: "var(--c-text)",
            }}
          >
            View Tournaments
          </a>
        </div>

        {/* Stats row */}
        <div
          className="flex items-center justify-center gap-10 mt-14 pt-10 border-t"
          style={{ borderColor: "var(--c-border)" }}
        >
          {[
            { value: "2",  label: "Active Tournaments" },
            { value: "8",  label: "Competing Teams" },
            { value: "48", label: "Registered Players" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-head text-3xl font-bold" style={{ color: "var(--c-accent)" }}>
                {s.value}
              </div>
              <div className="text-[11px] uppercase tracking-wider mt-0.5" style={{ color: "var(--c-text-dim)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
