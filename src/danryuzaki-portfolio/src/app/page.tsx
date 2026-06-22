import Grain from "@/components/Grain";
import StatusLine from "@/components/StatusLine";
import SocialLinks from "@/components/SocialLinks";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-1 flex-col overflow-hidden bg-[color:var(--color-ink)]">
      <Grain />

      {/* ambient glow, off-center, low and to the right — a single light source */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-1/4 h-[480px] w-[480px] rounded-full bg-[color:var(--color-brass)] opacity-[0.06] blur-[120px]"
      />

      <div className="relative z-10 flex flex-1 flex-col px-6 sm:px-10">
        {/* mark */}
        <header className="flex items-center justify-between pt-8 sm:pt-10">
          <span className="font-[family-name:var(--font-display)] text-[13px] tracking-[0.18em] text-[color:var(--color-paper-dim)]">
            DAN<span className="text-[color:var(--color-brass)]">.</span>RYUZAKI
          </span>
          <span className="hidden font-[family-name:var(--font-display)] text-[11px] tracking-[0.18em] text-[color:var(--color-paper-dim)] sm:inline">
            CALOOCAN · UTC+8
          </span>
        </header>

        {/* hero */}
        <section className="flex flex-1 flex-col items-start justify-center gap-7 py-16 sm:gap-8">
          <p className="font-[family-name:var(--font-display)] text-xs tracking-[0.22em] text-[color:var(--color-brass)] sm:text-sm">
            DANIEL RYUZAKI ADAN
          </p>

          <h1 className="font-[family-name:var(--font-display)] text-[clamp(3.2rem,15vw,8.5rem)] font-medium leading-[0.85] tracking-tight text-[color:var(--color-paper)]">
            Soon<span className="text-[color:var(--color-brass)]">.</span>
          </h1>

          <p className="max-w-[34ch] text-base leading-relaxed text-[color:var(--color-paper-dim)] sm:text-lg">
            Freelance software &amp; ML engineer. This domain is reserved —
            everything else is still in progress.
          </p>

          <div className="pt-2">
            <StatusLine />
          </div>
        </section>

        {/* footer */}
        <footer className="flex flex-col gap-5 border-t border-[color:var(--color-line)] py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-[family-name:var(--font-display)] text-[11px] tracking-[0.1em] text-[color:var(--color-paper-dim)]">
            SOLI DEO CODE — © {new Date().getFullYear()}
          </p>
          <SocialLinks />
        </footer>
      </div>
    </main>
  );
}
