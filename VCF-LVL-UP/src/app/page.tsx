import Navbar from "@/components/shared/navbar";
import HeroSection from "@/components/landing/herosection";
import OverviewSection from "@/components/landing/overview";
import TournaSection from "@/components/landing/tourna";
import AncmentSection from "@/components/landing/ancment";
import MatchesSection from "@/components/landing/matches";
import LiveSection from "@/components/landing/live";
import AccessSection from "@/components/landing/access";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <OverviewSection />
        <TournaSection />
        <div className="border-t border-[#2E2E2E]" />
        <AncmentSection />
        <MatchesSection />
        <div className="border-t border-[#2E2E2E]" />
        <LiveSection />
        <AccessSection />
      </main>
      <footer className="bg-[#121212] border-t border-[#2E2E2E] py-6 px-6 text-center">
        <div className="text-[#808080] text-xs">
          © 2025 Word Baptist Church, Inc. — Faith-Based Youth eSports Management System
        </div>
      </footer>
    </>
  );
}
