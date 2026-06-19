/**
 * seed-organizer-data.mjs
 *
 * One-time script to seed the Firestore collections used by OrganizerContext:
 *   - teams
 *   - tournaments
 *   - matches
 *   - players
 *
 * Run BEFORE deploying strict Firestore rules:
 *   node seed-organizer-data.mjs
 *
 * Requires: NEXT_PUBLIC_FIREBASE_* env vars in .env.local (auto-loaded via dotenv)
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { readFileSync } from "fs";

// Load .env.local
const envContent = readFileSync(".env.local", "utf-8");
const env = Object.fromEntries(
  envContent.split("\n")
    .filter((l) => l.includes("="))
    .map((l) => { const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim()]; })
);

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const ts = () => ({ createdAt: serverTimestamp() });

async function seed() {
  console.log("Seeding teams...");
  const teams = [
    { name: "Team Blaze", game: "MLBB", head: "Marco Reyes",  players: ["Marco Reyes", "John Dela Cruz", "Liza Santos", "Kevin Bautista"], status: "active" },
    { name: "Team Storm", game: "MLBB", head: "Rico Cruz",    players: ["Rico Cruz", "Alice Wang", "Bob Miller"],                          status: "active" },
    { name: "Team Frost", game: "MLBB", head: "Leo Tan",      players: ["Leo Tan", "Sarah Jenkins"],                                       status: "active" },
    { name: "Team Venom", game: "MLBB", head: "Jake Uy",      players: ["Jake Uy"],                                                         status: "incomplete" },
    { name: "Team Nova",  game: "MLBB", head: "Nico Lim",     players: ["Nico Lim"],                                                        status: "active" },
    { name: "Team Apex",  game: "MLBB", head: "Bea Santos",   players: ["Bea Santos"],                                                      status: "active" },
  ];
  const teamRefs = await Promise.all(teams.map((t) => addDoc(collection(db, "teams"), { ...t, ...ts() })));
  console.log(`  ✓ ${teamRefs.length} teams`);

  console.log("Seeding tournaments...");
  const tournaments = [
    {
      name: "MLBB Championship", game: "MLBB", format: "Single Elimination", season: 4,
      teamsRegistered: 8, maxTeams: 8, matchesPlayed: 2, totalMatches: 7, status: "ongoing",
      teamsList: [
        { name: "Team Blaze", players: 4 }, { name: "Team Storm", players: 3 },
        { name: "Team Frost", players: 2 }, { name: "Team Venom", players: 1 },
        { name: "Team Nova",  players: 1 }, { name: "Team Apex",  players: 1 },
        { name: "Team Forge", players: 4 }, { name: "Team Rush",  players: 4 },
      ],
      matchesList: [], // will be filled after matches are seeded
    },
    {
      name: "CODM Clash", game: "CODM", format: "Single Elimination", season: 1,
      teamsRegistered: 4, maxTeams: 8, matchesPlayed: 0, totalMatches: 7, status: "registration",
      teamsList: [{ name: "Team Frost", players: 2 }, { name: "Team Venom", players: 1 }],
      matchesList: [],
    },
  ];
  const tourneyRefs = await Promise.all(tournaments.map((t) => addDoc(collection(db, "tournaments"), { ...t, ...ts() })));
  console.log(`  ✓ ${tourneyRefs.length} tournaments`);

  console.log("Seeding matches...");
  const today = new Date().toISOString().split("T")[0];
  const matches = [
    { round: "Quarterfinals", teamA: "Team Blaze", teamB: "Team Storm", winner: "Team Blaze", scoreA: 2, scoreB: 0, date: "2026-06-07", time: "2:00 PM", status: "completed", tournamentId: tourneyRefs[0].id },
    { round: "Quarterfinals", teamA: "Team Frost", teamB: "Team Venom", winner: "Team Frost", scoreA: 2, scoreB: 1, date: "2026-06-07", time: "4:00 PM", status: "completed", tournamentId: tourneyRefs[0].id },
    { round: "Quarterfinals", teamA: "Team Nova",  teamB: "Team Apex",  winner: "",           scoreA: 0, scoreB: 0, date: "2026-06-14", time: "2:00 PM", status: "pending",   tournamentId: tourneyRefs[0].id },
    { round: "Quarterfinals", teamA: "Team Forge", teamB: "Team Rush",  winner: "",           scoreA: 0, scoreB: 0, date: "2026-06-14", time: "4:00 PM", status: "pending",   tournamentId: tourneyRefs[0].id },
    { round: "Semifinals",    teamA: "Team Blaze", teamB: "Team Frost", winner: "",           scoreA: 0, scoreB: 0, date: "2026-06-21", time: "2:00 PM", status: "pending",   tournamentId: tourneyRefs[0].id },
    { round: "Semifinals",    teamA: "TBD",        teamB: "TBD",        winner: "",           scoreA: 0, scoreB: 0, date: "2026-06-21", time: "4:00 PM", status: "pending",   tournamentId: tourneyRefs[0].id },
    { round: "Finals",        teamA: "TBD",        teamB: "TBD",        winner: "",           scoreA: 0, scoreB: 0, date: "2026-06-28", time: "3:00 PM", status: "pending",   tournamentId: tourneyRefs[0].id },
  ];
  const matchRefs = await Promise.all(matches.map((m) => addDoc(collection(db, "matches"), { ...m, ...ts() })));
  console.log(`  ✓ ${matchRefs.length} matches`);

  console.log("Seeding players...");
  const players = [
    { name: "Ana Lim",       ign: "AnaLim_PH",     game: "MLBB", role: "Mid Lane",  rank: "Mythic", winRate: "64%", kda: "4.2", history: ["Win","Win","Win","Loss","Win"],  drafted: false },
    { name: "Ben Torres",    ign: "BenT_MLBB",     game: "MLBB", role: "Jungler",   rank: "Mythic", winRate: "57%", kda: "3.5", history: ["Win","Loss","Win","Win","Loss"], drafted: false },
    { name: "Claire Ong",    ign: "ClaireOng",     game: "CODM", role: "Supports",  rank: "Elite",  winRate: "69%", kda: "5.1", history: ["Win","Win","Win","Loss","Win"],  drafted: false },
    { name: "Dan Perez",     ign: "DanP_COD",      game: "CODM", role: "Objective", rank: "Pro",    winRate: "55%", kda: "3.2", history: ["Loss","Win","Loss","Win","Win"], drafted: false },
    { name: "Michael Chang", ign: "MikeC_Mid",     game: "MLBB", role: "Mid Lane",  rank: "Mythic", winRate: "60%", kda: "4.0", history: ["Win","Loss","Win","Loss","Win"], drafted: false },
    { name: "Sarah Connor",  ign: "SarahC_XP",     game: "MLBB", role: "XP Lane",   rank: "Legend", winRate: "58%", kda: "3.9", history: ["Loss","Loss","Win","Win","Win"], drafted: false },
    { name: "David Kim",     ign: "DaveK_Roam",    game: "MLBB", role: "Roamer",    rank: "Mythic", winRate: "61%", kda: "4.6", history: ["Win","Win","Loss","Win","Win"],  drafted: false },
    { name: "Carlos Mendez", ign: "CarM_XP",       game: "MLBB", role: "XP Lane",   rank: "Mythic", winRate: "62%", kda: "3.8", history: ["Win","Loss","Win","Win","Win"],  drafted: true, team: "Team Frost" },
    { name: "Sophia Lopez",  ign: "SophL_Support", game: "MLBB", role: "Roamer",    rank: "Legend", winRate: "58%", kda: "4.5", history: ["Win","Win","Loss","Win","Loss"], drafted: true, team: "Team Blaze" },
  ];
  const playerRefs = await Promise.all(players.map((p) => addDoc(collection(db, "players"), { ...p, ...ts() })));
  console.log(`  ✓ ${playerRefs.length} players`);

  console.log("\n✅ Seed complete!");
  console.log("Note: matchesList on tournaments is empty — use the bracket-management module to generate brackets,");
  console.log("or manually update the tournaments docs with the match IDs printed above.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
