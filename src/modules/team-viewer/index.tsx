"use client";
import StatCard from "@/components/shared/stat-card";

const roster = [
  { num: 1, name: "Marco Reyes",    ign: "MarcoRey_MLBB", role: "Team Leader", status: "active" },
  { num: 2, name: "John Dela Cruz", ign: "JohnDC_MLBB",   role: "Member",      status: "active" },
  { num: 3, name: "Liza Santos",    ign: "LizaS_MLBB",    role: "Member",      status: "active" },
  { num: 4, name: "Kevin Bautista", ign: "KevB_MLBB",     role: "Member",      status: "active" },
];

export default function TeamViewerModule() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard value="Team Blaze" label="Team Name"    accent="teal" />
        <StatCard value="4/5"        label="Roster Slots" accent="red" />
        <StatCard value="MLBB"       label="Game" />
      </div>

      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {["#", "Player", "In-Game Name", "Role", "Status"].map((h) => (
                <th key={h} className="dash-th">{h}</th>
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
                    style={r.role !== "Team Leader" ? { backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" } : {}}
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