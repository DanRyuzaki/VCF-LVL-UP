"use client";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { IconSearch, IconLock } from "@/components/shared/icons";
import SuspendModal from "@/modules/role-management/suspend-modal";
import RestoreModal from "@/modules/role-management/restore-modal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface UserRow {
  uid: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "suspended";
}

// ---------------------------------------------------------------------------
// Access Denied guard — rendered when non-developer reaches this module
// ---------------------------------------------------------------------------
function AccessDenied() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", gap: "16px", color: "var(--c-text-dim)" }}>
      <IconLock size={40} style={{ opacity: 0.4 }} />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--c-text)", marginBottom: "6px" }}>Access Restricted</p>
        <p style={{ fontSize: "13px", lineHeight: 1.6 }}>Only Developers can manage account roles and statuses.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Role badge colours
// ---------------------------------------------------------------------------
function roleBadge(role: string) {
  if (role === "admin")     return "bg-[#FF4655]/20 text-[#FF4655]";
  if (role === "organizer") return "bg-[#8B5CF6]/20 text-[#8B5CF6]";
  if (role === "developer") return "bg-[#F59E0B]/20 text-[#F59E0B]";
  return "bg-[#00F5D4]/15 text-[#00F5D4]"; // gamer
}

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------
export default function RoleManagementModule() {
  // ── Defense-in-depth: only developer may use this module ──
  const { profile } = useAuth();
  if (profile && profile.role !== "developer") return <AccessDenied />;

  return <RoleManagementInner />;
}

function RoleManagementInner() {
  const { profile: currentUser } = useAuth();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");

  const [suspendTarget, setSuspendTarget] = useState<UserRow | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<UserRow | null>(null);

  // ── Load all users from Firestore ──
  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const rows: UserRow[] = snap.docs.map((d) => {
          const data = d.data();
          const mi = data.middleInitial ? ` ${data.middleInitial}.` : "";
          return {
            uid: d.id,
            name: `${data.firstName ?? ""}${mi} ${data.lastName ?? ""}`.trim(),
            email: data.email ?? "",
            role: data.role ?? "gamer",
            status: data.status ?? "inactive",
          };
        });
        setUsers(rows);
      } catch (err) {
        console.error("role-management: failed to load users", err);
        setLoadError("Could not load users. Check your connection and try again.");
      } finally {
        setHydrated(true);
      }
    }
    load();
  }, []);

  // ── Suspend ──
  const handleSuspend = async (reason: string) => {
    if (!suspendTarget) return;
    await updateDoc(doc(db, "users", suspendTarget.uid), {
      status: "suspended",
      suspendedAt: serverTimestamp(),
      suspendedBy: currentUser?.uid ?? null,
      suspendReason: reason,
    });
    setUsers((prev) =>
      prev.map((u) => u.uid === suspendTarget.uid ? { ...u, status: "suspended" } : u)
    );
    setSuspendTarget(null);
  };

  // ── Restore ──
  const handleRestore = async () => {
    if (!restoreTarget) return;
    await updateDoc(doc(db, "users", restoreTarget.uid), {
      status: "active",
      restoredAt: serverTimestamp(),
      restoredBy: currentUser?.uid ?? null,
      suspendReason: null,
    });
    setUsers((prev) =>
      prev.map((u) => u.uid === restoreTarget.uid ? { ...u, status: "active" } : u)
    );
    setRestoreTarget(null);
  };

  // ── Filter ──
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.includes(q);
  });

  // ── Loading / error states ──
  if (!hydrated) {
    return <div className="text-center py-8 text-sm" style={{ color: "var(--c-text-dim)" }}>Loading users…</div>;
  }
  if (loadError) {
    return <div className="text-center py-8 text-sm" style={{ color: "#FF4655" }}>{loadError}</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Assign / Change Role — placeholder panel, intentionally disabled */}
        <div className="dash-card p-5">
          <div className="dash-section-title">Assign / Change Role</div>
          <div className="space-y-3">
            <p style={{ fontSize: "12px", color: "var(--c-text-dim)", lineHeight: 1.7 }}>
              Role changes follow the account creation hierarchy and are handled through the{" "}
              <strong style={{ color: "var(--c-text-muted)" }}>User Management</strong> module. Roles cannot be changed arbitrarily
              via this panel to preserve the permission chain:
            </p>
            <ul style={{ fontSize: "12px", color: "var(--c-text-dim)", lineHeight: 2, paddingLeft: "16px" }}>
              <li>Developer → creates Admins</li>
              <li>Admin → creates Organizers &amp; Gamers</li>
              <li>Organizer → promotes Gamers via draft flow</li>
            </ul>
            <div style={{ backgroundColor: "rgba(255,193,7,0.06)", border: "1px solid rgba(255,193,7,0.2)", borderRadius: "6px", padding: "10px 12px", fontSize: "11px", color: "#F59E0B", lineHeight: 1.6 }}>
              To reassign a role, delete the existing account and re-create it under the correct role.
            </div>
          </div>
        </div>

        {/* Account status summary */}
        <div className="dash-card p-5">
          <div className="dash-section-title">Account Summary</div>
          <div className="space-y-2">
            {(["active", "suspended", "inactive"] as const).map((s) => {
              const count = users.filter((u) => u.status === s).length;
              const color = s === "active" ? "#00F5D4" : s === "suspended" ? "#FF4655" : "var(--c-text-dim)";
              return (
                <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--c-border)" }}>
                  <span style={{ fontSize: "12px", color: "var(--c-text-dim)", textTransform: "capitalize" }}>{s}</span>
                  <span style={{ fontSize: "20px", fontWeight: 700, color }}>{count}</span>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
              <span style={{ fontSize: "12px", color: "var(--c-text-dim)" }}>Total</span>
              <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--c-text)" }}>{users.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions table */}
      <div className="dash-card p-5">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div className="dash-section-title" style={{ marginBottom: 0 }}>Account Actions</div>
          <div className="relative">
            <IconSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--c-text-dim)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              style={{ paddingLeft: "30px", paddingRight: "12px", height: "34px", width: "200px", fontSize: "12px", backgroundColor: "var(--c-surface3)", border: "1px solid var(--c-border)", borderRadius: "6px", color: "var(--c-text)", outline: "none" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--c-accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--c-border)")}
            />
          </div>
        </div>

        <div className="dash-table-wrap">
          <table className="w-full border-collapse">
            <thead className="dash-thead">
              <tr>
                {["Name", "Email", "Role", "Status", "Action"].map((h) => (
                  <th key={h} className="dash-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="dash-td text-center" style={{ color: "var(--c-text-dim)", padding: "32px" }}>
                    {search ? "No users match your search." : "No users found."}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.uid} className="dash-tr">
                    <td className="dash-td font-medium">{u.name}</td>
                    <td className="dash-td-muted" style={{ fontSize: "12px" }}>{u.email}</td>
                    <td className="dash-td">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${roleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="dash-td">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: u.status === "active" ? "rgba(0,245,212,0.15)" : u.status === "suspended" ? "rgba(255,70,85,0.15)" : "var(--c-surface3)",
                          color: u.status === "active" ? "#00F5D4" : u.status === "suspended" ? "#FF4655" : "var(--c-text-dim)",
                        }}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="dash-td">
                      {u.role === "developer" ? (
                        <span style={{ fontSize: "11px", color: "var(--c-text-dim)", fontStyle: "italic" }}>Protected</span>
                      ) : u.status === "suspended" ? (
                        <button
                          onClick={() => setRestoreTarget(u)}
                          className="bg-[#00F5D4]/20 text-[#00F5D4] hover:bg-[#00F5D4]/30 text-xs font-semibold px-3 py-1 rounded transition-colors"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => setSuspendTarget(u)}
                          className="dash-btn-ghost text-xs px-3 py-1 rounded"
                          style={{ color: "var(--c-text-dim)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#FF4655"; e.currentTarget.style.borderColor = "#FF4655"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--c-text-dim)"; e.currentTarget.style.borderColor = "var(--c-border)"; }}
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
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
