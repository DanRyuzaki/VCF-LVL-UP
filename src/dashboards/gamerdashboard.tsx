"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/sidebar";
import PageHeader from "@/components/shared/page-header";
import DashboardHeader from "@/components/shared/dashboard-header";
import ProfileManagementModule from "@/modules/profile-management";
import TeamViewerModule from "@/modules/team-viewer";
import ScheduleManagementModule from "@/modules/schedule-management";
import BracketManagementModule from "@/modules/bracket-management";
import AnnouncementManagementModule from "@/modules/announcement-management";
import LivestreamManagementModule from "@/modules/livestream-management";

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  profile:       { title: "MY PROFILE",    subtitle: "View and update your player profile" },
  team:          { title: "MY TEAM",       subtitle: "Team information and roster" },
  schedule:      { title: "SCHEDULE",      subtitle: "Upcoming matches and events" },
  brackets:      { title: "BRACKETS",      subtitle: "MLBB Championship — Season 4" },
  announcements: { title: "ANNOUNCEMENTS", subtitle: "Official updates from organizers" },
  livestream:    { title: "LIVESTREAM",    subtitle: "Watch live matches" },
};

export default function GamerDashboard() {
  const [section, setSection] = useState("profile");
  const meta = SECTION_TITLES[section] ?? { title: section.toUpperCase(), subtitle: "" };

  const renderSection = () => {
    switch (section) {
      case "profile":       return <ProfileManagementModule />;
      case "team":          return <TeamViewerModule />;
      case "schedule":      return <ScheduleManagementModule />;
      case "brackets":      return <BracketManagementModule showActions={false} />;
      case "announcements": return <AnnouncementManagementModule showSubmitForm={false} />;
      case "livestream":    return <LivestreamManagementModule showManageControls={false} />;
      default:              return null;
    }
  };

  return (
    <div className="flex">
      <Sidebar role="gamer" activeSection={section} onSectionChange={setSection} />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader role="gamer" />
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