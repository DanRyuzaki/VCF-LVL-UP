"use client";
import { useState } from "react";
import SuspendModal from "@/modules/role-management/suspend-modal";
import RestoreModal from "@/modules/role-management/restore-modal";

interface User {
  name: string;
  role: string;
  status: string;
}

export default function RoleManagementModule() {
  const [users, setUsers] = useState<User[]>([
    { name: "John Dela Cruz", role: "Gamer", status: "active" },
    { name: "Ben Torres",     role: "Gamer", status: "suspended" },
    { name: "Liza Cruz",      role: "Gamer", status: "active" },
  ]);

  const [suspendTarget, setSuspendTarget] = useState<{ name: string; role: string } | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<{ name: string; role: string } | null>(null);

  const handleSuspend = () => {
    if (!suspendTarget) return;
    setUsers((prev) =>
      prev.map((u) => (u.name === suspendTarget.name ? { ...u, status: "suspended" } : u))
    );
    setSuspendTarget(null);
  };

  const handleRestore = () => {
    if (!restoreTarget) return;
    setUsers((prev) =>
      prev.map((u) => (u.name === restoreTarget.name ? { ...u, status: "active" } : u))
    );
    setRestoreTarget(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="dash-card p-5">
          <div className="dash-section-title">Assign / Change Role</div>
          <div className="space-y-3">
            <div>
              <label className="dash-label">Select User</label>
              <select className="dash-select">
                <option>Marco Reyes</option>
                <option>Anna Cruz</option>
                <option>John Dela Cruz</option>
              </select>
            </div>
            <div>
              <label className="dash-label">New Role</label>
              <select className="dash-select">
                <option>Admin</option>
                <option>Organizer</option>
                <option>Gamer</option>
              </select>
            </div>
            <button className="w-full bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-colors">
              Update Role
            </button>
          </div>
        </div>

        <div className="dash-card p-5">
          <div className="dash-section-title">Account Actions</div>
          {users.map((u) => (
            <div key={u.name} className="dash-row-item">
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--c-text)" }}>{u.name}</div>
                <div className="text-xs" style={{ color: "var(--c-text-dim)" }}>{u.role} · {u.status}</div>
              </div>
              {u.status === "active" ? (
                <button
                  onClick={() => setSuspendTarget({ name: u.name, role: u.role })}
                  className="dash-btn-ghost text-xs px-3 py-1 rounded"
                  style={{ color: "var(--c-text-dim)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#FF4655"; e.currentTarget.style.borderColor = "#FF4655"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--c-text-dim)"; e.currentTarget.style.borderColor = "var(--c-border)"; }}
                >
                  Suspend
                </button>
              ) : (
                <button
                  onClick={() => setRestoreTarget({ name: u.name, role: u.role })}
                  className="bg-[#00F5D4]/20 text-[#00F5D4] hover:bg-[#00F5D4]/30 text-xs font-semibold px-3 py-1 rounded transition-colors"
                >
                  Restore
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {suspendTarget && (
        <SuspendModal
          userName={suspendTarget.name}
          userRole={suspendTarget.role}
          onClose={() => setSuspendTarget(null)}
          onConfirm={handleSuspend}
        />
      )}

      {restoreTarget && (
        <RestoreModal
          userName={restoreTarget.name}
          userRole={restoreTarget.role}
          onClose={() => setRestoreTarget(null)}
          onConfirm={handleRestore}
        />
      )}
    </>
  );
}