"use client";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/shared/sidebar";
import StatCard from "@/components/shared/stat-card";
import PageHeader from "@/components/shared/page-header";
import DashboardHeader from "@/components/shared/dashboard-header";
import TeamManagementModule from "@/modules/team-management";
import TournamentManagementModule from "@/modules/tournament-management";
import BracketManagementModule from "@/modules/bracket-management";
import CalendarManagementModule from "@/modules/calendar-management";
import OverviewManagementModule from "@/modules/overview-management";
import AnnouncementManagementModule from "@/modules/announcement-management";
import ChatManagementModule from "@/modules/chat-management";
import DraftManagementModule from "@/modules/draft-management";
import FreeAgentManagementModule from "@/modules/free-agent-management";
import ResultsManagementModule from "@/modules/results-management";
import { matches } from "@/data/matches";
import { IconPlus, IconEdit, IconX, IconSearch, IconCheck } from "@/components/shared/icons";

interface Team {
  id: string;
  name: string;
  game: string;
  head: string;
  players: string[];
  status: string;
}

interface Tournament {
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

interface Match {
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

interface Player {
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

export default function OrganizerDashboard() {
  const [section, setSection] = useState("overview");

  const [teams, setTeams] = useState<Team[]>([
    { id: "t1", name: "Team Blaze", game: "MLBB", head: "Marco Reyes", players: ["Marco Reyes", "John Dela Cruz", "Liza Santos", "Kevin Bautista"], status: "active" },
    { id: "t2", name: "Team Storm", game: "MLBB", head: "Rico Cruz", players: ["Rico Cruz", "Alice Wang", "Bob Miller"], status: "active" },
    { id: "t3", name: "Team Frost", game: "MLBB", head: "Leo Tan", players: ["Leo Tan", "Sarah Jenkins"], status: "active" },
    { id: "t4", name: "Team Venom", game: "MLBB", head: "Jake Uy", players: ["Jake Uy"], status: "incomplete" },
    { id: "t5", name: "Team Nova", game: "MLBB", head: "Nico Lim", players: ["Nico Lim"], status: "active" },
    { id: "t6", name: "Team Apex", game: "MLBB", head: "Bea Santos", players: ["Bea Santos"], status: "active" },
  ]);

  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: "tr1",
      name: "MLBB Championship",
      game: "MLBB",
      format: "Single Elimination",
      season: 4,
      teamsRegistered: 8,
      maxTeams: 8,
      matchesPlayed: 2,
      totalMatches: 7,
      status: "ongoing",
      teamsList: [
        { name: "Team Blaze", players: 4 },
        { name: "Team Storm", players: 3 },
        { name: "Team Frost", players: 2 },
        { name: "Team Venom", players: 1 },
        { name: "Team Nova", players: 1 },
        { name: "Team Apex", players: 1 },
        { name: "Team Forge", players: 4 },
        { name: "Team Rush", players: 4 },
      ],
      matchesList: ["qf1", "qf2", "qf3", "qf4", "sf1", "sf2", "f1"],
    },
    {
      id: "tr2",
      name: "CODM Clash",
      game: "CODM",
      format: "Single Elimination",
      season: 1,
      teamsRegistered: 4,
      maxTeams: 8,
      matchesPlayed: 0,
      totalMatches: 7,
      status: "registration",
      teamsList: [
        { name: "Team Frost", players: 2 },
        { name: "Team Venom", players: 1 },
      ],
      matchesList: [],
    },
  ]);

  const [matchesState, setMatchesState] = useState<Match[]>([
    { id: "qf1", round: "Quarterfinals", teamA: "Team Blaze", teamB: "Team Storm", winner: "Team Blaze", scoreA: 2, scoreB: 0, date: "2026-06-07", time: "2:00 PM", status: "completed" },
    { id: "qf2", round: "Quarterfinals", teamA: "Team Frost", teamB: "Team Venom", winner: "Team Frost", scoreA: 2, scoreB: 1, date: "2026-06-07", time: "4:00 PM", status: "completed" },
    { id: "qf3", round: "Quarterfinals", teamA: "Team Nova", teamB: "Team Apex", winner: "", scoreA: 0, scoreB: 0, date: "2026-06-14", time: "2:00 PM", status: "pending" },
    { id: "qf4", round: "Quarterfinals", teamA: "Team Forge", teamB: "Team Rush", winner: "", scoreA: 0, scoreB: 0, date: "2026-06-14", time: "4:00 PM", status: "pending" },
    { id: "sf1", round: "Semifinals", teamA: "Team Blaze", teamB: "Team Frost", winner: "", scoreA: 0, scoreB: 0, date: "2026-06-21", time: "2:00 PM", status: "pending" },
    { id: "sf2", round: "Semifinals", teamA: "TBD", teamB: "TBD", winner: "", scoreA: 0, scoreB: 0, date: "2026-06-21", time: "4:00 PM", status: "pending" },
    { id: "f1", round: "Finals", teamA: "TBD", teamB: "TBD", winner: "", scoreA: 0, scoreB: 0, date: "2026-06-28", time: "3:00 PM", status: "pending" },
  ]);

  const [freeAgents, setFreeAgents] = useState<Player[]>([
    { name: "Ana Lim", ign: "AnaLim_PH", game: "MLBB", role: "Mid Lane", rank: "Mythic", winRate: "64%", kda: "4.2", history: ["Win", "Win", "Win", "Loss", "Win"] },
    { name: "Ben Torres", ign: "BenT_MLBB", game: "MLBB", role: "Jungler", rank: "Mythic", winRate: "57%", kda: "3.5", history: ["Win", "Loss", "Win", "Win", "Loss"] },
    { name: "Claire Ong", ign: "ClaireOng", game: "CODM", role: "Supports", rank: "Elite", winRate: "69%", kda: "5.1", history: ["Win", "Win", "Win", "Loss", "Win"] },
    { name: "Dan Perez", ign: "DanP_COD", game: "CODM", role: "Objective", rank: "Pro", winRate: "55%", kda: "3.2", history: ["Loss", "Win", "Loss", "Win", "Win"] },
    { name: "Michael Chang", ign: "MikeC_Mid", game: "MLBB", role: "Mid Lane", rank: "Mythic", winRate: "60%", kda: "4.0", history: ["Win", "Loss", "Win", "Loss", "Win"] },
    { name: "Sarah Connor", ign: "SarahC_XP", game: "MLBB", role: "XP Lane", rank: "Legend", winRate: "58%", kda: "3.9", history: ["Loss", "Loss", "Win", "Win", "Win"] },
    { name: "David Kim", ign: "DaveK_Roam", game: "MLBB", role: "Roamer", rank: "Mythic", winRate: "61%", kda: "4.6", history: ["Win", "Win", "Loss", "Win", "Win"] },
  ]);

  const [draftedPlayers, setDraftedPlayers] = useState<Player[]>([
    { name: "Carlos Mendez", ign: "CarM_XP", game: "MLBB", role: "XP Lane", rank: "Mythic", winRate: "62%", kda: "3.8", history: ["Win", "Loss", "Win", "Win", "Win"], team: "Team Frost" },
    { name: "Sophia Lopez", ign: "SophL_Support", game: "MLBB", role: "Roamer", rank: "Legend", winRate: "58%", kda: "4.5", history: ["Win", "Win", "Loss", "Win", "Loss"], team: "Team Blaze" },
  ]);

  const [calendarEvents, setCalendarEvents] = useState([
    { id: "ce1", title: "QF Match Day 1", date: "2026-06-14", time: "2:00 PM", status: "approved" },
    { id: "ce2", title: "QF Match Day 2", date: "2026-06-15", time: "2:00 PM", status: "approved" },
    { id: "ce3", title: "Semifinals", date: "2026-06-21", time: "2:00 PM", status: "approved" },
    { id: "ce4", title: "Finals", date: "2026-06-28", time: "3:00 PM", status: "approved" },
  ]);

  const [announcements, setAnnouncements] = useState([
    { id: "a1", title: "Roster Registration Open", content: "Submit team slots for season 4", submittedAt: "2026-06-01", status: "published" },
    { id: "a2", title: "Draft Pools Finalized", content: "Free agent selection starts June 20", submittedAt: "2026-06-05", status: "pending" },
  ]);

  const [chatLeaders, setChatLeaders] = useState([
    { name: "Marco Reyes", team: "Team Blaze", unread: 1, history: [{ sender: "Marco Reyes", text: "Coach, are the final rosters confirmed yet?", time: "09:30 AM" }] },
    { name: "Bea Santos", team: "Team Apex", unread: 0, history: [{ sender: "Bea Santos", text: "Ready for our QF match next week.", time: "Yesterday" }] },
  ]);

  const [resultsNotification, setResultsNotification] = useState<{ message: string; sub: string } | null>(null);

  const [selectedMatchId, setSelectedMatchId] = useState("qf3");
  const [matchWinner, setMatchWinner] = useState("Team Apex");
  const [scoreA, setScoreA] = useState(2);
  const [scoreB, setScoreB] = useState(0);


  const [calTitle, setCalTitle] = useState("");
  const [calDate, setCalDate] = useState("");
  const [calTime, setCalTime] = useState("");
  const [calError, setCalError] = useState("");
  const [calSuccess, setCalSuccess] = useState(false);

  const handleCalendarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calTitle || !calDate || !calTime) return;

    const today = new Date("2026-06-18");
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(calDate);

    if (inputDate < today) {
      setCalError("Error: Events cannot be scheduled in the past (e.g. June 9 1991). Date is invalidated.");
      setCalSuccess(false);
      return;
    }

    setCalError("");
    const newEv = {
      id: `ce-${Date.now()}`,
      title: calTitle,
      date: calDate,
      time: calTime,
      status: "pending",
    };
    setCalendarEvents((prev) => [...prev, newEv]);
    setCalTitle("");
    setCalDate("");
    setCalTime("");
    setCalSuccess(true);
    setTimeout(() => setCalSuccess(false), 3000);
  };

  const [newTourneyName, setNewTourneyName] = useState("");
  const [newTourneyGame, setNewTourneyGame] = useState("MLBB");
  const [newTourneyFormat, setNewTourneyFormat] = useState("Single Elimination");
  const [newTourneyMaxTeams, setNewTourneyMaxTeams] = useState(8);

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourneyName) return;

    const newT: Tournament = {
      id: `tr-${Date.now()}`,
      name: newTourneyName,
      game: newTourneyGame,
      format: newTourneyFormat,
      season: 1,
      teamsRegistered: 0,
      maxTeams: newTourneyMaxTeams,
      matchesPlayed: 0,
      totalMatches: newTourneyMaxTeams - 1,
      status: "registration",
      teamsList: [],
      matchesList: [],
    };
    setTournaments((prev) => [...prev, newT]);
    setNewTourneyName("");
  };

  const [tourneyModalType, setTourneyModalType] = useState<"none" | "view" | "edit">("none");
  const [selectedTourney, setSelectedTourney] = useState<Tournament | null>(null);

  const [editTourneyName, setEditTourneyName] = useState("");
  const [editTourneyGame, setEditTourneyGame] = useState("");
  const [editTourneyFormat, setEditTourneyFormat] = useState("");
  const [editTourneyStatus, setEditTourneyStatus] = useState("");

  const openTourneyModal = (t: Tournament, type: "view" | "edit") => {
    setSelectedTourney(t);
    setTourneyModalType(type);
    if (type === "edit") {
      setEditTourneyName(t.name);
      setEditTourneyGame(t.game);
      setEditTourneyFormat(t.format);
      setEditTourneyStatus(t.status);
    }
  };

  const handleSaveTourneyDetails = () => {
    if (!selectedTourney) return;
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === selectedTourney.id) {
          return {
            ...t,
            name: editTourneyName,
            game: editTourneyGame,
            format: editTourneyFormat,
            status: editTourneyStatus,
          };
        }
        return t;
      })
    );
    setTourneyModalType("none");
    setSelectedTourney(null);
  };

  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamGame, setNewTeamGame] = useState("MLBB");
  const [newTeamHead, setNewTeamHead] = useState("");

  const [teamModalType, setTeamModalType] = useState<"none" | "view" | "edit">("none");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamHead, setEditTeamHead] = useState("");
  const [editTeamStatus, setEditTeamStatus] = useState("");
  const [editTeamPlayers, setEditTeamPlayers] = useState("");

  // Announcement form state
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [annSuccess, setAnnSuccess] = useState(false);

  const [freeAgentSearch, setFreeAgentSearch] = useState("");
  const [newFaName, setNewFaName] = useState("");
  const [newFaIgn, setNewFaIgn] = useState("");
  const [newFaGame, setNewFaGame] = useState("MLBB");
  const [newFaRole, setNewFaRole] = useState("Mid Lane");
  const [newFaRank, setNewFaRank] = useState("Mythic");
  const [newFaWinRate, setNewFaWinRate] = useState("60%");
  const [newFaKda, setNewFaKda] = useState("4.0");

  const handleCreateFreeAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaName || !newFaIgn) return;
    const newFa: Player = {
      name: newFaName,
      ign: newFaIgn,
      game: newFaGame,
      role: newFaRole,
      rank: newFaRank,
      winRate: newFaWinRate,
      kda: newFaKda,
      history: ["Win", "Win", "Loss", "Win", "Loss"],
    };
    setFreeAgents((prev) => [...prev, newFa]);
    setNewFaName("");
    setNewFaIgn("");
  };

  const renderSection = () => {
    switch (section) {
      case "overview":
        return <OverviewManagementModule
          tournaments={tournaments}
          teams={teams}
          draftedPlayers={draftedPlayers}
          matchesState={matchesState}
          announcements={announcements}
        />;

      case "chat":
        return <ChatManagementModule
          chatLeaders={chatLeaders}
          setChatLeaders={setChatLeaders}
        />;

      case "teams":
        return <TeamManagementModule
          teams={teams}
          setTeams={setTeams}

          newTeamName={newTeamName}
          setNewTeamName={setNewTeamName}
          newTeamGame={newTeamGame}
          setNewTeamGame={setNewTeamGame}
          newTeamHead={newTeamHead}
          setNewTeamHead={setNewTeamHead}

          teamModalType={teamModalType}
          setTeamModalType={setTeamModalType}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}

          editTeamName={editTeamName}
          setEditTeamName={setEditTeamName}
          editTeamHead={editTeamHead}
          setEditTeamHead={setEditTeamHead}
          editTeamStatus={editTeamStatus}
          setEditTeamStatus={setEditTeamStatus}
          editTeamPlayers={editTeamPlayers}
          setEditTeamPlayers={setEditTeamPlayers}
        />;

      case "draft":
        return <DraftManagementModule
          freeAgents={freeAgents}
          setFreeAgents={setFreeAgents}
          draftedPlayers={draftedPlayers}
          setDraftedPlayers={setDraftedPlayers}
          teams={teams}
          setTeams={setTeams}
        />;

      case "free_agents":
        return <FreeAgentManagementModule
          freeAgents={freeAgents}
          setFreeAgents={setFreeAgents}

          newFaName={newFaName}
          setNewFaName={setNewFaName}
          newFaIgn={newFaIgn}
          setNewFaIgn={setNewFaIgn}
          newFaGame={newFaGame}
          setNewFaGame={setNewFaGame}
          newFaRole={newFaRole}
          setNewFaRole={setNewFaRole}
          newFaRank={newFaRank}
          setNewFaRank={setNewFaRank}
          newFaWinRate={newFaWinRate}
          setNewFaWinRate={setNewFaWinRate}
          newFaKda={newFaKda}
          setNewFaKda={setNewFaKda}

          freeAgentSearch={freeAgentSearch}
          setFreeAgentSearch={setFreeAgentSearch}

          handleCreateFreeAgent={handleCreateFreeAgent}
        />;

      case "tournaments":
        return <TournamentManagementModule tournaments={tournaments} setTournaments={setTournaments} />;

      case "brackets":
        return (
          <BracketManagementModule
            tournaments={tournaments}
            setTournaments={setTournaments}
            matchesState={matchesState}
            setMatchesState={setMatchesState}
          />
        );

      case "results":
        return <ResultsManagementModule
          matchesState={matchesState}
          setMatchesState={setMatchesState}
          tournaments={tournaments}
          setTournaments={setTournaments}
          selectedMatchId={selectedMatchId}
          setSelectedMatchId={setSelectedMatchId}
          matchWinner={matchWinner}
          setMatchWinner={setMatchWinner}
          scoreA={scoreA}
          setScoreA={setScoreA}
          scoreB={scoreB}
          setScoreB={setScoreB}
          resultsNotification={resultsNotification}
          setResultsNotification={setResultsNotification}
        />;

      case "standings":
        const standingsList = [
          { rank: 1, name: "Team Blaze", w: 5, l: 0, pts: 15, streak: "5W" },
          { rank: 2, name: "Team Frost", w: 4, l: 1, pts: 12, streak: "3W" },
          { rank: 3, name: "Team Storm", w: 2, l: 3, pts: 6, streak: "2L" },
          { rank: 4, name: "Team Apex", w: 2, l: 3, pts: 6, streak: "1W" },
          { rank: 5, name: "Team Forge", w: 1, l: 4, pts: 3, streak: "2L" },
          { rank: 6, name: "Team Venom", w: 1, l: 4, pts: 3, streak: "3L" },
        ];

        return (
          <div className="dash-table-wrap">
            <table className="w-full border-collapse">
              <thead className="dash-thead">
                <tr>
                  {["Rank", "Team", "Wins", "Losses", "Points", "Streak"].map((h) => (
                    <th key={h} className="dash-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standingsList.map((s) => (
                  <tr key={s.rank} className="dash-tr">
                    <td className="dash-td font-bold">{s.rank}</td>
                    <td className="dash-td font-semibold text-[var(--c-text)]">{s.name}</td>
                    <td className="dash-td">{s.w}</td>
                    <td className="dash-td">{s.l}</td>
                    <td className="dash-td font-bold text-[#00F5D4]">{s.pts}</td>
                    <td className="dash-td">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          s.streak.includes("W") ? "bg-[#00F5D4]/10 text-[#00F5D4]" : "bg-[#FF4655]/10 text-[#FF4655]"
                        }`}
                      >
                        {s.streak}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "stats":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Tournament MVP Leader", value: "Marco Reyes" },
                { label: "KDA Leader", value: "Claire Ong (5.1)" },
                { label: "Average Game Length", value: "14m 32s" },
              ].map((s, i) => (
                <div key={i} className="dash-card p-5">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--c-text-muted)]">{s.label}</div>
                  <div className="font-head text-2xl font-bold text-[var(--c-text)] mt-1">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="dash-card p-5">
              <div className="dash-section-title">Player Leaderboard Stats</div>
              <div className="dash-table-wrap">
                <table className="w-full border-collapse">
                  <thead className="dash-thead">
                    <tr>
                      {["Player", "IGN", "KDA Ratio", "Win Rate", "Skill Rating"].map((h) => (
                        <th key={h} className="dash-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Marco Reyes", ign: "MarcoRey_MLBB", kda: "4.8", wr: "65%", rating: "1850" },
                      { name: "Claire Ong", ign: "ClaireOng", kda: "5.1", wr: "69%", rating: "1920" },
                      { name: "Ana Lim", ign: "AnaLim_PH", kda: "4.2", wr: "64%", rating: "1780" },
                      { name: "Sophia Lopez", ign: "SophL_Support", kda: "4.5", wr: "58%", rating: "1720" },
                    ].map((p, idx) => (
                      <tr key={idx} className="dash-tr">
                        <td className="dash-td font-semibold">{p.name}</td>
                        <td className="dash-td-muted">{p.ign}</td>
                        <td className="dash-td font-bold text-purple-300">{p.kda}</td>
                        <td className="dash-td text-[#00F5D4]">{p.wr}</td>
                        <td className="dash-td font-bold text-[var(--c-text)]">{p.rating} MMR</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "announcements":
        return <AnnouncementManagementModule
          announcements={announcements}
          setAnnouncements={setAnnouncements}

          newAnnTitle={newAnnTitle}
          setNewAnnTitle={setNewAnnTitle}
          newAnnContent={newAnnContent}
          setNewAnnContent={setNewAnnContent}

          annSuccess={annSuccess}
          setAnnSuccess={setAnnSuccess}
        />;

      case "calendar":
        return (
          <div className="space-y-6">
            <div className="dash-card p-5">
              <div className="dash-section-title">Request New Event</div>
              {calSuccess && (
                <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-2 mb-4">
                  Event request submitted for approval.
                </div>
              )}
              {calError && (
                <div className="bg-[#FF4655]/10 border border-[#FF4655]/30 text-[#FF4655] text-xs rounded-lg px-4 py-2 mb-4">
                  {calError}
                </div>
              )}
              <form onSubmit={handleCalendarSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="dash-label">Event Title</label>
                  <input
                    value={calTitle}
                    onChange={(e) => setCalTitle(e.target.value)}
                    placeholder="e.g. Finals Match"
                    className="dash-input"
                  />
                </div>
                <div>
                  <label className="dash-label">Date</label>
                  <input
                    type="date"
                    value={calDate}
                    onChange={(e) => setCalDate(e.target.value)}
                    className="dash-input"
                  />
                </div>
                <div>
                  <label className="dash-label">Time</label>
                  <input
                    type="time"
                    value={calTime}
                    onChange={(e) => setCalTime(e.target.value)}
                    className="dash-input"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors md:col-span-3"
                >
                  Submit for Approval
                </button>
              </form>
            </div>

            <div className="dash-card p-5">
              <div className="font-head text-sm font-semibold uppercase tracking-wider mb-4 text-[var(--c-text)]">
                Upcoming Requested & Approved Events
              </div>
              <div className="dash-table-wrap">
                <table className="w-full border-collapse">
                  <thead className="dash-thead">
                    <tr>
                      {["Event Title", "Date", "Time", "Status"].map((h) => (
                        <th key={h} className="dash-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calendarEvents.map((e) => (
                      <tr key={e.id} className="dash-tr">
                        <td className="dash-td font-semibold">{e.title}</td>
                        <td className="dash-td-muted">{e.date}</td>
                        <td className="dash-td-muted">{e.time}</td>
                        <td className="dash-td">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                              e.status === "approved" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-[#FF4655]/20 text-[#FF4655]"
                            }`}
                          >
                            {e.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getSectionMeta = () => {
    const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
      overview: { title: "ORGANIZER DASHBOARD", subtitle: "Tournament management overview" },
      chat: { title: "COMMUNICATE WITH LEADERS", subtitle: "Direct chat channel with team captains" },
      teams: { title: "TEAM MANAGEMENT", subtitle: "Create, edit, and assign team details" },
      draft: { title: "DRAFT PLAYERS LOUNGE", subtitle: "Search and filter unpicked free agent pool" },
      free_agents: { title: "MANAGE FREE AGENTS", subtitle: "Add, review, and delete free agent entries" },
      tournaments: { title: "TOURNAMENTS", subtitle: "Create and configure tournament formats" },
      brackets: { title: "PLAYOFF BRACKETS", subtitle: "Advance qualified teams to playoff brackets" },
      results: { title: "MATCH RESULTS RESULTS", subtitle: "Submit completed match scores and advance brackets" },
      standings: { title: "LEAGUE STANDINGS", subtitle: "Monitor current team standings" },
      stats: { title: "GAME STATISTICS", subtitle: "Detailed win-rates, MVPs, and metrics" },
      announcements: { title: "ANNOUNCEMENT MAKER", subtitle: "Submit announcements for admin moderation" },
      calendar: { title: "CALENDAR SCHEDULER", subtitle: "Schedule matches and filter past events" },
    };
    return SECTION_TITLES[section] ?? { title: section.toUpperCase(), subtitle: "" };
  };

  const meta = getSectionMeta();

  return (
    <div className="flex">
      <Sidebar role="organizer" activeSection={section} onSectionChange={setSection} />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader role="organizer" />
        <main
          className="flex-1"
          style={{
            overflowY: "auto",
            padding: "32px",
            backgroundColor: "var(--c-page-bg)",
          }}
        >
          <PageHeader title={meta.title} subtitle={meta.subtitle} />
          {renderSection()}
        </main>
      </div>

      {tourneyModalType !== "none" && selectedTourney && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => {
                setTourneyModalType("none");
                setSelectedTourney(null);
              }}
              className="absolute right-4 top-4 text-[var(--c-text-dim)] hover:text-[var(--c-text)]"
            >
              <IconX size={16} />
            </button>
            <h3 className="font-head text-xl font-bold text-[var(--c-text)] mb-4 uppercase">
              {tourneyModalType === "edit" ? "Edit Tournament Details" : "Tournament Specifications"}
            </h3>

            <div className="space-y-4">
              {tourneyModalType === "edit" ? (
                <>
                  <div>
                    <label className="dash-label">Tournament Name</label>
                    <input
                      value={editTourneyName}
                      onChange={(e) => setEditTourneyName(e.target.value)}
                      className="dash-input"
                    />
                  </div>
                  <div>
                    <label className="dash-label">Game</label>
                    <input
                      value={editTourneyGame}
                      onChange={(e) => setEditTourneyGame(e.target.value)}
                      className="dash-input"
                    />
                  </div>
                  <div>
                    <label className="dash-label">Format</label>
                    <input
                      value={editTourneyFormat}
                      onChange={(e) => setEditTourneyFormat(e.target.value)}
                      className="dash-input"
                    />
                  </div>
                  <div>
                    <label className="dash-label">Status</label>
                    <select
                      value={editTourneyStatus}
                      onChange={(e) => setEditTourneyStatus(e.target.value)}
                      className="dash-select"
                    >
                      <option value="registration">registration</option>
                      <option value="ongoing">ongoing</option>
                      <option value="completed">completed</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Name</span>
                    <span className="font-bold text-[var(--c-text)]">{selectedTourney.name}</span>
                  </div>
                  <div>
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Game</span>
                    <span className="font-bold text-[var(--c-text)]">{selectedTourney.game}</span>
                  </div>
                  <div>
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Format</span>
                    <span className="font-bold text-[var(--c-text)]">{selectedTourney.format}</span>
                  </div>
                  <div>
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Status</span>
                    <span className="font-bold text-[var(--c-text)]">{selectedTourney.status}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px] mb-1">
                      Teams List & Players
                    </span>
                    <div className="space-y-1 bg-[var(--c-surface2)] p-2.5 rounded border border-[var(--c-border)] max-h-24 overflow-y-auto">
                      {selectedTourney.teamsList.map((tm, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-[var(--c-text)]">
                          <span>{tm.name}</span>
                          <span className="text-[var(--c-text-muted)]">{tm.players} players</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px] mb-1">
                      Matches List
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedTourney.matchesList.length > 0 ? (
                        selectedTourney.matchesList.map((mid) => (
                          <span key={mid} className="bg-[var(--c-surface3)] border border-[var(--c-border)] px-2 py-0.5 rounded text-[10px] text-[var(--c-text)]">
                            {mid}
                          </span>
                        ))
                      ) : (
                        <span className="text-[var(--c-text-muted)]">No matches generated yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {tourneyModalType === "edit" ? (
                <>
                  <button
                    onClick={handleSaveTourneyDetails}
                    className="bg-[#00F5D4] hover:bg-[#00d8bc] text-black text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setTourneyModalType("none");
                      setSelectedTourney(null);
                    }}
                    className="dash-btn-ghost text-xs px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setTourneyModalType("none");
                    setSelectedTourney(null);
                  }}
                  className="bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
