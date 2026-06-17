"use client";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/shared/sidebar";
import StatCard from "@/components/shared/stat-card";
import PageHeader from "@/components/shared/page-header";
import BracketManagementModule from "@/modules/bracket-management";
import AnnouncementManagementModule from "@/modules/announcement-management";
import LivestreamManagementModule from "@/modules/livestream-management";
import { matches } from "@/data/matches";

function ProfileSection({
  gamerType,
  name,
  setName,
  ign,
  setIgn,
  phone,
  setPhone,
  teamName,
}: {
  gamerType: "team_leader" | "team_member" | "free_agent";
  name: string;
  setName: (v: string) => void;
  ign: string;
  setIgn: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  teamName: string;
}) {
  const [editing, setEditing] = useState(false);

  const getRoleLabel = () => {
    if (gamerType === "team_leader") return "Team Leader";
    if (gamerType === "team_member") return "Team Member";
    return "Free Agent";
  };

  const getRoleBadgeColor = () => {
    if (gamerType === "team_leader") return "bg-[#FF4655]/15 text-[#FF4655]";
    if (gamerType === "team_member") return "bg-[#00F5D4]/15 text-[#00F5D4]";
    return "bg-[#8B5CF6]/15 text-[#8B5CF6]";
  };

  const getInitials = () => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-head text-2xl font-bold"
          style={{
            backgroundColor: "var(--c-surface3)",
            border: `2px solid ${
              gamerType === "team_leader"
                ? "#FF4655"
                : gamerType === "team_member"
                ? "#00F5D4"
                : "#8B5CF6"
            }`,
            color:
              gamerType === "team_leader"
                ? "#FF4655"
                : gamerType === "team_member"
                ? "#00F5D4"
                : "#8B5CF6",
          }}
        >
          {getInitials()}
        </div>
        <div>
          <div className="font-head text-xl font-bold uppercase tracking-wide" style={{ color: "var(--c-text)" }}>
            {name}
          </div>
          <div className="text-sm font-semibold tracking-wide" style={{ color: "var(--c-text-muted)" }}>
            {ign}
          </div>
          <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${getRoleBadgeColor()}`}>
            {getRoleLabel()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gamerType !== "free_agent" ? (
          <>
            <StatCard value={teamName} label="Current Team" accent={gamerType === "team_leader" ? "red" : "teal"} />
            <StatCard value="MLBB" label="Game" />
            <StatCard value="4/5" label="Roster Filled" accent="red" />
          </>
        ) : (
          <>
            <StatCard value="None" label="Current Team" accent="purple" />
            <StatCard value="MLBB" label="Game" />
            <StatCard value="Active" label="Draft Pool Status" accent="purple" />
          </>
        )}
      </div>

      <div className="dash-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="dash-section-title" style={{ marginBottom: 0 }}>Update Profile</div>
          <button onClick={() => setEditing(!editing)} className="dash-btn-ghost text-xs px-3 py-1 rounded">
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["Full Name", name, setName],
            ["In-Game Name", ign, setIgn],
            ["Phone Number", phone, setPhone],
          ].map(([label, val, setter]) => (
            <div key={label as string}>
              <label className="dash-label">{label as string}</label>
              <input
                value={val as string}
                onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                disabled={!editing}
                className="dash-input"
                style={{ opacity: editing ? 1 : 0.5 }}
              />
            </div>
          ))}
        </div>
        {editing && (
          <button
            onClick={() => setEditing(false)}
            className="mt-4 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
}

function ChatSection() {
  const [messages, setMessages] = useState<
    { sender: string; text: string; time: string; isOrganizer: boolean }[]
  >([
    {
      sender: "Coach Dave (Organizer)",
      text: "Hi team leaders! Please finalize and confirm your player participation checklists before bracket generation tomorrow morning.",
      time: "10:15 AM",
      isOrganizer: true,
    },
    {
      sender: "You",
      text: "Copy that, Coach Dave. Just checking with Liza and Kevin, then I will confirm the roster.",
      time: "10:20 AM",
      isOrganizer: false,
    },
  ]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const userMsg = {
      sender: "You",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOrganizer: false,
    };
    setMessages((prev) => [...prev, userMsg]);
    setText("");

    setTimeout(() => {
      const responseMsg = {
        sender: "Coach Dave (Organizer)",
        text: "Thank you for the update. Roster updates are tracked in real-time. Good luck in the matches!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isOrganizer: true,
      };
      setMessages((prev) => [...prev, responseMsg]);
    }, 1500);
  };

  return (
    <div className="dash-card p-5 flex flex-col h-[500px]">
      <div className="dash-section-title pb-3 border-b border-[var(--c-border)]">Organizer Communications</div>
      <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.isOrganizer ? "items-start" : "items-end"}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--c-text-dim)]">
                {msg.sender}
              </span>
              <span className="text-[9px] text-[var(--c-text-muted)]">{msg.time}</span>
            </div>
            <div
              className="px-4 py-2.5 rounded-lg text-xs max-w-md"
              style={{
                backgroundColor: msg.isOrganizer ? "var(--c-surface3)" : "rgba(255, 70, 85, 0.1)",
                border: msg.isOrganizer ? "1px solid var(--c-border)" : "1px solid rgba(255, 70, 85, 0.3)",
                color: "var(--c-text)",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message to organizers..."
          className="dash-input flex-1"
        />
        <button
          type="submit"
          className="bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function TeamSection() {
  const roster = [
    { num: 1, name: "Marco Reyes", ign: "MarcoRey_MLBB", role: "Team Leader", status: "active" },
    { num: 2, name: "John Dela Cruz", ign: "JohnDC_MLBB", role: "Member", status: "active" },
    { num: 3, name: "Liza Santos", ign: "LizaS_MLBB", role: "Member", status: "active" },
    { num: 4, name: "Kevin Bautista", ign: "KevB_MLBB", role: "Member", status: "active" },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard value="Team Blaze" label="Team Name" accent="teal" />
        <StatCard value="4/5" label="Roster Slots" accent="red" />
        <StatCard value="MLBB" label="Game" />
      </div>
      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {["#", "Player", "In-Game Name", "Role", "Status"].map((h) => (
                <th key={h} className="dash-th">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roster.map((r) => (
              <tr key={r.num} className="dash-tr">
                <td className="dash-td-dim">{r.num}</td>
                <td className="dash-td font-medium">{r.name}</td>
                <td className="dash-td-muted">{r.ign}</td>
                <td className="dash-td">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      r.role === "Team Leader" ? "bg-[#FF4655]/20 text-[#FF4655]" : ""
                    }`}
                    style={
                      r.role !== "Team Leader"
                        ? { backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" }
                        : {}
                    }
                  >
                    {r.role}
                  </span>
                </td>
                <td className="dash-td">
                  <span className="bg-[#00F5D4]/15 text-[#00F5D4] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScheduleSection() {
  const upcoming = matches.filter((m) => m.status === "pending");
  return (
    <div className="flex flex-col gap-3">
      {upcoming.map((m) => {
        const d = new Date(m.date);
        return (
          <div key={m.id} className="dash-card px-5 py-4 flex items-center gap-4">
            <div className="text-center min-w-[56px]">
              <div className="text-[10px] uppercase" style={{ color: "var(--c-text-dim)" }}>
                {d.toLocaleDateString("en-PH", { weekday: "short" })}
              </div>
              <div className="font-head text-2xl font-bold leading-none" style={{ color: "var(--c-accent)" }}>
                {d.getDate()}
              </div>
              <div className="text-[10px]" style={{ color: "var(--c-text-dim)" }}>
                {d.toLocaleDateString("en-PH", { month: "short" })}
              </div>
            </div>
            <div className="h-10 w-px" style={{ backgroundColor: "var(--c-border)" }} />
            <div className="flex items-center gap-3 flex-1">
              <span
                className={`font-head text-sm font-semibold uppercase ${
                  m.teamA === "Team Blaze" ? "text-[#00F5D4]" : ""
                }`}
                style={m.teamA !== "Team Blaze" ? { color: "var(--c-text)" } : {}}
              >
                {m.teamA}
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" }}
              >
                VS
              </span>
              <span
                className={`font-head text-sm font-semibold uppercase ${
                  m.teamB === "Team Blaze" ? "text-[#00F5D4]" : ""
                }`}
                style={m.teamB !== "Team Blaze" ? { color: "var(--c-text)" } : {}}
              >
                {m.teamB}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="bg-[#FF4655]/20 text-[#FF4655] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                {m.round}
              </span>
              <div className="text-[11px] mt-1" style={{ color: "var(--c-text-dim)" }}>
                {m.time}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StandingsSection() {
  const standings = [
    { rank: 1, name: "Team Blaze", w: 4, l: 0, pts: 12, streak: "4W", isUser: true },
    { rank: 2, name: "Team Frost", w: 3, l: 1, pts: 9, streak: "2W", isUser: false },
    { rank: 3, name: "Team Storm", w: 2, l: 2, pts: 6, streak: "1L", isUser: false },
    { rank: 4, name: "Team Apex", w: 2, l: 2, pts: 6, streak: "1W", isUser: false },
    { rank: 5, name: "Team Forge", w: 1, l: 3, pts: 3, streak: "2L", isUser: false },
    { rank: 6, name: "Team Venom", w: 1, l: 3, pts: 3, streak: "3L", isUser: false },
    { rank: 7, name: "Team Nova", w: 1, l: 3, pts: 3, streak: "1W", isUser: false },
    { rank: 8, name: "Team Rush", w: 0, l: 4, pts: 0, streak: "4L", isUser: false },
  ];

  return (
    <div className="dash-table-wrap">
      <table className="w-full border-collapse">
        <thead className="dash-thead">
          <tr>
            {["Rank", "Team", "Wins", "Losses", "Points", "Streak"].map((h) => (
              <th key={h} className="dash-th">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => (
            <tr
              key={s.rank}
              className="dash-tr"
              style={s.isUser ? { backgroundColor: "rgba(0, 245, 212, 0.04)" } : {}}
            >
              <td className="dash-td font-bold">{s.rank}</td>
              <td className="dash-td font-semibold">
                <span className={s.isUser ? "text-[#00F5D4]" : "text-[var(--c-text)]"}>{s.name}</span>
                {s.isUser && (
                  <span className="ml-2 text-[8px] font-bold bg-[#00F5D4]/15 text-[#00F5D4] px-1.5 py-0.5 rounded uppercase tracking-wider">
                    My Team
                  </span>
                )}
              </td>
              <td className="dash-td">{s.w}</td>
              <td className="dash-td">{s.l}</td>
              <td className="dash-td font-bold" style={{ color: s.isUser ? "#00F5D4" : "var(--c-text-dim)" }}>
                {s.pts}
              </td>
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
}

function ConfirmParticipationSection({
  confirmed,
  setConfirmed,
}: {
  confirmed: boolean;
  setConfirmed: (v: boolean) => void;
}) {
  const [selections, setSelections] = useState({
    player1: true,
    player2: true,
    player3: false,
    player4: false,
  });

  return (
    <div className="space-y-5">
      {confirmed && (
        <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-3">
          Roster participation confirmed for MLBB Championship S4!
        </div>
      )}

      <div className="dash-card p-5 space-y-4">
        <div className="dash-section-title">Confirm Player Participation</div>
        <p className="text-xs text-[var(--c-text-muted)]">
          Check the players who are fully eligible and confirmed to participate in the upcoming match brackets.
        </p>

        <div className="space-y-3 pt-2">
          {[
            { id: "player1", name: "Marco Reyes (Team Leader)", confirmed: true, disabled: true },
            { id: "player2", name: "John Dela Cruz (Member)", key: "player2" },
            { id: "player3", name: "Liza Santos (Member)", key: "player3" },
            { id: "player4", name: "Kevin Bautista (Member)", key: "player4" },
          ].map((player) => (
            <label
              key={player.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] cursor-pointer select-none transition-colors hover:bg-[var(--c-surface3)]"
            >
              <input
                type="checkbox"
                checked={player.disabled ? true : selections[player.key as keyof typeof selections]}
                disabled={player.disabled}
                onChange={(e) => {
                  if (player.disabled) return;
                  setSelections((prev) => ({ ...prev, [player.key as string]: e.target.checked }));
                }}
                className="w-4 h-4 rounded border-gray-300 text-[#FF4655] focus:ring-[#FF4655]"
              />
              <span className="text-xs font-semibold text-[var(--c-text)]">{player.name}</span>
            </label>
          ))}
        </div>

        <button
          onClick={() => setConfirmed(true)}
          className="mt-2 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-5 py-2.5 rounded-lg transition-colors"
        >
          Confirm Roster Participation
        </button>
      </div>
    </div>
  );
}

function TournamentInfoSection() {
  return (
    <div className="space-y-6">
      <div className="dash-card p-6">
        <h3 className="font-head text-2xl font-bold text-white mb-2">MLBB Championship — Season 4</h3>
        <p className="text-xs text-[var(--c-text-dim)] leading-relaxed mb-6">
          The premier faith youth esports tournament. Bringing teams and draft players together in a single elimination championship.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Game Format", value: "5v5 Custom Draft" },
            { label: "Format", value: "Single Elimination" },
            { label: "Prize Pool", value: "₱100,000 PHP" },
            { label: "Matches Played", value: "2 / 7 Completed" },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-lg bg-[var(--c-surface3)] border border-[var(--c-border)]">
              <div className="text-[10px] uppercase tracking-wider text-[var(--c-text-muted)]">{stat.label}</div>
              <div className="font-head text-lg font-bold text-[#8B5CF6] mt-1">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card p-6 space-y-4">
        <div className="dash-section-title">Official Tournament Rules</div>
        <ul className="space-y-3 text-xs text-[var(--c-text-dim)] list-disc pl-4 leading-relaxed">
          <li>All matches are played on the latest game version of Mobile Legends: Bang Bang.</li>
          <li>Teams must arrive 15 minutes before their scheduled match time. Late arrival of more than 10 minutes results in a default loss.</li>
          <li>Free Agent Draft players can be pick-selected by organizations during the registration or draft windows.</li>
          <li>No toxicity, verbal abuse, or unsportsmanlike behavior will be tolerated. Immediate disqualification will apply to violators.</li>
        </ul>
      </div>
    </div>
  );
}

function DraftingSection({
  onAcceptDraft,
}: {
  onAcceptDraft: () => void;
}) {
  const [inviteStatus, setInviteStatus] = useState<"none" | "received" | "accepted" | "declined">("none");

  useEffect(() => {
    const t = setTimeout(() => {
      setInviteStatus("received");
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      <div className="dash-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B5CF6] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8B5CF6]"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6]">
              Draft Pool Active
            </span>
          </div>
          <h3 className="font-head text-xl font-bold text-white">Draft Lounge Status</h3>
          <p className="text-xs text-[var(--c-text-dim)]">
            Organizers are currently matching free agents with teams looking for roster fill-ins. Keep this page open to receive live invites.
          </p>
        </div>

        <div className="w-full md:w-48 bg-[var(--c-surface3)] h-2 rounded-full overflow-hidden border border-[var(--c-border)]">
          <div className="bg-[#8B5CF6] h-full animate-pulse" style={{ width: "75%" }} />
        </div>
      </div>

      {inviteStatus === "received" && (
        <div className="dash-card p-5 border border-[#8B5CF6]/50 bg-[#8B5CF6]/5 rounded-xl space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#8B5CF6]/25 text-[#8B5CF6] px-2 py-0.5 rounded">
              New Offer
            </span>
            <span className="text-[10px] text-[var(--c-text-muted)]">Just now</span>
          </div>

          <div className="space-y-1">
            <h4 className="font-head text-lg font-bold text-white uppercase">Roster Invite from Team Blaze</h4>
            <p className="text-xs text-[var(--c-text-dim)]">
              Team Blaze has offered you a slot as a Team Member on their active roster for the MLBB Championship S4!
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setInviteStatus("accepted");
                onAcceptDraft();
              }}
              className="bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
            >
              Accept Invite
            </button>
            <button
              onClick={() => setInviteStatus("declined")}
              className="dash-btn-ghost text-xs px-4 py-2 rounded-lg"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {inviteStatus === "accepted" && (
        <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-3">
          Roster invitation accepted! Converting dashboard to Team Member status.
        </div>
      )}

      {inviteStatus === "declined" && (
        <div className="bg-[#FF4655]/10 border border-[#FF4655]/30 text-[#FF4655] text-xs rounded-lg px-4 py-3">
          Declined roster offer from Team Blaze. Returning to draft lounge search.
        </div>
      )}

      <div className="dash-card p-5">
        <div className="dash-section-title">Draft Pool Queue</div>
        <div className="space-y-3 pt-2">
          {[
            { name: "John Dela Cruz (You)", ign: "JohnDC_MLBB", status: "Searching Team", role: "Flex / Gold Lane" },
            { name: "Carlos Mendez", ign: "CarM_XP", status: "Draft Match Pending", role: "XP Lane" },
            { name: "Sophia Lopez", ign: "SophL_Support", status: "Searching Team", role: "Roamer / Support" },
          ].map((agent, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)]"
            >
              <div>
                <div className="text-xs font-bold text-white">{agent.name}</div>
                <div className="text-[10px] text-[var(--c-text-dim)]">{agent.ign} • {agent.role}</div>
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  agent.status === "Searching Team" ? "bg-[#8B5CF6]/15 text-[#8B5CF6]" : "bg-[#00F5D4]/15 text-[#00F5D4]"
                }`}
              >
                {agent.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  profile: { title: "MY PROFILE", subtitle: "View and update your player profile" },
  chat: { title: "ORGANIZER CHAT", subtitle: "Communicate directly with tournament organizers" },
  team: { title: "MY TEAM", subtitle: "Team information and roster" },
  schedule: { title: "SCHEDULE", subtitle: "Upcoming matches and events" },
  standings: { title: "STANDINGS", subtitle: "Tournament leaderboard rankings" },
  brackets: { title: "BRACKETS", subtitle: "MLBB Championship — Season 4" },
  announcements: { title: "ANNOUNCEMENTS", subtitle: "Official updates from organizers" },
  livestream: { title: "LIVESTREAM", subtitle: "Watch live matches" },
  confirm_participation: { title: "CONFIRM PARTICIPATION", subtitle: "Confirm player eligibility and roster presence" },
  tournament_info: { title: "TOURNAMENT INFO", subtitle: "Championship rules, prize pools, and guidelines" },
  drafting: { title: "DRAFTING LOUNGE", subtitle: "Wait for drafting assignment and view invite offers" },
};

const LEADER_SIDEBAR_ITEMS = [
  { label: "Profile", section: "profile", icon: "user" },
  { label: "Organizer Chat", section: "chat", icon: "chat" },
  { label: "My Team", section: "team", icon: "team" },
  { label: "Schedule", section: "schedule", icon: "calendar" },
  { label: "Standings", section: "standings", icon: "standings" },
  { label: "Brackets", section: "brackets", icon: "bracket" },
  { label: "Announcements", section: "announcements", icon: "bell" },
  { label: "Livestream", section: "livestream", icon: "video" },
  { label: "Confirm Participation", section: "confirm_participation", icon: "confirm_participation" },
];

const MEMBER_SIDEBAR_ITEMS = [
  { label: "Profile", section: "profile", icon: "user" },
  { label: "My Team", section: "team", icon: "team" },
  { label: "Schedule", section: "schedule", icon: "calendar" },
  { label: "Standings", section: "standings", icon: "standings" },
  { label: "Brackets", section: "brackets", icon: "bracket" },
  { label: "Announcements", section: "announcements", icon: "bell" },
  { label: "Livestream", section: "livestream", icon: "video" },
];

const AGENT_SIDEBAR_ITEMS = [
  { label: "Profile", section: "profile", icon: "user" },
  { label: "Schedule", section: "schedule", icon: "calendar" },
  { label: "Announcements", section: "announcements", icon: "bell" },
  { label: "Tournament Info", section: "tournament_info", icon: "info" },
  { label: "Draft Lounge", section: "drafting", icon: "drafting" },
];

export default function GamerDashboard() {
  const [gamerType, setGamerType] = useState<"team_leader" | "team_member" | "free_agent">("team_leader");
  const [section, setSection] = useState("profile");

  const [name, setName] = useState("John Dela Cruz");
  const [ign, setIgn] = useState("JohnDC_MLBB");
  const [phone, setPhone] = useState("+63 912 345 6789");
  const [teamName, setTeamName] = useState("Team Blaze");
  const [confirmed, setConfirmed] = useState(false);

  const meta = SECTION_TITLES[section] ?? { title: section.toUpperCase(), subtitle: "" };

  const getSidebarConfig = () => {
    if (gamerType === "team_leader") {
      return {
        items: LEADER_SIDEBAR_ITEMS,
        label: "Team Leader",
        color: "#FF4655",
      };
    }
    if (gamerType === "team_member") {
      return {
        items: MEMBER_SIDEBAR_ITEMS,
        label: "Team Member",
        color: "#00F5D4",
      };
    }
    return {
      items: AGENT_SIDEBAR_ITEMS,
      label: "Free Agent",
      color: "#8B5CF6",
    };
  };

  const handleGamerTypeChange = (type: "team_leader" | "team_member" | "free_agent") => {
    setGamerType(type);
    const config =
      type === "team_leader"
        ? LEADER_SIDEBAR_ITEMS
        : type === "team_member"
        ? MEMBER_SIDEBAR_ITEMS
        : AGENT_SIDEBAR_ITEMS;
    if (!config.some((item) => item.section === section)) {
      setSection("profile");
    }
  };

  const handleAcceptDraft = () => {
    setTimeout(() => {
      setTeamName("Team Blaze");
      setGamerType("team_member");
      setSection("profile");
    }, 2000);
  };

  const renderSection = () => {
    switch (section) {
      case "profile":
        return (
          <ProfileSection
            gamerType={gamerType}
            name={name}
            setName={setName}
            ign={ign}
            setIgn={setIgn}
            phone={phone}
            setPhone={setPhone}
            teamName={teamName}
          />
        );
      case "chat":
        return <ChatSection />;
      case "team":
        return <TeamSection />;
      case "schedule":
        return <ScheduleSection />;
      case "standings":
        return <StandingsSection />;
      case "brackets":
        return <BracketManagementModule showActions={false} />;
      case "announcements":
        return <AnnouncementManagementModule showSubmitForm={false} />;
      case "livestream":
        return <LivestreamManagementModule showManageControls={false} />;
      case "confirm_participation":
        return <ConfirmParticipationSection confirmed={confirmed} setConfirmed={setConfirmed} />;
      case "tournament_info":
        return <TournamentInfoSection />;
      case "drafting":
        return <DraftingSection onAcceptDraft={handleAcceptDraft} />;
      default:
        return null;
    }
  };

  const sidebarConfig = getSidebarConfig();

  return (
    <div className="flex">
      <Sidebar
        role="gamer"
        activeSection={section}
        onSectionChange={setSection}
        customItems={sidebarConfig.items}
        customLabel={sidebarConfig.label}
        customColor={sidebarConfig.color}
      />
      <main
        className="flex-1"
        style={{
          minHeight: "calc(100vh - 60px)",
          overflowY: "auto",
          padding: "32px",
          backgroundColor: "var(--c-page-bg)",
        }}
      >
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--c-border)] pb-5">
          <div>
            <h2 className="font-head text-2xl font-bold tracking-wider text-white uppercase">Gamer Space</h2>
            <p className="text-xs text-[var(--c-text-dim)]">Simulated gamer sub-roles environment</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--c-surface)] border border-[var(--c-border)] self-start md:self-auto">
            {[
              { id: "team_leader", label: "Team Leader", color: "#FF4655" },
              { id: "team_member", label: "Team Member", color: "#00F5D4" },
              { id: "free_agent", label: "Free Agent", color: "#8B5CF6" },
            ].map((tab) => {
              const active = gamerType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleGamerTypeChange(tab.id as "team_leader" | "team_member" | "free_agent")}
                  className="px-3.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all"
                  style={{
                    backgroundColor: active ? tab.color : "transparent",
                    color: active ? "#000000" : "var(--c-text-muted)",
                    boxShadow: active ? `0 0 12px ${tab.color}40` : "none",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <PageHeader title={meta.title} subtitle={meta.subtitle} />
        {renderSection()}
      </main>
    </div>
  );
}
