"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isDashboard =
    pathname.startsWith("/gamer") ||
    pathname.startsWith("/organizer") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/developer");

  if (isDashboard) return null;

  return (
    <nav className="bg-[#121212] border-b border-[#2E2E2E] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-head text-xl font-bold tracking-widest uppercase text-[#FF4655]">
            eFaith<span className="text-white">Connect</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#tournaments"
            className="text-[#B8B8B8] text-xs uppercase tracking-widest hover:text-white transition-colors"
          >
            Tournaments
          </a>
          <a
            href="#announcements"
            className="text-[#B8B8B8] text-xs uppercase tracking-widest hover:text-white transition-colors"
          >
            Announcements
          </a>
          <a
            href="#matches"
            className="text-[#B8B8B8] text-xs uppercase tracking-widest hover:text-white transition-colors"
          >
            Matches
          </a>
          <a
            href="#livestream"
            className="text-[#B8B8B8] text-xs uppercase tracking-widest hover:text-white transition-colors"
          >
            Livestream
          </a>
        </div>

        {/* Login Button — top-left per spec means leading CTA */}
        <Link
          href="/login"
          className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-md transition-colors"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
