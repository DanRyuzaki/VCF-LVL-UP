"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  tournamentId?: string;
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
  drafted?: boolean;
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

// ─── Firestore write helpers (exported so modules can use them) ───────────────

export async function fsAddTeam(data: Omit<Team, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "teams"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function fsUpdateTeam(id: string, data: Partial<Omit<Team, "id">>) {
  await updateDoc(doc(db, "teams", id), { ...data, updatedAt: serverTimestamp() });
}

export async function fsAddTournament(data: Omit<Tournament, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "tournaments"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function fsUpdateTournament(id: string, data: Partial<Omit<Tournament, "id">>) {
  await updateDoc(doc(db, "tournaments", id), { ...data, updatedAt: serverTimestamp() });
}

export async function fsAddMatch(data: Omit<Match, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "matches"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function fsUpdateMatch(id: string, data: Partial<Omit<Match, "id">>) {
  await updateDoc(doc(db, "matches", id), { ...data, updatedAt: serverTimestamp() });
}

export async function fsAddPlayer(data: Player) {
  await addDoc(collection(db, "players"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function fsUpdatePlayer(id: string, data: Partial<Player>) {
  await updateDoc(doc(db, "players", id), { ...data, updatedAt: serverTimestamp() });
}

export async function fsDeletePlayer(id: string) {
  await deleteDoc(doc(db, "players", id));
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface OrganizerContextValue {
  // Live data from Firestore
  teams: Team[];
  tournaments: Tournament[];
  matchesState: Match[];
  freeAgents: Player[];
  draftedPlayers: Player[];
  announcements: Announcement[];
  chatLeaders: ChatLeader[];

  // Loading state
  loading: boolean;

  // Setters kept for bracket-management's local generate logic;
  // all other writes should use the fs* helpers above.
  setTeams: Dispatch<SetStateAction<Team[]>>;
  setTournaments: Dispatch<SetStateAction<Tournament[]>>;
  setMatchesState: Dispatch<SetStateAction<Match[]>>;
  setFreeAgents: Dispatch<SetStateAction<Player[]>>;
  setDraftedPlayers: Dispatch<SetStateAction<Player[]>>;
  setChatLeaders: Dispatch<SetStateAction<ChatLeader[]>>;

  // Raw Firestore doc ids for players (ign → docId map)
  playerDocIds: Record<string, string>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const OrganizerContext = createContext<OrganizerContextValue | null>(null);

export function OrganizerProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams]                   = useState<Team[]>([]);
  const [tournaments, setTournaments]       = useState<Tournament[]>([]);
  const [matchesState, setMatchesState]     = useState<Match[]>([]);
  const [freeAgents, setFreeAgents]         = useState<Player[]>([]);
  const [draftedPlayers, setDraftedPlayers] = useState<Player[]>([]);
  const [chatLeaders, setChatLeaders]       = useState<ChatLeader[]>([]);
  const [playerDocIds, setPlayerDocIds]     = useState<Record<string, string>>({});
  const [loading, setLoading]               = useState(true);

  // announcements is read-only in this context (AnnouncementManagementModule owns the writable copy)
  const announcements: Announcement[] = [];

  useEffect(() => {
    let resolved = 0;
    const total = 4; // teams, tournaments, matches, players
    const maybeReady = () => { resolved++; if (resolved >= total) setLoading(false); };

    // ── teams ──────────────────────────────────────────────────────────────
    const unsubTeams = onSnapshot(
      query(collection(db, "teams"), orderBy("createdAt", "asc")),
      (snap) => {
        setTeams(
          snap.docs.map((d) => ({
            id: d.id,
            name: d.data().name ?? "",
            game: d.data().game ?? "",
            head: d.data().head ?? "",
            players: d.data().players ?? [],
            status: d.data().status ?? "incomplete",
          }))
        );
        maybeReady();
      },
      (err) => { console.error("teams snapshot error:", err); maybeReady(); }
    );

    // ── tournaments ────────────────────────────────────────────────────────
    const unsubTournaments = onSnapshot(
      query(collection(db, "tournaments"), orderBy("createdAt", "asc")),
      (snap) => {
        setTournaments(
          snap.docs.map((d) => ({
            id: d.id,
            name: d.data().name ?? "",
            game: d.data().game ?? "",
            format: d.data().format ?? "",
            season: d.data().season ?? 1,
            teamsRegistered: d.data().teamsRegistered ?? 0,
            maxTeams: d.data().maxTeams ?? 8,
            matchesPlayed: d.data().matchesPlayed ?? 0,
            totalMatches: d.data().totalMatches ?? 0,
            status: d.data().status ?? "registration",
            teamsList: d.data().teamsList ?? [],
            matchesList: d.data().matchesList ?? [],
          }))
        );
        maybeReady();
      },
      (err) => { console.error("tournaments snapshot error:", err); maybeReady(); }
    );

    // ── matches ────────────────────────────────────────────────────────────
    const unsubMatches = onSnapshot(
      query(collection(db, "matches"), orderBy("createdAt", "asc")),
      (snap) => {
        setMatchesState(
          snap.docs.map((d) => ({
            id: d.id,
            round: d.data().round ?? "",
            teamA: d.data().teamA ?? "",
            teamB: d.data().teamB ?? "",
            winner: d.data().winner ?? "",
            scoreA: d.data().scoreA ?? 0,
            scoreB: d.data().scoreB ?? 0,
            date: d.data().date ?? "",
            time: d.data().time ?? "",
            status: d.data().status ?? "pending",
            tournamentId: d.data().tournamentId ?? undefined,
          }))
        );
        maybeReady();
      },
      (err) => { console.error("matches snapshot error:", err); maybeReady(); }
    );

    // ── players ────────────────────────────────────────────────────────────
    const unsubPlayers = onSnapshot(
      query(collection(db, "players"), orderBy("createdAt", "asc")),
      (snap) => {
        const allPlayers: Player[] = [];
        const idMap: Record<string, string> = {};

        snap.docs.forEach((d) => {
          const p: Player = {
            name: d.data().name ?? "",
            ign: d.data().ign ?? "",
            game: d.data().game ?? "",
            role: d.data().role ?? "",
            rank: d.data().rank ?? "",
            winRate: d.data().winRate ?? "0%",
            kda: d.data().kda ?? "0",
            history: d.data().history ?? [],
            team: d.data().team ?? undefined,
            drafted: d.data().drafted ?? false,
          };
          allPlayers.push(p);
          idMap[p.ign] = d.id;
        });

        setFreeAgents(allPlayers.filter((p) => !p.drafted));
        setDraftedPlayers(allPlayers.filter((p) => p.drafted));
        setPlayerDocIds(idMap);
        maybeReady();
      },
      (err) => { console.error("players snapshot error:", err); maybeReady(); }
    );

    return () => {
      unsubTeams();
      unsubTournaments();
      unsubMatches();
      unsubPlayers();
    };
  }, []);

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
        loading,
        playerDocIds,
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
