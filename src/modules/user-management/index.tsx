"use client";
import { useState } from "react";
import { IconSearch, IconPlus } from "@/components/shared/icons";

const mockUsers = [
  { id: "usr_001", name: "Marco Reyes",    email: "marco@faith.com",  role: "Organizer", status: "active",   created: "May 1",  lastLogin: "Jun 12" },
  { id: "usr_002", name: "John Dela Cruz", email: "john@faith.com",   role: "Gamer",     status: "active",   created: "May 3",  lastLogin: "Jun 11" },
  { id: "usr_003", name: "Ana Santos",     email: "ana@faith.com",    role: "Admin",     status: "active",   created: "Apr 20", lastLogin: "Jun 12" },
  { id: "usr_004", name: "Ben Torres",     email: "ben@faith.com",    role: "Gamer",     status: "inactive", created: "Apr 25", lastLogin: "May 30" },
  { id: "usr_005", name: "Liza Cruz",      email: "liza@faith.com",   role: "Gamer",     status: "active",   created: "May 10", lastLogin: "Jun 10" },
];

const roleBadge = (role: string) => {
  if (role === "Admin")     return "bg-[#FF4655]/20 text-[#FF4655]";
  if (role === "Organizer") return "bg-[#8B5CF6]/20 text-[#8B5CF6]";
  return "bg-[#00F5D4]/15 text-[#00F5D4]";
};

export default function UserManagementModule() {
  const [search, setSearch] = useState("");
  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--c-text-dim)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            style={{
              paddingLeft: "36px",
              paddingRight: "16px",
              paddingTop: "8px",
              paddingBottom: "8px",
              width: "220px",
              fontSize: "13px",
              backgroundColor: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              color: "var(--c-text)",
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--c-accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--c-border)")}
          />
        </div>
        <button className="flex items-center gap-2 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">
          <IconPlus size={13} /> Add User
        </button>
      </div>
      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {["UID","Name","Email","Role","Status","Created","Last Login","Actions"].map((h) => (
                <th key={h} className="dash-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="dash-tr">
                <td className="dash-td-dim font-mono">{u.id}</td>
                <td className="dash-td font-medium">{u.name}</td>
                <td className="dash-td-muted">{u.email}</td>
                <td className="dash-td">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${roleBadge(u.role)}`}>{u.role}</span>
                </td>
                <td className="dash-td">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${u.status === "active" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : ""}`} style={u.status !== "active" ? { backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" } : {}}>{u.status}</span>
                </td>
                <td className="dash-td-dim">{u.created}</td>
                <td className="dash-td-dim">{u.lastLogin}</td>
                <td className="dash-td">
                  <button className="dash-btn-ghost text-xs px-3 py-1 rounded">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
