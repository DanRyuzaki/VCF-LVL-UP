import { UserRole } from "@/types/user";

export interface RoleConfig {
  label: string;
  dashboardPath: string;
  color: string;
  sidebarItems: { label: string; section: string; icon: string }[];
}

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  gamer: {
    label: "Gamer",
    dashboardPath: "/gamer",
    color: "#00F5D4",
    sidebarItems: [
      { label: "Profile",       section: "profile",       icon: "user" },
      { label: "My Team",       section: "team",          icon: "team" },
      { label: "Schedule",      section: "schedule",      icon: "calendar" },
      { label: "Brackets",      section: "brackets",      icon: "bracket" },
      { label: "Announcements", section: "announcements", icon: "bell" },
      { label: "Livestream",    section: "livestream",    icon: "video" },
    ],
  },
  organizer: {
    label: "Organizer",
    dashboardPath: "/organizer",
    color: "#8B5CF6",
    sidebarItems: [
      { label: "Overview",        section: "overview",      icon: "chart" },
      { label: "Leader Chat",     section: "chat",          icon: "chat" },
      { label: "Teams",           section: "teams",         icon: "team" },
      { label: "Draft Players",   section: "draft",         icon: "target" },
      { label: "Free Agents",     section: "free_agents",   icon: "users" },
      { label: "Tournaments",     section: "tournaments",   icon: "trophy" },
      { label: "Playoff Brackets", section: "brackets",     icon: "bracket" },
      { label: "Match Results",   section: "results",       icon: "check" },
      { label: "Team Standings",  section: "standings",     icon: "standings" },
      { label: "Game Statistics", section: "stats",         icon: "report" },
      { label: "Announcements",   section: "announcements", icon: "bell" },
      { label: "Calendar",        section: "calendar",      icon: "calendar" },
    ],
  },
  admin: {
    label: "Admin",
    dashboardPath: "/admin",
    color: "#FF4655",
    sidebarItems: [
      { label: "Overview",        section: "overview",    icon: "chart" },
      { label: "Approval Center", section: "approvals",  icon: "check" },
      { label: "User Management", section: "users",      icon: "users" },
      { label: "Tournament Monitor", section: "tournaments", icon: "trophy" },
      { label: "Livestream",      section: "livestream", icon: "video" },
      { label: "Reports",         section: "reports",    icon: "report" },
    ],
  },
  developer: {
    label: "Developer",
    dashboardPath: "/developer",
    color: "#FF4655",
    sidebarItems: [
      { label: "System Logs",    section: "logs",        icon: "terminal" },
      { label: "Error Reports",  section: "errors",      icon: "warning" },
      { label: "User Management", section: "metadata",    icon: "database" },
      { label: "Role Management",section: "roles",       icon: "lock" },
      { label: "Maintenance",    section: "maintenance", icon: "wrench" },
      { label: "CRM Records",    section: "crm",         icon: "folder" },
    ],
  },
};
