"use client";
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
        <div style={{ borderTop: "1px solid var(--c-border)" }} />
        <AncmentSection />
        <MatchesSection />
        <div style={{ borderTop: "1px solid var(--c-border)" }} />
        <LiveSection />
        <AccessSection />
      </main>
      <footer
        style={{
          backgroundColor: "var(--c-surface)",
          borderTop: "1px solid var(--c-border)",
        }}
        className="py-6 px-6 text-center"
      >
        <div style={{ color: "var(--c-text-dim)" }} className="text-xs">
          © 2025 Word Baptist Church, Inc. — Faith-Based Youth eSports Management System
        </div>
      </footer>
    </>
  );
}
