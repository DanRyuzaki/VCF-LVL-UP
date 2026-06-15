export type GameType = "MLBB" | "CODM";
export type TournamentStatus = "registration" | "ongoing" | "completed";
export type MatchStatus = "pending" | "ongoing" | "completed";

export interface Team {
  id: string;
  name: string;
  game: GameType;
  headId: string;
  headName: string;
  playerCount: number;
  maxPlayers: number;
  status: "active" | "incomplete";
}

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  round: string;
  teamA: string;
  teamB: string;
  winner?: string;
  scoreA?: number;
  scoreB?: number;
  date: string;
  time: string;
  status: MatchStatus;
  game: GameType;
}

export interface Tournament {
  id: string;
  name: string;
  game: GameType;
  season: number;
  format: "Single Elimination";
  status: TournamentStatus;
  teamsRegistered: number;
  maxTeams: number;
  matchesPlayed: number;
  totalMatches: number;
  createdAt: string;
}

export interface BracketTeam {
  name: string;
  score?: number;
  isWinner?: boolean;
}

export interface BracketMatch {
  id: string;
  teamA: BracketTeam;
  teamB: BracketTeam;
}

export interface BracketRound {
  title: string;
  matches: BracketMatch[];
}
