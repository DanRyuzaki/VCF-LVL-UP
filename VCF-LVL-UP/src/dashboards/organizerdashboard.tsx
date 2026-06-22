"use client";

import { useState } from "react";
import { OrganizerProvider } from "@/lib/organizer-context";
import Sidebar from "@/components/shared/sidebar";
import PageHeader from "@/components/shared/page-header";
import DashboardHeader from "@/components/shared/dashboard-header";
import OverviewManagementModule from "@/modules/overview-management";
import ChatManagementModule from "@/modules/chat-management";
import TeamDraftManagementModule from "@/modules/team-management";
import FreeAgentsDirectoryModule from "@/modules/free-agents-directory";
import TournamentManagementModule from "@/modules/tournament-management";
import BracketManagementModule from "@/modules/bracket-management";
import StatsManagementModule from "@/modules/stats-management";
import AnnouncementManagementModule from "@/modules/announcement-management";
import OrganizerCalendarModule from "@/modules/organizer-calendar-management";
import OrganizerScheduleModule from "@/modules/organizer-schedule-management";


const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  overview:      { title: "ORGANIZER DASHBOARD",      subtitle: "Tournament management overview" },
  chat:          { title: "COMMUNICATE WITH LEADERS", subtitle: "Direct chat channel with team captains" },
  teams:         { title: "TEAM & DRAFT MANAGEMENT",  subtitle: "Create teams, assign leaders, and draft free agents" },
  "free-agents": { title: "FREE AGENTS",              subtitle: "Browse gamers currently listed as free agents" },
  tournaments:   { title: "TOURNAMENTS",              subtitle: "Create and configure tournament formats" },
  brackets:      { title: "PLAYOFF BRACKETS",         subtitle: "Advance qualified teams to playoff brackets" },
  schedule:      { title: "MATCH SCHEDULE",            subtitle: "View, schedule, and manage all tournament matches" },
  stats:         { title: "GAME STATISTICS",           subtitle: "Detailed win-rates, MVPs, and metrics" },
  announcements: { title: "ANNOUNCEMENT MAKER",       subtitle: "Submit announcements for admin moderation" },
  calendar:      { title: "CALENDAR SCHEDULER",       subtitle: "Schedule matches and filter past events" },
};


function OrganizerLayout() {
  const [section, setSection] = useState("overview");

  const renderSection = () => {
    switch (section) {
      case "overview":      return <OverviewManagementModule />;
      case "chat":          return <ChatManagementModule />;
      case "teams":         return <TeamDraftManagementModule />;
      case "free-agents":   return <FreeAgentsDirectoryModule />;
      case "tournaments":   return <TournamentManagementModule />;
      case "brackets":      return <BracketManagementModule showActions />;
      case "schedule":      return <OrganizerScheduleModule />;
      case "stats":         return <StatsManagementModule />;
      case "announcements": return <AnnouncementManagementModule showSubmitForm />;
      case "calendar":      return <OrganizerCalendarModule />;
      default:              return null;
    }
  };

  const meta = SECTION_TITLES[section] ?? { title: section.toUpperCase(), subtitle: "" };

  return (
    <div className="flex">
      <Sidebar role="organizer" activeSection={section} onSectionChange={setSection} />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader role="organizer" />
        <main
          className="flex-1"
          style={{ overflowY: "auto", padding: "32px", backgroundColor: "var(--c-page-bg)" }}
        >
          <PageHeader title={meta.title} subtitle={meta.subtitle} />
          {renderSection()}
        </main>
      </div>
    </div>
  );
}


export default function OrganizerDashboard() {
  return (
    <OrganizerProvider>
      <OrganizerLayout />
    </OrganizerProvider>
  );
}
