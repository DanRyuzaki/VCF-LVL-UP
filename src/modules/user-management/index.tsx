"use client";
// src/modules/user-management/index.tsx
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { IconSearch, IconPlus } from "@/components/shared/icons";
import AddUserModal from "@/modules/user-management/add-user-modal";
import AddAdminModal from "@/modules/user-management/add-admin-modal";
import ViewUserModal from "@/modules/user-management/view-user-modal";
import DeleteConfirmModal from "@/modules/user-management/delete-confirm-modal";
import ModalBackdrop from "@/components/shared/modal-backdrop";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created: string;
  lastLogin: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const roleBadge = (role: string) => {
  if (role === "Admin")     return "bg-[#FF4655]/20 text-[#FF4655]";
  if (role === "Organizer") return "bg-[#8B5CF6]/20 text-[#8B5CF6]";
  return "bg-[#00F5D4]/15 text-[#00F5D4]";
};

function formatTimestamp(val: unknown): string {
  if (!val) return "—";
  if (val instanceof Timestamp) {
    return val.toDate().toLocaleDateString("en-PH", { month: "short", day: "numeric" });
  }
  if (typeof val === "string") return val;
  return "—";
}

function parseDateStr(dateStr: string): number {
  if (!dateStr || dateStr === "—") return 0;
  const ts = Date.parse(`${dateStr}, ${new Date().getFullYear()}`);
  return isNaN(ts) ? 0 : ts;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface Props {
  context?: "admin" | "developer";
  onNavigate?: (section: string) => void;
}

export default function UserManagementModule({ context = "admin", onNavigate }: Props) {
  const isDev = context === "developer";
  const { profile: currentUserProfile } = useAuth();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // UI state
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("Name");
  const [sortBy, setSortBy] = useState("name_asc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewUser, setViewUser] = useState<UserRow | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [usersToDelete, setUsersToDelete] = useState<UserRow[] | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ------------------------------------------------------------------
  // Load users from Firestore on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    async function loadUsers() {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const rows: UserRow[] = snap.docs.map((d) => {
          const data = d.data();
          // Capitalise role for display (stored lowercase in Firestore)
          const roleDisplay =
            data.role === "admin"     ? "Admin"
            : data.role === "organizer" ? "Organizer"
            : data.role === "gamer"     ? "Gamer"
            : data.role === "developer" ? "Developer"
            : data.role ?? "—";

          const mi = data.middleInitial ? ` ${data.middleInitial}.` : "";
          return {
            id: d.id,
            name: `${data.firstName ?? ""}${mi} ${data.lastName ?? ""}`.trim(),
            email: data.email ?? "",
            role: roleDisplay,
            status: data.status ?? "inactive",
            created: formatTimestamp(data.createdAt),
            lastLogin: formatTimestamp(data.lastLogin),
          };
        });
        setUsers(rows);
      } catch (err) {
        console.error("Failed to load users from Firestore:", err);
        // Fall back to empty list — don't crash the UI
      } finally {
        setHydrated(true);
      }
    }
    loadUsers();
  }, []);

  // ------------------------------------------------------------------
  // Create user — Firebase Auth + Firestore write
  // ------------------------------------------------------------------
  const handleAddUser = async (data: Record<string, string>) => {
    setSaving(true);
    setSaveError("");

    try {
      // 1. Create Firebase Auth account
      const credential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.tempPassword
      );
      const uid = credential.user.uid;

      // 2. Determine the role string (lowercase for Firestore)
      const roleMap: Record<string, string> = {
        Organizer: "organizer",
        Gamer: "gamer",
        Admin: "admin",
      };
      const roleKey = roleMap[data.role] ?? "gamer";

      // 3. Write Firestore user document
      const userDoc: Record<string, unknown> = {
        uid,
        email: data.email,
        firstName: data.firstName,
        middleInitial: data.middleInitial || null,
        lastName: data.lastName,
        role: roleKey,
        gamerType: roleKey === "gamer" ? "free_agent" : null,
        teamId: null,
        inGameName: null,
        phone: null,
        status: (data.status ?? "Active").toLowerCase(),
        createdAt: serverTimestamp(),
        lastLogin: null,
        createdBy: currentUserProfile?.uid ?? null,
      };

      await setDoc(doc(db, "users", uid), userDoc);

      // 4. Optimistically add to local list
      const mi = data.middleInitial ? ` ${data.middleInitial}.` : "";
      const newRow: UserRow = {
        id: uid,
        name: `${data.firstName}${mi} ${data.lastName}`,
        email: data.email,
        role: data.role,
        status: (data.status ?? "Active").toLowerCase(),
        created: new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
        lastLogin: "—",
      };
      setUsers((prev) => [newRow, ...prev]);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/email-already-in-use") {
        setSaveError("That email is already registered.");
      } else if (code === "auth/weak-password") {
        setSaveError("Password must be at least 6 characters.");
      } else {
        setSaveError("Failed to create user. Please try again.");
        console.error(err);
      }
      return; // don't close modal — let the user fix it
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------------
  // Delete — writes deletion report to Firestore, removes from local list
  // ------------------------------------------------------------------
  const handleDeleteConfirm = async (reason: string) => {
    if (!usersToDelete || usersToDelete.length === 0) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const adminName = currentUserProfile
      ? `${currentUserProfile.firstName}${currentUserProfile.middleInitial ? ` ${currentUserProfile.middleInitial}.` : ""} ${currentUserProfile.lastName}`.trim()
      : "Admin";

    // 1. Delete each user's Firestore profile doc (client SDK; Auth account requires Admin SDK)
    const idsToDelete = usersToDelete.map((u) => u.id);
    await Promise.allSettled(
      idsToDelete.map((uid) => deleteDoc(doc(db, "users", uid)))
    );
    // NOTE: Firebase Auth account is NOT deleted here — the client SDK cannot delete
    // another user's Auth record. A Cloud Function triggered on users/{uid} deletion,
    // or an Admin SDK call from a secure backend, is required for full account removal.

    // Optimistically remove from local list
    setUsers((prev) => prev.filter((u) => !idsToDelete.includes(u.id)));

    // 2. Write rich deletion report to Firestore (matches deleted-reports/archived-section schema)
    try {
      const year = now.getFullYear();
      const reportId = `DR-${year}-${Date.now()}`;
      const reportDoc = {
        reportId,
        // Display fields used by the table + detail modal
        dateGenerated: dateStr,
        timeGenerated: timeStr,
        dateDeleted: dateStr,
        timeDeleted: timeStr,
        totalRecordsDeleted: usersToDelete.length,
        // Who did the deletion
        generatedBy: adminName,
        deletedBy: adminName,
        adminName,
        adminAccountId: currentUserProfile?.uid ?? "",
        adminRole: currentUserProfile?.role ?? "admin",
        adminEmail: currentUserProfile?.email ?? "",
        // What was deleted
        itemType: "User Account",
        deletedItemName: usersToDelete.length === 1
          ? usersToDelete[0].name
          : `${usersToDelete.length} users`,
        deletionCategory: "User Management",
        // The deleted users array
        deletedUsers: usersToDelete.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          statusBeforeDeletion: u.status,
          created: u.created,
        })),
        reason,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "deleted_user_reports", reportId), reportDoc);
    } catch (err) {
      console.error("Failed to write deletion report:", err);
      // Non-blocking — user already removed from local list
    }

    setSelectionMode(false);
    setSelectedUserIds([]);
    setUsersToDelete(null);
    setViewUser(null);
    setShowSuccessModal(true);
  };

  // ------------------------------------------------------------------
  // Filter + sort
  // ------------------------------------------------------------------
  const filtered = users.filter((u) => {
    const query = search.toLowerCase();
    if (!query) return true;
    if (filterBy === "Name")          return u.name.toLowerCase().includes(query);
    if (filterBy === "Email Address") return u.email.toLowerCase().includes(query);
    if (filterBy === "Role")          return u.role.toLowerCase().includes(query);
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name_asc")        return a.name.localeCompare(b.name);
    if (sortBy === "name_desc")       return b.name.localeCompare(a.name);
    if (sortBy === "created_newest")  return parseDateStr(b.created) - parseDateStr(a.created);
    if (sortBy === "created_oldest")  return parseDateStr(a.created) - parseDateStr(b.created);
    if (sortBy === "login_newest")    return parseDateStr(b.lastLogin) - parseDateStr(a.lastLogin);
    if (sortBy === "login_oldest")    return parseDateStr(a.lastLogin) - parseDateStr(b.lastLogin);
    if (sortBy === "status_active")   return (b.status === "active" ? 1 : 0) - (a.status === "active" ? 1 : 0);
    if (sortBy === "status_inactive") return (a.status === "active" ? 1 : 0) - (b.status === "active" ? 1 : 0);
    return 0;
  });

  const headers = isDev
    ? ["UID", "Name", "Email", "Role", "Status", "Created", "Last Login", "Actions"]
    : ["Name", "Email", "Role", "Status", "Created", "Last Login", "Actions"];

  if (!hydrated) {
    return <div className="text-center py-8 text-sm" style={{ color: "var(--c-text-dim)" }}>Loading users…</div>;
  }

  return (
    <div>
      {/* Save error banner */}
      {saveError && (
        <div style={{ marginBottom: "12px", padding: "10px 14px", backgroundColor: "rgba(255,70,85,0.08)", border: "1px solid rgba(255,70,85,0.2)", borderRadius: "8px", fontSize: "12px", color: "#FF4655" }}>
          {saveError}
          <button onClick={() => setSaveError("")} style={{ float: "right", background: "none", border: "none", color: "#FF4655", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Top Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          {selectionMode && selectedUserIds.length > 0 && (
            <span style={{ color: "var(--c-text-dim)", fontSize: "13px" }}>
              {selectedUserIds.length} user{selectedUserIds.length > 1 ? "s" : ""} selected
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {selectionMode && (
            <>
              <button
                onClick={() => {
                  if (selectedUserIds.length === 0) return;
                  setUsersToDelete(users.filter((u) => selectedUserIds.includes(u.id)));
                }}
                disabled={selectedUserIds.length === 0}
                style={{
                  fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                  height: "38px", padding: "0 16px", borderRadius: "6px",
                  backgroundColor: selectedUserIds.length > 0 ? "#FF4655" : "rgba(255, 70, 85, 0.05)",
                  border: selectedUserIds.length > 0 ? "1.5px solid #FF4655" : "1.5px solid var(--c-border)",
                  color: selectedUserIds.length > 0 ? "#FFFFFF" : "var(--c-text-dim)",
                  cursor: selectedUserIds.length > 0 ? "pointer" : "not-allowed", transition: "all 0.15s ease",
                }}
              >Delete</button>
              <button
                onClick={() => { setSelectionMode(false); setSelectedUserIds([]); }}
                style={{
                  fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                  height: "38px", padding: "0 16px", borderRadius: "6px",
                  backgroundColor: "transparent", border: "1.5px solid var(--c-border)",
                  color: "var(--c-text-dim)", cursor: "pointer", transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--c-text)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--c-text-dim)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--c-text-dim)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)"; }}
              >Cancel</button>
            </>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              backgroundColor: "#FF4655", color: "#FFFFFF",
              fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
              height: "38px", padding: "0 16px", borderRadius: "6px", border: "none", cursor: "pointer",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E53E4D")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FF4655")}
          >
            <IconPlus size={13} /> {isDev ? "Add Admin" : "Add User"}
          </button>
        </div>
      </div>

      {/* Filter / Search / Sort bar */}
      <div className="flex flex-wrap items-center gap-4 mb-5 p-3.5 rounded-lg" style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--c-surface2)", backdropFilter: "blur(10px)" }}>
        {/* Filter by */}
        <div className="flex items-center gap-2.5">
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: "1.1", color: "var(--c-text-dim)", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
            <span>Filter</span><span>By:</span>
          </div>
          <select value={filterBy} onChange={(e) => { setFilterBy(e.target.value); setSearch(""); }} className="dash-select"
            style={{ padding: "0 32px 0 12px", backgroundColor: "var(--c-surface3)", border: "1px solid var(--c-border)", borderRadius: "6px", color: "var(--c-text)", fontSize: "13px", outline: "none", cursor: "pointer", height: "38px", minWidth: "130px", appearance: "none", backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23808080' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
            <option value="Name">Name</option>
            <option value="Email Address">Email Address</option>
            <option value="Role">Role</option>
          </select>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2.5">
          <span style={{ color: "var(--c-text-dim)", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Search:</span>
          <div className="relative">
            <IconSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--c-text-dim)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${filterBy.toLowerCase()}...`}
              style={{ paddingLeft: "36px", paddingRight: "12px", height: "38px", width: "220px", fontSize: "13px", backgroundColor: "var(--c-surface3)", border: "1px solid var(--c-border)", borderRadius: "6px", color: "var(--c-text)", outline: "none" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--c-accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--c-border)")} />
          </div>
        </div>

        {/* Sort by */}
        <div className="flex items-center gap-2.5">
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: "1.1", color: "var(--c-text-dim)", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
            <span>Sort</span><span>By:</span>
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="dash-select"
            style={{ padding: "0 32px 0 12px", backgroundColor: "var(--c-surface3)", border: "1px solid var(--c-border)", borderRadius: "6px", color: "var(--c-text)", fontSize: "13px", outline: "none", cursor: "pointer", height: "38px", minWidth: "160px", appearance: "none", backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23808080' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
            <option value="name_asc">Name (A–Z)</option>
            <option value="name_desc">Name (Z–A)</option>
            <option value="created_newest">Date Created (Newest)</option>
            <option value="created_oldest">Date Created (Oldest)</option>
            <option value="login_newest">Last Login (Newest)</option>
            <option value="login_oldest">Last Login (Oldest)</option>
            <option value="status_active">Account Status (Active)</option>
            <option value="status_inactive">Account Status (Inactive)</option>
          </select>
        </div>

        {/* Select All */}
        <button
          onClick={() => {
            const allSelected = sorted.every((u) => selectedUserIds.includes(u.id));
            if (!selectionMode) { setSelectionMode(true); setSelectedUserIds(sorted.map((u) => u.id)); }
            else if (allSelected) { setSelectionMode(false); setSelectedUserIds([]); }
            else { setSelectedUserIds(sorted.map((u) => u.id)); }
          }}
          style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", height: "38px", padding: "0 16px", borderRadius: "6px", border: "1.5px solid #00D4FF", backgroundColor: selectionMode && sorted.every((u) => selectedUserIds.includes(u.id)) ? "rgba(0,212,255,0.15)" : "transparent", color: "#00D4FF", cursor: "pointer", transition: "all 0.15s ease", marginLeft: "auto" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,212,255,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = selectionMode && sorted.every((u) => selectedUserIds.includes(u.id)) ? "rgba(0,212,255,0.15)" : "transparent"; }}
        >
          {selectionMode && sorted.every((u) => selectedUserIds.includes(u.id)) ? "Deselect All" : "Select All"}
        </button>
      </div>

      {/* Table */}
      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {selectionMode && <th className="dash-th" style={{ width: "40px", paddingRight: 0 }}></th>}
              {headers.map((h) => <th key={h} className="dash-th">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {sorted.map((u) => {
              const isSelected = selectedUserIds.includes(u.id);
              return (
                <tr key={u.id} className="dash-tr">
                  {selectionMode && (
                    <td className="dash-td" style={{ width: "40px", paddingRight: 0 }}>
                      <input type="checkbox" checked={isSelected}
                        onChange={() => setSelectedUserIds((prev) => prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id])}
                        style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#FFC107" }} />
                    </td>
                  )}
                  {isDev && <td className="dash-td-dim font-mono" style={{ fontSize: "10px", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.id}</td>}
                  <td className="dash-td font-medium">{u.name}</td>
                  <td className="dash-td-muted">{u.email}</td>
                  <td className="dash-td"><span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${roleBadge(u.role)}`}>{u.role}</span></td>
                  <td className="dash-td">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${u.status === "active" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : u.status === "suspended" ? "bg-[#FF4655]/15 text-[#FF4655]" : ""}`} style={u.status !== "active" && u.status !== "suspended" ? { backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" } : {}}>{u.status}</span>
                  </td>
                  <td className="dash-td-dim">{u.created}</td>
                  <td className="dash-td-dim">{u.lastLogin}</td>
                  <td className="dash-td">
                    <button onClick={() => setViewUser(u)} className="dash-btn-ghost text-xs px-3 py-1 rounded">View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAddModal && (
        isDev
          ? <AddAdminModal onClose={() => setShowAddModal(false)} onSave={handleAddUser} />
          : <AddUserModal onClose={() => setShowAddModal(false)} onSave={handleAddUser} saving={saving} />
      )}

      {viewUser && !usersToDelete && (
        <ViewUserModal user={viewUser} context={context} onClose={() => setViewUser(null)} onDelete={() => setUsersToDelete([viewUser])} />
      )}

      {usersToDelete && (
        <DeleteConfirmModal usersToDelete={usersToDelete} onClose={() => setUsersToDelete(null)} onConfirm={handleDeleteConfirm} />
      )}

      {showSuccessModal && (
        <ModalBackdrop onClose={() => setShowSuccessModal(false)} title="Deletion Successful" maxWidth="440px">
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto" }}>
              <circle cx="28" cy="28" r="26" stroke="#00F5D4" strokeWidth="1.5" opacity="0.3" />
              <circle cx="28" cy="28" r="22" fill="rgba(0,245,212,0.06)" stroke="#00F5D4" strokeWidth="1.5" />
              <path d="M20 28L25 33L36 22" stroke="#00F5D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 style={{ textAlign: "center", fontSize: "16px", fontWeight: 700, color: "var(--c-text)", marginBottom: "8px" }}>Successfully deleted.</h3>
          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--c-text-muted)", lineHeight: 1.5, marginBottom: "24px" }}>
            You can download or export the deletion report from the Deleted Reports page.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button onClick={() => setShowSuccessModal(false)} className="dash-btn-ghost text-xs px-5 py-2.5 rounded-lg">Close</button>
            {onNavigate && (
              <button onClick={() => { setShowSuccessModal(false); onNavigate("deleted-reports"); }}
                className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2.5 rounded-lg transition-colors"
                style={{ backgroundColor: "var(--c-accent)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--c-accent-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--c-accent)")}
              >Go to Deleted Reports</button>
            )}
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
}
