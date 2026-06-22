"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/sidebar";
import PageHeader from "@/components/shared/page-header";
import DashboardHeader from "@/components/shared/dashboard-header";
import AdminOverviewModule from "@/modules/admin-overview";
import ApprovalsManagementModule from "@/modules/approvals-management";
import TournamentMonitorModule from "@/modules/tournament-monitor";
import ReportsManagementModule from "@/modules/reports-management";
import UserManagementModule from "@/modules/user-management";
import CalendarManagementModule from "@/modules/calendar-management";
import LivestreamManagementModule from "@/modules/livestream-management";
import DeletedReportsModule from "@/modules/deleted-reports";
import CommunicationModule from "@/modules/communication";

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  overview:         { title: "ADMIN DASHBOARD",        subtitle: "System overview and pending actions" },
  approvals:        { title: "APPROVAL CENTER",         subtitle: "Review announcements and calendar events" },
  users:            { title: "USER MANAGEMENT",         subtitle: "Monitor all registered accounts" },
  tournaments:      { title: "TOURNAMENT MONITOR",      subtitle: "View tournament reports and registrations" },
  livestream:       { title: "LIVESTREAM MANAGEMENT",   subtitle: "Manage embedded stream links" },
  calendar:         { title: "CALENDAR MANAGEMENT",     subtitle: "Manage and approve calendar events" },
  reports:          { title: "REPORTS",                 subtitle: "Tournament and registration reports" },
  "deleted-reports":{ title: "DELETED REPORTS",         subtitle: "Administrative user deletion history and audit trail" },
  communication:    { title: "COMMUNICATION MODULE",    subtitle: "Internal messaging system for Admins and Developers" },
};

export default function AdminDashboard() {
  const [section, setSection] = useState("overview");
  const meta = SECTION_TITLES[section] ?? { title: section.toUpperCase(), subtitle: "" };

  const renderSection = () => {
    switch (section) {
      case "overview":          return <AdminOverviewModule />;
      case "approvals":         return <ApprovalsManagementModule />;
      case "users":             return <UserManagementModule context="admin" onNavigate={setSection} />;
      case "tournaments":       return <TournamentMonitorModule />;
      case "livestream":        return <LivestreamManagementModule showManageControls />;
      case "calendar":          return <CalendarManagementModule showSubmitForm showApproveActions />;
      case "reports":           return <ReportsManagementModule />;
      case "deleted-reports":   return <DeletedReportsModule />;
      case "communication":     return <CommunicationModule />;
      default:                  return null;
    }
  };

  return (
    <div className="flex">
      <Sidebar role="admin" activeSection={section} onSectionChange={setSection} />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader role="admin" />
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