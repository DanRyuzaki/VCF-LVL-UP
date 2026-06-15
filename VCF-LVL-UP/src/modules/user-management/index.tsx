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
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-[#808080] outline-none focus:border-[#FF4655] w-52 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors">
          <IconPlus size={13} /> Add User
        </button>
      </div>
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#232323]">
              {["UID","Name","Email","Role","Status","Created","Last Login","Actions"].map((h) => (
                <th key={h} className="text-left text-[10px] uppercase tracking-[1.5px] text-[#808080] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-[#2E2E2E] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-[11px] text-[#808080]">{u.id}</td>
                <td className="px-4 py-3 text-sm font-medium">{u.name}</td>
                <td className="px-4 py-3 text-xs text-[#B8B8B8]">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${roleBadge(u.role)}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${u.status === "active" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-[#232323] text-[#808080]"}`}>{u.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-[#808080]">{u.created}</td>
                <td className="px-4 py-3 text-xs text-[#808080]">{u.lastLogin}</td>
                <td className="px-4 py-3">
                  <button className="text-xs border border-[#2E2E2E] text-[#808080] hover:text-white hover:border-[#808080] px-3 py-1 rounded transition-all">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
