import Link from "next/link";

export default function AccessSection() {
  return (
    <section className="py-16 px-6 bg-[#121212] border-t border-[#2E2E2E]">
      <div className="max-w-6xl mx-auto text-center">
        <div className="text-[11px] uppercase tracking-[2px] text-[#FF4655] mb-3">Get Started</div>
        <h2 className="font-head text-3xl font-bold uppercase tracking-wide mb-3">
          JOIN THE COMPETITION
        </h2>
        <p className="text-[#B8B8B8] text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Access your role dashboard to manage tournaments, view brackets, check announcements,
          and watch live matches.
        </p>
        <Link
          href="/login"
          className="inline-block bg-[#FF4655] hover:bg-[#E53E4D] text-white font-semibold uppercase tracking-widest text-sm px-10 py-3 rounded-lg transition-colors"
        >
          Login to Dashboard
        </Link>
      </div>
    </section>
  );
}
