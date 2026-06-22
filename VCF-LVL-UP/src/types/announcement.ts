export type AnnouncementStatus = "pending" | "approved" | "published" | "archived";
export type AnnouncementCategory = "info" | "urgent" | "open" | "new";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  status: AnnouncementStatus;
  submittedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  status: "pending" | "approved";
  submittedBy: string;
}

export interface Livestream {
  id: string;
  label: string;
  url: string;
  status: "live" | "scheduled" | "ended";
  tournamentName: string;
  platform?: string;
  schedule?: string;
  title?: string;
}
