"use client";
import { useState } from "react";
import StatCard from "@/components/shared/stat-card";

export default function ProfileManagementModule() {
  const [editing, setEditing] = useState(false);
  const [name,  setName]  = useState("John Dela Cruz");
  const [ign,   setIgn]   = useState("JohnDC_MLBB");
  const [phone, setPhone] = useState("+63 912 345 6789");

  const fields: [string, string, (v: string) => void][] = [
    ["Full Name",     name,  setName],
    ["In-Game Name",  ign,   setIgn],
    ["Phone Number",  phone, setPhone],
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-head text-2xl font-bold"
          style={{
            backgroundColor: "var(--c-surface3)",
            border: "2px solid var(--c-accent)",
            color: "var(--c-accent)",
          }}
        >
          JD
        </div>
        <div>
          <div className="font-head text-xl font-bold uppercase tracking-wide" style={{ color: "var(--c-text)" }}>{name}</div>
          <div className="text-sm" style={{ color: "var(--c-text-muted)" }}>{ign}</div>
          <span className="inline-block mt-1 bg-[#00F5D4]/15 text-[#00F5D4] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
            Team Member
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard value="Team Blaze" label="Current Team" accent="teal" />
        <StatCard value="MLBB"       label="Game" />
        <StatCard value="4/5"        label="Roster Filled" accent="red" />
      </div>

      <div className="dash-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="dash-section-title" style={{ marginBottom: 0 }}>Update Profile</div>
          <button onClick={() => setEditing(!editing)} className="dash-btn-ghost text-xs px-3 py-1 rounded">
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fields.map(([label, val, setter]) => (
            <div key={label}>
              <label className="dash-label">{label}</label>
              <input
                value={val}
                onChange={(e) => setter(e.target.value)}
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