"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/sidebar";
import PageHeader from "@/components/shared/page-header";
import DashboardHeader from "@/components/shared/dashboard-header";
import SystemLogsManagementModule from "@/modules/system-logs-management";
import ErrorReportsManagementModule from "@/modules/error-reports-management";
import UserManagementModule from "@/modules/user-management";
import RoleManagementModule from "@/modules/role-management";
import MaintenanceManagementModule from "@/modules/maintenance";
import ArchivedSectionModule from "@/modules/archived-section";
import CommunicationModule from "@/modules/communication";

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  logs: { title: "SYSTEM LOGS", subtitle: "Client-side activity and event logs" },
  errors: { title: "ERROR REPORTS", subtitle: "Client-side error tracking" },
  metadata: { title: "USER MANAGEMENT", subtitle: "Account records and role data" },
  roles: { title: "ROLE MANAGEMENT", subtitle: "Manage admins and suspend / restore accounts" },
  maintenance: { title: "MAINTENANCE", subtitle: "System utilities and maintenance tools" },
  archived: { title: "ARCHIVED SECTION", subtitle: "Centralized audit and monitoring section for admin activities" },
  communication: { title: "COMMUNICATION MODULE", subtitle: "Internal messaging system for Admins and Developers" },
};

export default function DeveloperDashboard() {
  const [section, setSection] = useState("logs");
  const meta = SECTION_TITLES[section] ?? { title: section.toUpperCase(), subtitle: "" };

  const renderSection = () => {
    switch (section) {
      case "logs": return <SystemLogsManagementModule />;
      case "errors": return <ErrorReportsManagementModule />;
      case "metadata": return <UserManagementModule context="developer" />;
      case "roles": return <RoleManagementModule />;
      case "maintenance": return <MaintenanceManagementModule />;
      case "archived": return <ArchivedSectionModule />;
      case "communication": return <CommunicationModule context="developer" />;
      default: return null;
    }
  };

  return (
    <div className="flex">
      <Sidebar role="developer" activeSection={section} onSectionChange={setSection} />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader role="developer" />
        <main
          className="flex-1"
          style={{
            overflowY: "auto",
            padding: "32px",
            backgroundColor: "var(--c-page-bg)",
          }}
        >
          <PageHeader title={meta.title} subtitle={meta.subtitle} />
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
