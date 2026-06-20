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
  getDocs,
  where,
  deleteField,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  game: string;
  head: string;          // IGN or name of the team leader (a drafted free agent)
  headUid?: string;      // Firestore player doc id of the head
  players: string[];     // list of player names currently on roster (leader + confirmed members)
  pendingPlayers: string[]; // player names pending leader approval
  status: string;        // "incomplete" | "eligible"
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
  tournamentName?: string;
}

export interface Player {
  id?: string;  // Firestore doc id
  name: string;
  email?: string;
  ign: string;
  game: string;
  role: string;
  rank: string;
  winRate: string;
  kda: string;
  history: string[];
  team?: string;
  drafted?: boolean;       // true = confirmed on a team
  pendingTeam?: string;    // set when pending approval
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

// ─── Firestore write helpers ──────────────────────────────────────────────────

export async function fsAddTeam(data: Omit<Team, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "teams"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function fsUpdateTeam(id: string, data: Partial<Omit<Team, "id">>) {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = value === undefined ? deleteField() : value;
  }
  await updateDoc(doc(db, "teams", id), { ...sanitized, updatedAt: serverTimestamp() });
}

export async function fsDeleteTeam(id: string) {
  await deleteDoc(doc(db, "teams", id));
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

export async function fsDeleteTournament(id: string) {
  await deleteDoc(doc(db, "tournaments", id));
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

export async function fsAddPlayer(data: Omit<Player, "id">) {
  await addDoc(collection(db, "players"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function fsUpdatePlayer(id: string, data: Partial<Player>) {
  // Firestore rejects `undefined` values — convert them to deleteField() sentinels
  // so optional fields like `team` and `pendingTeam` are properly removed.
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = value === undefined ? deleteField() : value;
  }
  await updateDoc(doc(db, "players", id), { ...sanitized, updatedAt: serverTimestamp() });
}

/**
 * Sets teamId (and optionally gamerType) on the user's account document
 * (users/{uid}) by matching on email.  Called whenever a player is confirmed
 * onto a team or removed from one, so the gamer's team-viewer module and the
 * communication module can reflect the correct identity immediately.
 *
 * @param email     - the player's email address (stored on both players and users docs)
 * @param teamId    - the Firestore team document ID, or null to clear it
 * @param isLeader  - when provided, also stamps gamerType:
 *                    true  → "team_leader"
 *                    false → "free_agent"   (clears leader status on removal)
 *                    undefined → gamerType is left untouched
 */
export async function fsUpdateUserTeamId(
  email: string,
  teamId: string | null,
  isLeader?: boolean,
): Promise<void> {
  if (!email) return;
  const snap = await getDocs(
    query(collection(db, "users"), where("email", "==", email))
  );
  if (snap.empty) return; // player has no linked auth account yet — safe to skip

  const patch: Record<string, unknown> = { teamId, updatedAt: serverTimestamp() };
  if (isLeader === true)  patch.gamerType = "team_leader";
  if (isLeader === false) patch.gamerType = "free_agent";

  await updateDoc(snap.docs[0].ref, patch);
}

export async function fsDeletePlayer(id: string) {
  await deleteDoc(doc(db, "players", id));
}

export async function fsAddCalendarEvent(data: {
  title: string;
  date: string;
  time: string;
  status: "approved";
  submittedBy: string;
  submittedByName: string;
  matchId?: string;
  tournamentId?: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, "calendar_events"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface OrganizerContextValue {
  teams: Team[];
  tournaments: Tournament[];
  matchesState: Match[];
  allPlayers: Player[];
  freeAgents: Player[];
  draftedPlayers: Player[];
  announcements: Announcement[];
  chatLeaders: ChatLeader[];
  loading: boolean;

  setTeams: Dispatch<SetStateAction<Team[]>>;
  setTournaments: Dispatch<SetStateAction<Tournament[]>>;
  setMatchesState: Dispatch<SetStateAction<Match[]>>;
  setFreeAgents: Dispatch<SetStateAction<Player[]>>;
  setDraftedPlayers: Dispatch<SetStateAction<Player[]>>;
  setChatLeaders: Dispatch<SetStateAction<ChatLeader[]>>;

  // Map: ign → docId
  playerDocIds: Record<string, string>;
}

export const OrganizerContext = createContext<OrganizerContextValue | null>(null);

export function OrganizerProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams]                   = useState<Team[]>([]);
  const [tournaments, setTournaments]       = useState<Tournament[]>([]);
  const [matchesState, setMatchesState]     = useState<Match[]>([]);
  const [allPlayers, setAllPlayers]         = useState<Player[]>([]);
  const [freeAgents, setFreeAgents]         = useState<Player[]>([]);
  const [draftedPlayers, setDraftedPlayers] = useState<Player[]>([]);
  const [chatLeaders, setChatLeaders]       = useState<ChatLeader[]>([]);
  const [playerDocIds, setPlayerDocIds]     = useState<Record<string, string>>({});
  const [loading, setLoading]               = useState(true);

  const announcements: Announcement[] = [];

  useEffect(() => {
    let resolved = 0;
    const total = 4;
    const maybeReady = () => { resolved++; if (resolved >= total) setLoading(false); };

    const unsubTeams = onSnapshot(
      query(collection(db, "teams"), orderBy("createdAt", "asc")),
      (snap) => {
        setTeams(
          snap.docs.map((d) => ({
            id: d.id,
            name: d.data().name ?? "",
            game: d.data().game ?? "",
            head: d.data().head ?? "",
            headUid: d.data().headUid ?? undefined,
            players: d.data().players ?? [],
            pendingPlayers: d.data().pendingPlayers ?? [],
            status: d.data().status ?? "incomplete",
          }))
        );
        maybeReady();
      },
      (err) => { console.error("teams snapshot error:", err); maybeReady(); }
    );

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
            tournamentName: d.data().tournamentName ?? undefined,
          }))
        );
        maybeReady();
      },
      (err) => { console.error("matches snapshot error:", err); maybeReady(); }
    );

    const unsubPlayers = onSnapshot(
      query(collection(db, "players"), orderBy("createdAt", "asc")),
      (snap) => {
        const allPlayers: Player[] = [];
        const idMap: Record<string, string> = {};

        snap.docs.forEach((d) => {
          const p: Player = {
            id: d.id,
            name: d.data().name ?? "",
            email: d.data().email ?? "",
            ign: d.data().ign ?? "",
            game: d.data().game ?? "",
            role: d.data().role ?? "",
            rank: d.data().rank ?? "",
            winRate: d.data().winRate ?? "0%",
            kda: d.data().kda ?? "0",
            history: d.data().history ?? [],
            team: d.data().team ?? undefined,
            drafted: d.data().drafted ?? false,
            pendingTeam: d.data().pendingTeam ?? undefined,
          };
          allPlayers.push(p);
          idMap[p.ign] = d.id;
        });

        setAllPlayers(allPlayers);
        setFreeAgents(allPlayers.filter((p) => !p.drafted && !p.pendingTeam));
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
        allPlayers,
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