"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  game: string;
  head: string;
  players: string[];
  status: string;
}

export interface Tournament {
  id: string;
  name: string;
  game: string;
  format: string;
  season: number;
  teamsRegistered: number;
  maxTeams: number;
  matchesPlayed: number;
  totalMatches: number;
  status: string;
  teamsList: { name: string; players: number }[];
  matchesList: string[];
}

export interface Match {
  id: string;
  round: string;
  teamA: string;
  teamB: string;
  winner: string;
  scoreA: number;
  scoreB: number;
  date: string;
  time: string;
  status: string;
}

export interface Player {
  name: string;
  ign: string;
  game: string;
  role: string;
  rank: string;
  winRate: string;
  kda: string;
  history: string[];
  team?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  submittedAt: string;
  status: string;
}

export interface ChatLeader {
  name: string;
  team: string;
  unread: number;
  history: Array<{ sender: string; text: string; time: string }>;
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface OrganizerContextValue {
  teams: Team[];
  setTeams: Dispatch<SetStateAction<Team[]>>;

  tournaments: Tournament[];
  setTournaments: Dispatch<SetStateAction<Tournament[]>>;

  matchesState: Match[];
  setMatchesState: Dispatch<SetStateAction<Match[]>>;

  freeAgents: Player[];
  setFreeAgents: Dispatch<SetStateAction<Player[]>>;

  draftedPlayers: Player[];
  setDraftedPlayers: Dispatch<SetStateAction<Player[]>>;

  announcements: Announcement[];

  chatLeaders: ChatLeader[];
  setChatLeaders: Dispatch<SetStateAction<ChatLeader[]>>;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_TEAMS: Team[] = [
  { id: "t1", name: "Team Blaze", game: "MLBB", head: "Marco Reyes",  players: ["Marco Reyes", "John Dela Cruz", "Liza Santos", "Kevin Bautista"], status: "active" },
  { id: "t2", name: "Team Storm", game: "MLBB", head: "Rico Cruz",    players: ["Rico Cruz", "Alice Wang", "Bob Miller"],                          status: "active" },
  { id: "t3", name: "Team Frost", game: "MLBB", head: "Leo Tan",      players: ["Leo Tan", "Sarah Jenkins"],                                       status: "active" },
  { id: "t4", name: "Team Venom", game: "MLBB", head: "Jake Uy",      players: ["Jake Uy"],                                                         status: "incomplete" },
  { id: "t5", name: "Team Nova",  game: "MLBB", head: "Nico Lim",     players: ["Nico Lim"],                                                        status: "active" },
  { id: "t6", name: "Team Apex",  game: "MLBB", head: "Bea Santos",   players: ["Bea Santos"],                                                      status: "active" },
];

const SEED_TOURNAMENTS: Tournament[] = [
  {
    id: "tr1", name: "MLBB Championship", game: "MLBB", format: "Single Elimination", season: 4,
    teamsRegistered: 8, maxTeams: 8, matchesPlayed: 2, totalMatches: 7, status: "ongoing",
    teamsList: [
      { name: "Team Blaze", players: 4 }, { name: "Team Storm", players: 3 },
      { name: "Team Frost", players: 2 }, { name: "Team Venom", players: 1 },
      { name: "Team Nova",  players: 1 }, { name: "Team Apex",  players: 1 },
      { name: "Team Forge", players: 4 }, { name: "Team Rush",  players: 4 },
    ],
    matchesList: ["qf1", "qf2", "qf3", "qf4", "sf1", "sf2", "f1"],
  },
  {
    id: "tr2", name: "CODM Clash", game: "CODM", format: "Single Elimination", season: 1,
    teamsRegistered: 4, maxTeams: 8, matchesPlayed: 0, totalMatches: 7, status: "registration",
    teamsList: [{ name: "Team Frost", players: 2 }, { name: "Team Venom", players: 1 }],
    matchesList: [],
  },
];

const SEED_MATCHES: Match[] = [
  { id: "qf1", round: "Quarterfinals", teamA: "Team Blaze", teamB: "Team Storm", winner: "Team Blaze", scoreA: 2, scoreB: 0, date: "2026-06-07", time: "2:00 PM", status: "completed" },
  { id: "qf2", round: "Quarterfinals", teamA: "Team Frost", teamB: "Team Venom", winner: "Team Frost", scoreA: 2, scoreB: 1, date: "2026-06-07", time: "4:00 PM", status: "completed" },
  { id: "qf3", round: "Quarterfinals", teamA: "Team Nova",  teamB: "Team Apex",  winner: "",           scoreA: 0, scoreB: 0, date: "2026-06-14", time: "2:00 PM", status: "pending" },
  { id: "qf4", round: "Quarterfinals", teamA: "Team Forge", teamB: "Team Rush",  winner: "",           scoreA: 0, scoreB: 0, date: "2026-06-14", time: "4:00 PM", status: "pending" },
  { id: "sf1", round: "Semifinals",    teamA: "Team Blaze", teamB: "Team Frost", winner: "",           scoreA: 0, scoreB: 0, date: "2026-06-21", time: "2:00 PM", status: "pending" },
  { id: "sf2", round: "Semifinals",    teamA: "TBD",        teamB: "TBD",        winner: "",           scoreA: 0, scoreB: 0, date: "2026-06-21", time: "4:00 PM", status: "pending" },
  { id: "f1",  round: "Finals",        teamA: "TBD",        teamB: "TBD",        winner: "",           scoreA: 0, scoreB: 0, date: "2026-06-28", time: "3:00 PM", status: "pending" },
];

const SEED_FREE_AGENTS: Player[] = [
  { name: "Ana Lim",       ign: "AnaLim_PH",     game: "MLBB", role: "Mid Lane",  rank: "Mythic", winRate: "64%", kda: "4.2", history: ["Win", "Win", "Win", "Loss", "Win"] },
  { name: "Ben Torres",    ign: "BenT_MLBB",     game: "MLBB", role: "Jungler",   rank: "Mythic", winRate: "57%", kda: "3.5", history: ["Win", "Loss", "Win", "Win", "Loss"] },
  { name: "Claire Ong",    ign: "ClaireOng",     game: "CODM", role: "Supports",  rank: "Elite",  winRate: "69%", kda: "5.1", history: ["Win", "Win", "Win", "Loss", "Win"] },
  { name: "Dan Perez",     ign: "DanP_COD",      game: "CODM", role: "Objective", rank: "Pro",    winRate: "55%", kda: "3.2", history: ["Loss", "Win", "Loss", "Win", "Win"] },
  { name: "Michael Chang", ign: "MikeC_Mid",     game: "MLBB", role: "Mid Lane",  rank: "Mythic", winRate: "60%", kda: "4.0", history: ["Win", "Loss", "Win", "Loss", "Win"] },
  { name: "Sarah Connor",  ign: "SarahC_XP",     game: "MLBB", role: "XP Lane",   rank: "Legend", winRate: "58%", kda: "3.9", history: ["Loss", "Loss", "Win", "Win", "Win"] },
  { name: "David Kim",     ign: "DaveK_Roam",    game: "MLBB", role: "Roamer",    rank: "Mythic", winRate: "61%", kda: "4.6", history: ["Win", "Win", "Loss", "Win", "Win"] },
];

const SEED_DRAFTED_PLAYERS: Player[] = [
  { name: "Carlos Mendez", ign: "CarM_XP",       game: "MLBB", role: "XP Lane", rank: "Mythic", winRate: "62%", kda: "3.8", history: ["Win", "Loss", "Win", "Win", "Win"],  team: "Team Frost" },
  { name: "Sophia Lopez",  ign: "SophL_Support", game: "MLBB", role: "Roamer",  rank: "Legend", winRate: "58%", kda: "4.5", history: ["Win", "Win", "Loss", "Win", "Loss"], team: "Team Blaze" },
];

const SEED_ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", title: "Roster Registration Open", content: "Submit team slots for season 4",      submittedAt: "2026-06-01", status: "published" },
  { id: "a2", title: "Draft Pools Finalized",    content: "Free agent selection starts June 20", submittedAt: "2026-06-05", status: "pending" },
];

const SEED_CHAT_LEADERS: ChatLeader[] = [
  {
    name: "Marco Reyes", team: "Team Blaze", unread: 1,
    history: [{ sender: "Marco Reyes", text: "Coach, are the final rosters confirmed yet?", time: "09:30 AM" }],
  },
  {
    name: "Bea Santos", team: "Team Apex", unread: 0,
    history: [{ sender: "Bea Santos", text: "Ready for our QF match next week.", time: "Yesterday" }],
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────

export const OrganizerContext = createContext<OrganizerContextValue | null>(null);

export function OrganizerProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams]                     = useState<Team[]>(SEED_TEAMS);
  const [tournaments, setTournaments]         = useState<Tournament[]>(SEED_TOURNAMENTS);
  const [matchesState, setMatchesState]       = useState<Match[]>(SEED_MATCHES);
  const [freeAgents, setFreeAgents]           = useState<Player[]>(SEED_FREE_AGENTS);
  const [draftedPlayers, setDraftedPlayers]   = useState<Player[]>(SEED_DRAFTED_PLAYERS);
  const [chatLeaders, setChatLeaders]         = useState<ChatLeader[]>(SEED_CHAT_LEADERS);

  // announcements is read-only in this context (the writable copy lives inside AnnouncementManagementModule)
  const announcements = SEED_ANNOUNCEMENTS;

  return (
    <OrganizerContext.Provider
      value={{
        teams, setTeams,
        tournaments, setTournaments,
        matchesState, setMatchesState,
        freeAgents, setFreeAgents,
        draftedPlayers, setDraftedPlayers,
        announcements,
        chatLeaders, setChatLeaders,
      }}
    >
      {children}
    </OrganizerContext.Provider>
  );
}

export function useOrganizerContext(): OrganizerContextValue {
  const ctx = useContext(OrganizerContext);
  if (!ctx) {
    throw new Error("useOrganizerContext must be used within an OrganizerProvider");
  }
  return ctx;
}
