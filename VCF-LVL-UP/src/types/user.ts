export type UserRole = "developer" | "admin" | "organizer" | "gamer";

export type GamerType = "team_leader" | "team_member" | "free_agent";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gamerType?: GamerType;
  teamId?: string;
  inGameName?: string;
  phone?: string;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin: string;
}
