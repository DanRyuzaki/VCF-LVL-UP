"use client";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/shared/sidebar";
import StatCard from "@/components/shared/stat-card";
import PageHeader from "@/components/shared/page-header";
import DashboardHeader from "@/components/shared/dashboard-header";
import TeamManagementModule from "@/modules/team-management";
import TournamentManagementModule from "@/modules/tournament-management";
import BracketManagementModule from "@/modules/bracket-management";
import AnnouncementManagementModule from "@/modules/announcement-management";
import CalendarManagementModule from "@/modules/calendar-management";
import { matches } from "@/data/matches";

function OverviewSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value="2" label="Active Tournaments" accent="red" />
        <StatCard value="8" label="Teams Registered" accent="teal" />
        <StatCard value="42" label="Drafted Players" accent="purple" />
        <StatCard value="6" label="Matches Upcoming" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dash-card p-5">
          <div className="dash-section-title">Pending Submissions</div>
          {[
            { label: "Draft Announcement", badge: "Pending", badgeStyle: "bg-[#FF4655]/20 text-[#FF4655]" },
            { label: "Match Schedule — Jun 14", badge: "Pending", badgeStyle: "bg-[#FF4655]/20 text-[#FF4655]" },
            { label: "CODM Clash Details", badge: "Submitted", badgeStyle: "" },
          ].map((item) => (
            <div key={item.label} className="dash-row-item">
              <span className="text-sm" style={{ color: "var(--c-text)" }}>{item.label}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${item.badgeStyle}`} style={!item.badgeStyle ? { backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" } : {}}>{item.badge}</span>
            </div>
          ))}
        </div>
        import {IconPlus, IconEdit, IconX, IconSearch, IconCheck} from "@/components/shared/icons";

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
        teamsList: {name: string; players: number }[];
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
        {id: "t1", name: "Team Blaze", game: "MLBB", head: "Marco Reyes", players: ["Marco Reyes", "John Dela Cruz", "Liza Santos", "Kevin Bautista"], status: "active" },
        {id: "t2", name: "Team Storm", game: "MLBB", head: "Rico Cruz", players: ["Rico Cruz", "Alice Wang", "Bob Miller"], status: "active" },
        {id: "t3", name: "Team Frost", game: "MLBB", head: "Leo Tan", players: ["Leo Tan", "Sarah Jenkins"], status: "active" },
        {id: "t4", name: "Team Venom", game: "MLBB", head: "Jake Uy", players: ["Jake Uy"], status: "incomplete" },
        {id: "t5", name: "Team Nova", game: "MLBB", head: "Nico Lim", players: ["Nico Lim"], status: "active" },
        {id: "t6", name: "Team Apex", game: "MLBB", head: "Bea Santos", players: ["Bea Santos"], status: "active" },
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
        {name: "Team Blaze", players: 4 },
        {name: "Team Storm", players: 3 },
        {name: "Team Frost", players: 2 },
        {name: "Team Venom", players: 1 },
        {name: "Team Nova", players: 1 },
        {name: "Team Apex", players: 1 },
        {name: "Team Forge", players: 4 },
        {name: "Team Rush", players: 4 },
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
        {name: "Team Frost", players: 2 },
        {name: "Team Venom", players: 1 },
        ],
        matchesList: [],
    },
        ]);

        const [matchesState, setMatchesState] = useState<Match[]>([
        {id: "qf1", round: "Quarterfinals", teamA: "Team Blaze", teamB: "Team Storm", winner: "Team Blaze", scoreA: 2, scoreB: 0, date: "2026-06-07", time: "2:00 PM", status: "completed" },
        {id: "qf2", round: "Quarterfinals", teamA: "Team Frost", teamB: "Team Venom", winner: "Team Frost", scoreA: 2, scoreB: 1, date: "2026-06-07", time: "4:00 PM", status: "completed" },
        {id: "qf3", round: "Quarterfinals", teamA: "Team Nova", teamB: "Team Apex", winner: "", scoreA: 0, scoreB: 0, date: "2026-06-14", time: "2:00 PM", status: "pending" },
        {id: "qf4", round: "Quarterfinals", teamA: "Team Forge", teamB: "Team Rush", winner: "", scoreA: 0, scoreB: 0, date: "2026-06-14", time: "4:00 PM", status: "pending" },
        {id: "sf1", round: "Semifinals", teamA: "Team Blaze", teamB: "Team Frost", winner: "", scoreA: 0, scoreB: 0, date: "2026-06-21", time: "2:00 PM", status: "pending" },
        {id: "sf2", round: "Semifinals", teamA: "TBD", teamB: "TBD", winner: "", scoreA: 0, scoreB: 0, date: "2026-06-21", time: "4:00 PM", status: "pending" },
        {id: "f1", round: "Finals", teamA: "TBD", teamB: "TBD", winner: "", scoreA: 0, scoreB: 0, date: "2026-06-28", time: "3:00 PM", status: "pending" },
        ]);

        const [freeAgents, setFreeAgents] = useState<Player[]>([
        {name: "Ana Lim", ign: "AnaLim_PH", game: "MLBB", role: "Mid Lane", rank: "Mythic", winRate: "64%", kda: "4.2", history: ["Win", "Win", "Win", "Loss", "Win"] },
        {name: "Ben Torres", ign: "BenT_MLBB", game: "MLBB", role: "Jungler", rank: "Mythic", winRate: "57%", kda: "3.5", history: ["Win", "Loss", "Win", "Win", "Loss"] },
        {name: "Claire Ong", ign: "ClaireOng", game: "CODM", role: "Gold Lane", rank: "Mythical Glory", winRate: "69%", kda: "5.1", history: ["Win", "Win", "Win", "Loss", "Win"] },
        {name: "Dan Perez", ign: "DanP_COD", game: "CODM", role: "Roamer", rank: "Legend", winRate: "55%", kda: "3.2", history: ["Loss", "Win", "Loss", "Win", "Win"] },
        {name: "Michael Chang", ign: "MikeC_Mid", game: "MLBB", role: "Mid Lane", rank: "Mythic", winRate: "60%", kda: "4.0", history: ["Win", "Loss", "Win", "Loss", "Win"] },
        {name: "Sarah Connor", ign: "SarahC_XP", game: "MLBB", role: "XP Lane", rank: "Legend", winRate: "58%", kda: "3.9", history: ["Loss", "Loss", "Win", "Win", "Win"] },
        {name: "David Kim", ign: "DaveK_Roam", game: "MLBB", role: "Roamer", rank: "Mythic", winRate: "61%", kda: "4.6", history: ["Win", "Win", "Loss", "Win", "Win"] },
        ]);

        const [draftedPlayers, setDraftedPlayers] = useState<Player[]>([
        {name: "Carlos Mendez", ign: "CarM_XP", game: "MLBB", role: "XP Lane", rank: "Mythic", winRate: "62%", kda: "3.8", history: ["Win", "Loss", "Win", "Win", "Win"], team: "Team Frost" },
        {name: "Sophia Lopez", ign: "SophL_Support", game: "MLBB", role: "Roamer", rank: "Legend", winRate: "58%", kda: "4.5", history: ["Win", "Win", "Loss", "Win", "Loss"], team: "Team Blaze" },
        ]);

        const [calendarEvents, setCalendarEvents] = useState([
        {id: "ce1", title: "QF Match Day 1", date: "2026-06-14", time: "2:00 PM", status: "approved" },
        {id: "ce2", title: "QF Match Day 2", date: "2026-06-15", time: "2:00 PM", status: "approved" },
        {id: "ce3", title: "Semifinals", date: "2026-06-21", time: "2:00 PM", status: "approved" },
        {id: "ce4", title: "Finals", date: "2026-06-28", time: "3:00 PM", status: "approved" },
        ]);

        const [announcements, setAnnouncements] = useState([
        {id: "a1", title: "Roster Registration Open", content: "Submit team slots for season 4", submittedAt: "2026-06-01", status: "published" },
        {id: "a2", title: "Draft Pools Finalized", content: "Free agent selection starts June 20", submittedAt: "2026-06-05", status: "pending" },
        ]);

        const [chatLeaders, setChatLeaders] = useState([
        {name: "Marco Reyes", team: "Team Blaze", unread: 1, history: [{sender: "Marco Reyes", text: "Coach, are the final rosters confirmed yet?", time: "09:30 AM" }] },
        {name: "Bea Santos", team: "Team Apex", unread: 0, history: [{sender: "Bea Santos", text: "Ready for our QF match next week.", time: "Yesterday" }] },
        ]);

        const [activeChatIndex, setActiveChatIndex] = useState(0);
        const [chatText, setChatText] = useState("");

        const [resultsNotification, setResultsNotification] = useState<{ message: string; sub: string } | null>(null);

        const [selectedMatchId, setSelectedMatchId] = useState("qf3");
        const [matchWinner, setMatchWinner] = useState("Team Apex");
        const [scoreA, setScoreA] = useState(2);
        const [scoreB, setScoreB] = useState(0);

  const handleResultSubmit = () => {
    const selectedMatch = matchesState.find((m) => m.id === selectedMatchId);
        if (!selectedMatch) return;

    const updated = matchesState.map((m) => {
      if (m.id === selectedMatchId) {
        return {
          ...m,
          winner: matchWinner,
        scoreA: scoreA,
        scoreB: scoreB,
        status: "completed",
        };
      }
        return m;
    });

        let feederRoundWinner = matchWinner;
        let nextMatchId = "";
        let slotKey: "teamA" | "teamB" = "teamA";

        if (selectedMatchId === "qf3") {
          nextMatchId = "sf2";
        slotKey = "teamA";
    } else if (selectedMatchId === "qf4") {
          nextMatchId = "sf2";
        slotKey = "teamB";
    } else if (selectedMatchId === "sf1") {
          nextMatchId = "f1";
        slotKey = "teamA";
    } else if (selectedMatchId === "sf2") {
          nextMatchId = "f1";
        slotKey = "teamB";
    }

    const finalMatches = updated.map((m) => {
      if (m.id === nextMatchId) {
        return {
          ...m,
          [slotKey]: feederRoundWinner,
        };
      }
        return m;
    });

        setMatchesState(finalMatches);

        let alertMessage = "";
        let nextOpponent = "";

        if (selectedMatchId === "qf3" || selectedMatchId === "qf4") {
      const companionMatchId = selectedMatchId === "qf3" ? "qf4" : "qf3";
      const companionMatch = finalMatches.find((m) => m.id === companionMatchId);
        if (companionMatch && companionMatch.status === "completed") {
          nextOpponent = companionMatch.winner;
        alertMessage = `Alert sent to ${feederRoundWinner} and ${nextOpponent} members: 'Your Semifinals match is scheduled. Prepare for battle!'`;
      } else {
          alertMessage = `Alert sent to ${feederRoundWinner}: 'Waiting for the winner of Quarterfinals Match to lock opponent.'`;
      }
    } else if (selectedMatchId === "sf1" || selectedMatchId === "sf2") {
      const companionMatchId = selectedMatchId === "sf1" ? "sf2" : "sf1";
      const companionMatch = finalMatches.find((m) => m.id === companionMatchId);
        if (companionMatch && companionMatch.status === "completed") {
          nextOpponent = companionMatch.winner;
        alertMessage = `Alert sent to ${feederRoundWinner} and ${nextOpponent} members: 'Your Finals match is scheduled!'`;
      } else {
          alertMessage = `Alert sent to ${feederRoundWinner}: 'Waiting for the winner of Semifinals Match to lock final opponent.'`;
      }
    } else {
          alertMessage = `Alert sent: '${feederRoundWinner} is crowned champion of MLBB Season 4!'`;
    }

        setResultsNotification({
          message: alertMessage,
        sub: `Player stats synced: ${feederRoundWinner} players +25 Skill Rating. Win-Loss record and rankings updated on leaderboards.`,
    });

    setTimeout(() => {
          setResultsNotification(null);
    }, 8000);
  };

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

  const handleCreateTeam = (e: React.FormEvent) => {
          e.preventDefault();
        if (!newTeamName || !newTeamHead) return;

        const newT: Team = {
          id: `t-${Date.now()}`,
        name: newTeamName,
        game: newTeamGame,
        head: newTeamHead,
        players: [newTeamHead],
        status: "incomplete",
    };
    setTeams((prev) => [...prev, newT]);
        setNewTeamName("");
        setNewTeamHead("");
  };

        const [teamModalType, setTeamModalType] = useState<"none" | "view" | "edit">("none");
        const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

        const [editTeamName, setEditTeamName] = useState("");
        const [editTeamHead, setEditTeamHead] = useState("");
        const [editTeamStatus, setEditTeamStatus] = useState("");
        const [editTeamPlayers, setEditTeamPlayers] = useState("");

  const openTeamModal = (t: Team, type: "view" | "edit") => {
          setSelectedTeam(t);
        setTeamModalType(type);
        if (type === "edit") {
          setEditTeamName(t.name);
        setEditTeamHead(t.head);
        setEditTeamStatus(t.status);
        setEditTeamPlayers(t.players.join(", "));
    }
  };

  const handleSaveTeamDetails = () => {
    if (!selectedTeam) return;
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === selectedTeam.id) {
          return {
          ...t,
          name: editTeamName,
        head: editTeamHead,
        status: editTeamStatus,
            players: editTeamPlayers.split(",").map((s) => s.trim()).filter(Boolean),
          };
        }
        return t;
      })
        );
        setTeamModalType("none");
        setSelectedTeam(null);
  };

        const [draftSearch, setDraftSearch] = useState("");
        const [draftRole, setDraftRole] = useState("All");
        const [draftRank, setDraftRank] = useState("All");
        const [hoveredPlayer, setHoveredPlayer] = useState<Player | null>(null);

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

  const handleDraftAction = (player: Player, targetTeamName: string) => {
          setFreeAgents((prev) => prev.filter((p) => p.ign !== player.ign));
    setDraftedPlayers((prev) => [...prev, {...player, team: targetTeamName }]);
    setTeams((prev) =>
      prev.map((t) => {
        if (t.name === targetTeamName) {
          return {
          ...t,
          players: [...t.players, player.name],
          };
        }
        return t;
      })
        );
  };

        const [newAnnTitle, setNewAnnTitle] = useState("");
        const [newAnnContent, setNewAnnContent] = useState("");
        const [annSuccess, setAnnSuccess] = useState(false);

  const handleAnnSubmit = (e: React.FormEvent) => {
          e.preventDefault();
        if (!newAnnTitle || !newAnnContent) return;

        const newA = {
          id: `a-${Date.now()}`,
        title: newAnnTitle,
        content: newAnnContent,
        submittedAt: new Date().toISOString().slice(0, 10),
        status: "pending",
    };
    setAnnouncements((prev) => [...prev, newA]);
        setNewAnnTitle("");
        setNewAnnContent("");
        setAnnSuccess(true);
    setTimeout(() => setAnnSuccess(false), 3000);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
          e.preventDefault();
        if (!chatText.trim()) return;

        const newMsg = {
          sender: "Organizer",
        text: chatText,
        time: new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit" }),
    };

    setChatLeaders((prev) =>
      prev.map((leader, i) => {
        if (i === activeChatIndex) {
          return {
          ...leader,
          unread: 0,
        history: [...leader.history, newMsg],
          };
        }
        return leader;
      })
        );
        setChatText("");

    setTimeout(() => {
      const autoReply = {
          sender: chatLeaders[activeChatIndex].name,
        text: "Got it! Thanks for reaching out, I will coordinate this with the team.",
        time: new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit" }),
      };
      setChatLeaders((prev) =>
        prev.map((leader, i) => {
          if (i === activeChatIndex) {
            return {
          ...leader,
          history: [...leader.history, autoReply],
            };
          }
        return leader;
        })
        );
    }, 1500);
  };

  const renderSection = () => {
    switch (section) {
      case "overview":
        return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={tournaments.length} label="Active Tournaments" accent="red" />
            <StatCard value={teams.length} label="Teams Registered" accent="teal" />
            <StatCard value={draftedPlayers.length} label="Drafted Players" accent="purple" />
            <StatCard value={matchesState.filter((m) => m.status === "pending").length} label="Matches Upcoming" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="dash-card p-5">
              <div className="dash-section-title">Announcement Pending Actions</div>
              {announcements.map((item) => (
                <div key={item.id} className="dash-row-item">
                  <span className="text-sm font-semibold" style={{ color: "var(--c-text)" }}>{item.title}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${item.status === "pending" ? "bg-[#FF4655]/20 text-[#FF4655]" : "bg-[#00F5D4]/15 text-[#00F5D4]"
                      }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="dash-card p-5">
              <div className="dash-section-title">Match Result Activities</div>
              <div className="space-y-3">
                {matchesState.filter((m) => m.status === "completed").slice(-3).map((m) => (
                  <div key={m.id} className="flex items-start gap-3 py-2 border-b border-[var(--c-border)]">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[#FF4655]" />
                    <div>
                      <div className="text-xs font-bold text-white">{m.teamA} vs {m.teamB} completed</div>
                      <div className="text-[10px] text-[var(--c-text-muted)]">Winner: {m.winner} ({m.scoreA}-{m.scoreB})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        );

        case "chat":
        const currentChat = chatLeaders[activeChatIndex];
        return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="dash-card p-4 space-y-2">
            <div className="dash-section-title px-1">Team Leaders</div>
            <div className="space-y-1">
              {chatLeaders.map((l, index) => (
                <button
                  key={l.name}
                  onClick={() => {
                    setActiveChatIndex(index);
                    setChatLeaders((prev) =>
                      prev.map((leader, i) => (i === index ? { ...leader, unread: 0 } : leader))
                    );
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors"
                  style={{
                    backgroundColor: activeChatIndex === index ? "rgba(139, 92, 246, 0.1)" : "var(--c-surface2)",
                    border: activeChatIndex === index ? "1px solid #8B5CF6" : "1px solid var(--c-border)",
                  }}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{l.name}</div>
                    <div className="text-[10px] text-[var(--c-text-dim)]">{l.team}</div>
                  </div>
                  {l.unread > 0 && (
                    <span className="w-2.5 h-2.5 bg-[#8B5CF6] rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 dash-card p-5 flex flex-col h-[500px]">
            <div className="dash-section-title pb-3 border-b border-[var(--c-border)]">
              Chat with {currentChat.name} ({currentChat.team})
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-2">
              {currentChat.history.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === "Organizer" ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--c-text-dim)]">
                      {msg.sender}
                    </span>
                    <span className="text-[8px] text-[var(--c-text-muted)]">{msg.time}</span>
                  </div>
                  <div
                    className="px-4 py-2 rounded-lg text-xs max-w-sm"
                    style={{
                      backgroundColor: msg.sender === "Organizer" ? "rgba(139, 92, 246, 0.1)" : "var(--c-surface3)",
                      border: msg.sender === "Organizer" ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid var(--c-border)",
                      color: "var(--c-text)",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChatMessage} className="flex gap-2">
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder={`Send message to ${currentChat.name}...`}
                className="dash-input flex-1"
              />
              <button
                type="submit"
                className="bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
        );

        case "teams":
        return (
        <div className="space-y-6">
          <div className="dash-card p-5">
            <div className="dash-section-title">Create Team & Assign Head</div>
            <form onSubmit={handleCreateTeam} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="dash-label">Team Name</label>
                <input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Team Venom"
                  className="dash-input"
                />
              </div>
              <div>
                <label className="dash-label">Game</label>
                <select
                  value={newTeamGame}
                  onChange={(e) => setNewTeamGame(e.target.value)}
                  className="dash-select"
                >
                  <option value="MLBB">MLBB</option>
                  <option value="CODM">CODM</option>
                </select>
              </div>
              <div>
                <label className="dash-label">Team Head</label>
                <input
                  value={newTeamHead}
                  onChange={(e) => setNewTeamHead(e.target.value)}
                  placeholder="e.g. Marco Reyes"
                  className="dash-input"
                />
              </div>
              <button
                type="submit"
                className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors"
              >
                Save Team
              </button>
            </form>
          </div>

          <div className="dash-table-wrap">
            <table className="w-full border-collapse">
              <thead className="dash-thead">
                <tr>
                  {["Team Name", "Game", "Team Head", "Players", "Status", "Actions"].map((h) => (
                    <th key={h} className="dash-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t.id} className="dash-tr">
                    <td
                      onClick={() => openTeamModal(t, "view")}
                      className="dash-td font-semibold cursor-pointer text-[#00F5D4] hover:underline"
                    >
                      {t.name}
                    </td>
                    <td className="dash-td-muted">{t.game}</td>
                    <td className="dash-td font-semibold">{t.head}</td>
                    <td className="dash-td">{t.players.length}/5</td>
                    <td className="dash-td">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${t.status === "active" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-[#FF4655]/20 text-[#FF4655]"
                          }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="dash-td">
                      <button
                        onClick={() => openTeamModal(t, "edit")}
                        className="flex items-center gap-1 dash-btn-ghost text-xs px-3 py-1 rounded"
                      >
                        <IconEdit size={11} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        );

        case "draft":
        const filteredUnpicked = freeAgents.filter((p) => {
          const matchesSearch =
        p.name.toLowerCase().includes(draftSearch.toLowerCase()) ||
        p.ign.toLowerCase().includes(draftSearch.toLowerCase());
        const matchesRole = draftRole === "All" || p.role === draftRole;
        const matchesRank = draftRank === "All" || p.rank === draftRank;
        return matchesSearch && matchesRole && matchesRank;
        });

        const filteredDrafted = draftedPlayers.filter((p) => {
          const matchesSearch =
        p.name.toLowerCase().includes(draftSearch.toLowerCase()) ||
        p.ign.toLowerCase().includes(draftSearch.toLowerCase());
        const matchesRole = draftRole === "All" || p.role === draftRole;
        const matchesRank = draftRank === "All" || p.rank === draftRank;
        return matchesSearch && matchesRole && matchesRank;
        });

        return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="dash-card p-4 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-dim)]">
                  <IconSearch size={14} />
                </span>
                <input
                  value={draftSearch}
                  onChange={(e) => setDraftSearch(e.target.value)}
                  placeholder="Search player name or IGN..."
                  className="dash-input pl-9"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={draftRole}
                  onChange={(e) => setDraftRole(e.target.value)}
                  className="dash-select text-xs"
                >
                  <option value="All">All Roles</option>
                  <option value="XP Lane">XP Lane</option>
                  <option value="Gold Lane">Gold Lane</option>
                  <option value="Mid Lane">Mid Lane</option>
                  <option value="Roamer">Roamer</option>
                  <option value="Jungler">Jungler</option>
                </select>
                <select
                  value={draftRank}
                  onChange={(e) => setDraftRank(e.target.value)}
                  className="dash-select text-xs"
                >
                  <option value="All">All Ranks</option>
                  <option value="Mythic">Mythic</option>
                  <option value="Mythical Glory">Mythical Glory</option>
                  <option value="Legend">Legend</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="dash-card p-4 flex flex-col h-[400px]">
                <div className="dash-section-title pb-2 border-b border-[var(--c-border)]">
                  Available Player Pool ({filteredUnpicked.length})
                </div>
                <div className="flex-1 overflow-y-auto space-y-2.5 my-3 pr-1">
                  {filteredUnpicked.map((fa) => (
                    <div
                      key={fa.ign}
                      onMouseEnter={() => setHoveredPlayer(fa)}
                      onClick={() => setHoveredPlayer(fa)}
                      className="flex items-center justify-between p-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] hover:border-[#8B5CF6] transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{fa.name}</div>
                        <div className="text-[10px] text-[var(--c-text-muted)]">
                          {fa.ign} · {fa.role} · {fa.rank}
                        </div>
                      </div>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleDraftAction(fa, e.target.value);
                          }
                        }}
                        className="dash-select w-24 text-[10px] py-1 px-1.5"
                        defaultValue=""
                      >
                        <option value="" disabled>Draft to...</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dash-card p-4 flex flex-col h-[400px]">
                <div className="dash-section-title pb-2 border-b border-[var(--c-border)]">
                  Drafted Players ({filteredDrafted.length})
                </div>
                <div className="flex-1 overflow-y-auto space-y-2.5 my-3 pr-1">
                  {filteredDrafted.map((dp) => (
                    <div
                      key={dp.ign}
                      onMouseEnter={() => setHoveredPlayer(dp)}
                      onClick={() => setHoveredPlayer(dp)}
                      className="flex items-center justify-between p-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] hover:border-[#00F5D4] transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{dp.name}</div>
                        <div className="text-[10px] text-[var(--c-text-muted)]">
                          {dp.ign} · {dp.role} · {dp.rank}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-[#00F5D4]/10 text-[#00F5D4] px-2 py-0.5 rounded">
                        {dp.team}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="dash-card p-5 sticky top-5">
              <div className="dash-section-title pb-2 border-b border-[var(--c-border)]">
                Player Statistics Card
              </div>
              {hoveredPlayer ? (
                <div className="space-y-4 mt-4">
                  <div className="text-center pb-3 border-b border-[var(--c-border)]">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 text-[#8B5CF6] border border-[#8B5CF6] flex items-center justify-center font-bold text-lg mx-auto mb-2">
                      {hoveredPlayer.name[0]}
                    </div>
                    <div className="text-sm font-bold text-white">{hoveredPlayer.name}</div>
                    <div className="text-xs text-[var(--c-text-muted)]">IGN: {hoveredPlayer.ign}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded bg-[var(--c-surface3)] border border-[var(--c-border)]">
                      <div className="text-[10px] text-[var(--c-text-muted)]">Win Rate</div>
                      <div className="text-sm font-bold text-[#00F5D4] mt-0.5">{hoveredPlayer.winRate}</div>
                    </div>
                    <div className="p-2.5 rounded bg-[var(--c-surface3)] border border-[var(--c-border)]">
                      <div className="text-[10px] text-[var(--c-text-muted)]">KDA Ratio</div>
                      <div className="text-sm font-bold text-purple-400 mt-0.5">{hoveredPlayer.kda}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--c-text-muted)] mb-1.5 font-bold">
                      Player Role & rank
                    </div>
                    <div className="text-xs text-white">
                      Role: <span className="font-semibold text-purple-300">{hoveredPlayer.role}</span>
                    </div>
                    <div className="text-xs text-white mt-1">
                      Rank: <span className="font-semibold text-purple-300">{hoveredPlayer.rank}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--c-text-muted)] mb-1.5 font-bold">
                      Recent History
                    </div>
                    <div className="flex gap-1">
                      {hoveredPlayer.history.map((h, index) => (
                        <span
                          key={index}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${h === "Win" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-[#FF4655]/20 text-[#FF4655]"
                            }`}
                        >
                          {h[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[var(--c-text-muted)] text-center py-12">
                  Hover or select a player to view stats card details.
                </div>
              )}
            </div>
          </div>
        </div>
        );

        case "free_agents":
        return (
        <div className="space-y-6">
          <div className="dash-card p-5">
            <div className="dash-section-title">Add Free Agent Player</div>
            <form onSubmit={handleCreateFreeAgent} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="dash-label">Player Name</label>
                <input
                  value={newFaName}
                  onChange={(e) => setNewFaName(e.target.value)}
                  placeholder="e.g. Ana Lim"
                  className="dash-input"
                />
              </div>
              <div>
                <label className="dash-label">IGN</label>
                <input
                  value={newFaIgn}
                  onChange={(e) => setNewFaIgn(e.target.value)}
                  placeholder="e.g. AnaLim_PH"
                  className="dash-input"
                />
              </div>
              <div>
                <label className="dash-label">Game</label>
                <select
                  value={newFaGame}
                  onChange={(e) => setNewFaGame(e.target.value)}
                  className="dash-select"
                >
                  <option value="MLBB">MLBB</option>
                  <option value="CODM">CODM</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors"
              >
                Create Agent
              </button>
            </form>
          </div>

          <div className="dash-card p-4">
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-dim)]">
                <IconSearch size={14} />
              </span>
              <input
                value={freeAgentSearch}
                onChange={(e) => setFreeAgentSearch(e.target.value)}
                placeholder="Filter free agents..."
                className="dash-input pl-9"
              />
            </div>

            <div className="dash-table-wrap">
              <table className="w-full border-collapse">
                <thead className="dash-thead">
                  <tr>
                    {["Name", "IGN", "Game", "Role", "Rank", "Actions"].map((h) => (
                      <th key={h} className="dash-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {freeAgents
                    .filter(
                      (fa) =>
                        fa.name.toLowerCase().includes(freeAgentSearch.toLowerCase()) ||
                        fa.ign.toLowerCase().includes(freeAgentSearch.toLowerCase())
                    )
                    .map((fa) => (
                      <tr key={fa.ign} className="dash-tr">
                        <td className="dash-td font-semibold">{fa.name}</td>
                        <td className="dash-td-muted">{fa.ign}</td>
                        <td className="dash-td">{fa.game}</td>
                        <td className="dash-td">{fa.role}</td>
                        <td className="dash-td font-bold text-purple-300">{fa.rank}</td>
                        <td className="dash-td">
                          <button
                            onClick={() => setFreeAgents((prev) => prev.filter((p) => p.ign !== fa.ign))}
                            className="dash-btn-ghost text-xs px-3 py-1 rounded"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        );

        case "tournaments":
        return (
        <div className="space-y-6">
          <div className="dash-card p-5">
            <div className="dash-section-title">Create Tournaments</div>
            <form onSubmit={handleCreateTournament} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="dash-label">Tournament Name</label>
                <input
                  value={newTourneyName}
                  onChange={(e) => setNewTourneyName(e.target.value)}
                  placeholder="e.g. MLBB Championship"
                  className="dash-input"
                />
              </div>
              <div>
                <label className="dash-label">Game</label>
                <select
                  value={newTourneyGame}
                  onChange={(e) => setNewTourneyGame(e.target.value)}
                  className="dash-select"
                >
                  <option value="MLBB">MLBB</option>
                  <option value="CODM">CODM</option>
                </select>
              </div>
              <div>
                <label className="dash-label">Max Teams</label>
                <select
                  value={newTourneyMaxTeams}
                  onChange={(e) => setNewTourneyMaxTeams(Number(e.target.value))}
                  className="dash-select"
                >
                  <option value="4">4 Teams</option>
                  <option value="8">8 Teams</option>
                  <option value="16">16 Teams</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors"
              >
                Save Tournament
              </button>
            </form>
          </div>

          <div className="dash-table-wrap">
            <table className="w-full border-collapse">
              <thead className="dash-thead">
                <tr>
                  {["Tournament Name", "Game", "Format", "Teams Registered", "Status", "Actions"].map((h) => (
                    <th key={h} className="dash-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tournaments.map((t) => (
                  <tr key={t.id} className="dash-tr">
                    <td
                      onClick={() => openTourneyModal(t, "view")}
                      className="dash-td font-semibold cursor-pointer text-[#00F5D4] hover:underline"
                    >
                      {t.name}
                    </td>
                    <td className="dash-td-muted">{t.game}</td>
                    <td className="dash-td-muted">{t.format}</td>
                    <td className="dash-td">{t.teamsList.length}/{t.maxTeams}</td>
                    <td className="dash-td">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${t.status === "ongoing" ? "bg-[#FF4655]/20 text-[#FF4655]" : "bg-[#00F5D4]/15 text-[#00F5D4]"
                          }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="dash-td">
                      <button
                        onClick={() => openTourneyModal(t, "edit")}
                        className="dash-btn-ghost text-xs px-3 py-1 rounded"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        );

        case "brackets":
        const bracketRounds = [
        {
          title: "Quarterfinals",
        matches: [
        {id: "qf1", teamA: {name: matchesState[0].teamA, score: matchesState[0].scoreA, isWinner: matchesState[0].winner === matchesState[0].teamA }, teamB: {name: matchesState[0].teamB, score: matchesState[0].scoreB, isWinner: matchesState[0].winner === matchesState[0].teamB } },
        {id: "qf2", teamA: {name: matchesState[1].teamA, score: matchesState[1].scoreA, isWinner: matchesState[1].winner === matchesState[1].teamA }, teamB: {name: matchesState[1].teamB, score: matchesState[1].scoreB, isWinner: matchesState[1].winner === matchesState[1].teamB } },
        {id: "qf3", teamA: {name: matchesState[2].teamA, score: matchesState[2].status === "completed" ? matchesState[2].scoreA : undefined, isWinner: matchesState[2].winner === matchesState[2].teamA }, teamB: {name: matchesState[2].teamB, score: matchesState[2].status === "completed" ? matchesState[2].scoreB : undefined, isWinner: matchesState[2].winner === matchesState[2].teamB } },
        {id: "qf4", teamA: {name: matchesState[3].teamA, score: matchesState[3].status === "completed" ? matchesState[3].scoreA : undefined, isWinner: matchesState[3].winner === matchesState[3].teamA }, teamB: {name: matchesState[3].teamB, score: matchesState[3].status === "completed" ? matchesState[3].scoreB : undefined, isWinner: matchesState[3].winner === matchesState[3].teamB } },
        ],
          },
        {
          title: "Semifinals",
        matches: [
        {id: "sf1", teamA: {name: matchesState[4].teamA, score: matchesState[4].status === "completed" ? matchesState[4].scoreA : undefined, isWinner: matchesState[4].winner === matchesState[4].teamA }, teamB: {name: matchesState[4].teamB, score: matchesState[4].status === "completed" ? matchesState[4].scoreB : undefined, isWinner: matchesState[4].winner === matchesState[4].teamB } },
        {id: "sf2", teamA: {name: matchesState[5].teamA, score: matchesState[5].status === "completed" ? matchesState[5].scoreA : undefined, isWinner: matchesState[5].winner === matchesState[5].teamA }, teamB: {name: matchesState[5].teamB, score: matchesState[5].status === "completed" ? matchesState[5].scoreB : undefined, isWinner: matchesState[5].winner === matchesState[5].teamB } },
        ],
          },
        {
          title: "Finals",
        matches: [
        {id: "f1", teamA: {name: matchesState[6].teamA, score: matchesState[6].status === "completed" ? matchesState[6].scoreA : undefined, isWinner: matchesState[6].winner === matchesState[6].teamA }, teamB: {name: matchesState[6].teamB, score: matchesState[6].status === "completed" ? matchesState[6].scoreB : undefined, isWinner: matchesState[6].winner === matchesState[6].teamB } },
        ],
          },
        ];

        return (
        <div className="space-y-6">
          <div className="flex gap-2">
            <button className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">
              Generate Bracket
            </button>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="flex gap-8 items-start min-w-max">
              {bracketRounds.map((round, roundIndex) => {
                const topOffset = roundIndex === 0 ? 0 : roundIndex === 1 ? 42 : 130;
                return (
                  <div key={round.title} className="flex flex-col gap-0 min-w-[170px]">
                    <div className="text-[10px] uppercase tracking-[1.5px] mb-3 text-center text-[var(--c-text-dim)]">
                      {round.title}
                    </div>
                    <div
                      className="flex flex-col"
                      style={{ gap: roundIndex === 0 ? "16px" : roundIndex === 1 ? "88px" : "0" }}
                    >
                      {round.matches.map((match) => (
                        <div
                          key={match.id}
                          style={{
                            marginTop: roundIndex > 0 && match === round.matches[0] ? `${topOffset}px` : undefined,
                          }}
                        >
                          <div className="rounded-lg overflow-hidden bg-[var(--c-surface3)] border border-[var(--c-border)]">
                            <div
                              className="flex items-center justify-between px-3 py-2 text-xs"
                              style={{
                                color: match.teamA.isWinner ? "#00F5D4" : "var(--c-text-muted)",
                                backgroundColor: match.teamA.isWinner ? "rgba(0,245,212,0.05)" : "transparent",
                              }}
                            >
                              <span className="font-medium">{match.teamA.name}</span>
                              {match.teamA.score !== undefined && (
                                <span className="font-bold ml-2">{match.teamA.score}</span>
                              )}
                            </div>
                            <div style={{ height: "1px", backgroundColor: "var(--c-border)" }} />
                            <div
                              className="flex items-center justify-between px-3 py-2 text-xs"
                              style={{
                                color: match.teamB.isWinner ? "#00F5D4" : "var(--c-text-muted)",
                                backgroundColor: match.teamB.isWinner ? "rgba(0,245,212,0.05)" : "transparent",
                              }}
                            >
                              <span className="font-medium">{match.teamB.name}</span>
                              {match.teamB.score !== undefined && (
                                <span className="font-bold ml-2">{match.teamB.score}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        );

        case "results":
        return (
        <div className="space-y-5">
          {resultsNotification && (
            <div className="p-4 rounded-xl border border-[#00F5D4]/50 bg-[#00F5D4]/5 text-[#00F5D4] text-xs space-y-1 animate-fade-in">
              <div className="font-bold uppercase tracking-wider">{resultsNotification.message}</div>
              <div className="opacity-90">{resultsNotification.sub}</div>
            </div>
          )}

          <div className="dash-card p-5">
            <div className="dash-section-title">Record New Result</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="dash-label">Select Match</label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => {
                    setSelectedMatchId(e.target.value);
                    const selected = matchesState.find((m) => m.id === e.target.value);
                    if (selected) {
                      setMatchWinner(selected.teamA);
                    }
                  }}
                  className="dash-select"
                >
                  {matchesState
                    .filter((m) => m.status === "pending" && m.teamA !== "TBD" && m.teamB !== "TBD")
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.teamA} vs {m.teamB} ({m.round})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="dash-label">Winner</label>
                <select
                  value={matchWinner}
                  onChange={(e) => setMatchWinner(e.target.value)}
                  className="dash-select"
                >
                  {(() => {
                    const selected = matchesState.find((m) => m.id === selectedMatchId);
                    if (!selected) return null;
                    return (
                      <>
                        <option value={selected.teamA}>{selected.teamA}</option>
                        <option value={selected.teamB}>{selected.teamB}</option>
                      </>
                    );
                  })()}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="dash-label">Score A</label>
                  <input
                    type="number"
                    value={scoreA}
                    onChange={(e) => setScoreA(Number(e.target.value))}
                    className="dash-input"
                  />
                </div>
                <div className="flex-1">
                  <label className="dash-label">Score B</label>
                  <input
                    type="number"
                    value={scoreB}
                    onChange={(e) => setScoreB(Number(e.target.value))}
                    className="dash-input"
                  />
                </div>
              </div>

              <button
                onClick={handleResultSubmit}
                className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors"
              >
                Submit Result
              </button>
            </div>
          </div>

          <div className="dash-table-wrap">
            <table className="w-full border-collapse">
              <thead className="dash-thead">
                <tr>
                  {["Match", "Winner", "Score", "Round", "Status"].map((h) => (
                    <th key={h} className="dash-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matchesState.map((m) => (
                  <tr key={m.id} className="dash-tr">
                    <td className="dash-td font-semibold">
                      {m.teamA} vs {m.teamB}
                    </td>
                    <td className="dash-td font-bold" style={{ color: m.winner ? "#00F5D4" : "var(--c-text-muted)" }}>
                      {m.winner || "TBD"}
                    </td>
                    <td className="dash-td">
                      {m.status === "completed" ? `${m.scoreA}-${m.scoreB}` : "-"}
                    </td>
                    <td className="dash-td-muted">{m.round}</td>
                    <td className="dash-td">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${m.status === "completed" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-[#FF4655]/20 text-[#FF4655]"
                          }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        );

        case "standings":
        const standingsList = [
        {rank: 1, name: "Team Blaze", w: 5, l: 0, pts: 15, streak: "5W" },
        {rank: 2, name: "Team Frost", w: 4, l: 1, pts: 12, streak: "3W" },
        {rank: 3, name: "Team Storm", w: 2, l: 3, pts: 6, streak: "2L" },
        {rank: 4, name: "Team Apex", w: 2, l: 3, pts: 6, streak: "1W" },
        {rank: 5, name: "Team Forge", w: 1, l: 4, pts: 3, streak: "2L" },
        {rank: 6, name: "Team Venom", w: 1, l: 4, pts: 3, streak: "3L" },
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
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.streak.includes("W") ? "bg-[#00F5D4]/10 text-[#00F5D4]" : "bg-[#FF4655]/10 text-[#FF4655]"
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
                <div className="font-head text-2xl font-bold text-white mt-1">{s.value}</div>
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
                      <td className="dash-td font-bold text-white">{p.rating} MMR</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        );

        case "announcements":
        return (
        <div className="space-y-6">
          <div className="dash-card p-5">
            <div className="dash-section-title">Submit Announcement for Admin Approval</div>
            {annSuccess && (
              <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-2 mb-4">
                Announcement submitted for admin approval.
              </div>
            )}
            <form onSubmit={handleAnnSubmit} className="space-y-3">
              <div>
                <label className="dash-label">Title</label>
                <input
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  placeholder="Announcement title..."
                  className="dash-input"
                />
              </div>
              <div>
                <label className="dash-label">Content</label>
                <textarea
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  rows={4}
                  placeholder="Write announcement content..."
                  className="dash-input"
                  style={{ resize: "none" }}
                />
              </div>
              <button
                type="submit"
                className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
              >
                Submit Announcement
              </button>
            </form>
          </div>

          <div className="dash-table-wrap">
            <table className="w-full border-collapse">
              <thead className="dash-thead">
                <tr>
                  {["Title", "Date Submitted", "Status"].map((h) => (
                    <th key={h} className="dash-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {announcements.map((a) => (
                  <tr key={a.id} className="dash-tr">
                    <td className="dash-td font-medium">{a.title}</td>
                    <td className="dash-td-muted">{a.submittedAt}</td>
                    <td className="dash-td">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${a.status === "published" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-[#FF4655]/20 text-[#FF4655]"
                          }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        );

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
            <div className="font-head text-sm font-semibold uppercase tracking-wider mb-4 text-white">
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
                          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${e.status === "approved" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-[#FF4655]/20 text-[#FF4655]"
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
    const SECTION_TITLES: Record<string, {title: string; subtitle: string }> = {
          overview: {title: "ORGANIZER DASHBOARD", subtitle: "Tournament management overview" },
        chat: {title: "COMMUNICATE WITH LEADERS", subtitle: "Direct chat channel with team captains" },
        teams: {title: "TEAM MANAGEMENT", subtitle: "Create, edit, and assign team details" },
        draft: {title: "DRAFT PLAYERS LOUNGE", subtitle: "Search and filter unpicked free agent pool" },
        free_agents: {title: "MANAGE FREE AGENTS", subtitle: "Add, review, and delete free agent entries" },
        tournaments: {title: "TOURNAMENTS", subtitle: "Create and configure tournament formats" },
        brackets: {title: "PLAYOFF BRACKETS", subtitle: "Advance qualified teams to playoff brackets" },
        results: {title: "MATCH RESULTS RESULTS", subtitle: "Submit completed match scores and advance brackets" },
        standings: {title: "LEAGUE STANDINGS", subtitle: "Monitor current team standings" },
        stats: {title: "GAME STATISTICS", subtitle: "Detailed win-rates, MVPs, and metrics" },
        announcements: {title: "ANNOUNCEMENT MAKER", subtitle: "Submit announcements for admin moderation" },
        calendar: {title: "CALENDAR SCHEDULER", subtitle: "Schedule matches and filter past events" },
    };
        return SECTION_TITLES[section] ?? {title: section.toUpperCase(), subtitle: "" };
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
          <main
            className="flex-1"
            style={{
              minHeight: "calc(100vh - 60px)",
              overflowY: "auto",
              padding: "32px",
              backgroundColor: "var(--c-page-bg)",
            }}
          >
            <PageHeader title={meta.title} subtitle={meta.subtitle} />
            {renderSection()}
          </main>

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
                  className="absolute right-4 top-4 text-[var(--c-text-dim)] hover:text-white"
                >
                  <IconX size={16} />
                </button>
                <h3 className="font-head text-xl font-bold text-white mb-4 uppercase">
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
                        <span className="font-bold text-white">{selectedTourney.name}</span>
                      </div>
                      <div>
                        <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Game</span>
                        <span className="font-bold text-white">{selectedTourney.game}</span>
                      </div>
                      <div>
                        <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Format</span>
                        <span className="font-bold text-white">{selectedTourney.format}</span>
                      </div>
                      <div>
                        <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Status</span>
                        <span className="font-bold text-white">{selectedTourney.status}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px] mb-1">
                          Teams List & Players
                        </span>
                        <div className="space-y-1 bg-[var(--c-surface2)] p-2.5 rounded border border-[var(--c-border)] max-h-24 overflow-y-auto">
                          {selectedTourney.teamsList.map((tm, idx) => (
                            <div key={idx} className="flex justify-between text-[11px] text-white">
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
                              <span key={mid} className="bg-[var(--c-surface3)] border border-[var(--c-border)] px-2 py-0.5 rounded text-[10px] text-white">
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

          {teamModalType !== "none" && selectedTeam && (
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
                    setTeamModalType("none");
                    setSelectedTeam(null);
                  }}
                  className="absolute right-4 top-4 text-[var(--c-text-dim)] hover:text-white"
                >
                  <IconX size={16} />
                </button>
                <h3 className="font-head text-xl font-bold text-white mb-4 uppercase">
                  {teamModalType === "edit" ? "Edit Team Details" : "Team Roster Information"}
                </h3>

                <div className="space-y-4">
                  {teamModalType === "edit" ? (
                    <>
                      <div>
                        <label className="dash-label">Team Name</label>
                        <input
                          value={editTeamName}
                          onChange={(e) => setEditTeamName(e.target.value)}
                          className="dash-input"
                        />
                      </div>
                      <div>
                        <label className="dash-label">Team Head</label>
                        <input
                          value={editTeamHead}
                          onChange={(e) => setEditTeamHead(e.target.value)}
                          className="dash-input"
                        />
                      </div>
                      <div>
                        <label className="dash-label">Members (Comma Separated)</label>
                        <input
                          value={editTeamPlayers}
                          onChange={(e) => setEditTeamPlayers(e.target.value)}
                          className="dash-input"
                        />
                      </div>
                      <div>
                        <label className="dash-label">Status</label>
                        <select
                          value={editTeamStatus}
                          onChange={(e) => setEditTeamStatus(e.target.value)}
                          className="dash-select"
                        >
                          <option value="active">active</option>
                          <option value="incomplete">incomplete</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Team Name</span>
                        <span className="font-bold text-white">{selectedTeam.name}</span>
                      </div>
                      <div>
                        <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Team Head</span>
                        <span className="font-bold text-white">{selectedTeam.head}</span>
                      </div>
                      <div>
                        <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Number of Players</span>
                        <span className="font-bold text-white">{selectedTeam.players.length}/5</span>
                      </div>
                      <div>
                        <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px]">Status</span>
                        <span className="font-bold text-white">{selectedTeam.status}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[var(--c-text-dim)] uppercase tracking-wider text-[10px] mb-1.5">
                          Roster Members List
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedTeam.players.map((plyr, idx) => (
                            <span key={idx} className="bg-[var(--c-surface3)] border border-[var(--c-border)] px-2.5 py-1 rounded text-[11px] text-white">
                              {plyr}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  {teamModalType === "edit" ? (
                    <>
                      <button
                        onClick={handleSaveTeamDetails}
                        className="bg-[#00F5D4] hover:bg-[#00d8bc] text-black text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setTeamModalType("none");
                          setSelectedTeam(null);
                        }}
                        className="dash-btn-ghost text-xs px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setTeamModalType("none");
                        setSelectedTeam(null);
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
