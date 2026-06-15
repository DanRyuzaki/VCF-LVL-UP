import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="min-h-[90vh] flex items-center justify-center text-center px-6 py-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#FF4655]/[0.07] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Tag */}
        <div className="inline-block bg-[#FF4655]/15 border border-[#FF4655]/30 text-[#FF4655] text-[11px] uppercase tracking-[2px] px-4 py-1.5 rounded mb-6">
          ⚡ Word Baptist Church, Inc. — Youth Ministry
        </div>

        {/* Title */}
        <h1 className="font-head text-[clamp(2.5rem,7vw,5rem)] font-bold uppercase leading-[1.05] tracking-wide mb-4">
          COMPETE.
          <br />
          <span className="text-[#FF4655]">CONQUER.</span>
          <br />
          GLORIFY.
        </h1>

        {/* Subtitle */}
        <p className="text-[#B8B8B8] text-base leading-relaxed max-w-lg mx-auto mb-10">
          The official digital management system for Faith-Based Youth eSports Events —
          Mobile Legends: Bang Bang &amp; Call of Duty: Mobile competitions.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/login"
            className="bg-[#FF4655] hover:bg-[#E53E4D] text-white font-semibold uppercase tracking-widest text-sm px-8 py-3 rounded-lg transition-colors"
          >
            Get Started
          </Link>
          <a
            href="#tournaments"
            className="border border-[#2E2E2E] hover:border-[#FF4655] hover:text-[#FF4655] text-white font-semibold uppercase tracking-widest text-sm px-8 py-3 rounded-lg transition-all"
          >
            View Tournaments
          </a>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-10 mt-14 pt-10 border-t border-[#2E2E2E]">
          {[
            { value: "2", label: "Active Tournaments" },
            { value: "8", label: "Competing Teams" },
            { value: "48", label: "Registered Players" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-head text-3xl font-bold text-[#FF4655]">{s.value}</div>
              <div className="text-[11px] text-[#808080] uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
