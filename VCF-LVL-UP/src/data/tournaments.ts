import { Tournament, BracketRound } from "@/types/tournament";

export const tournaments: Tournament[] = [
  {
    id: "t1",
    name: "MLBB Championship",
    game: "MLBB",
    season: 4,
    format: "Single Elimination",
    status: "ongoing",
    teamsRegistered: 8,
    maxTeams: 8,
    matchesPlayed: 2,
    totalMatches: 7,
    createdAt: "2025-05-01",
  },
  {
    id: "t2",
    name: "CODM Clash",
    game: "CODM",
    season: 1,
    format: "Single Elimination",
    status: "registration",
    teamsRegistered: 4,
    maxTeams: 8,
    matchesPlayed: 0,
    totalMatches: 7,
    createdAt: "2025-06-01",
  },
  {
    id: "t3",
    name: "MLBB Cup III",
    game: "MLBB",
    season: 3,
    format: "Single Elimination",
    status: "completed",
    teamsRegistered: 8,
    maxTeams: 8,
    matchesPlayed: 7,
    totalMatches: 7,
    createdAt: "2025-03-01",
  },
];

export const mlbbBracket: BracketRound[] = [
  {
    title: "Quarterfinals",
    matches: [
      { id: "qf1", teamA: { name: "Team Blaze", score: 2, isWinner: true }, teamB: { name: "Team Storm", score: 0 } },
      { id: "qf2", teamA: { name: "Team Frost", score: 2, isWinner: true }, teamB: { name: "Team Venom", score: 1 } },
      { id: "qf3", teamA: { name: "Team Nova" }, teamB: { name: "Team Apex" } },
      { id: "qf4", teamA: { name: "Team Forge" }, teamB: { name: "Team Rush" } },
    ],
  },
  {
    title: "Semifinals",
    matches: [
      { id: "sf1", teamA: { name: "Team Blaze" }, teamB: { name: "Team Frost" } },
      { id: "sf2", teamA: { name: "TBD" }, teamB: { name: "TBD" } },
    ],
  },
  {
    title: "Finals",
    matches: [
      { id: "f1", teamA: { name: "TBD" }, teamB: { name: "TBD" } },
    ],
  },
];
