import { Announcement } from "@/types/announcement";

export const announcements: Announcement[] = [
  {
    id: "a1",
    title: "MLBB Championship — Quarterfinals this Saturday!",
    content:
      "Team Blaze vs Team Storm kicks off at 2:00 PM. Tune in to the livestream for live coverage of all quarterfinal matches.",
    category: "new",
    status: "published",
    submittedBy: "Organizer",
    submittedAt: "2025-06-10",
  },
  {
    id: "a2",
    title: "CODM Clash Registration Now Open",
    content:
      "Registration for the first Call of Duty: Mobile tournament is now open. Slots are limited — secure your team's spot now.",
    category: "open",
    status: "published",
    submittedBy: "Organizer",
    submittedAt: "2025-06-08",
  },
  {
    id: "a3",
    title: "Draft Day Results — Season 4 Rosters Finalized",
    content:
      "All 8 teams have finalized their rosters after draft day. Check your team dashboard for player assignments.",
    category: "info",
    status: "published",
    submittedBy: "Organizer",
    submittedAt: "2025-06-05",
  },
  {
    id: "a4",
    title: "Practice Schedule Update",
    content: "Practice schedules have been updated for the upcoming quarterfinals week. Check the calendar for details.",
    category: "info",
    status: "pending",
    submittedBy: "Organizer",
    submittedAt: "2025-06-12",
  },
];
