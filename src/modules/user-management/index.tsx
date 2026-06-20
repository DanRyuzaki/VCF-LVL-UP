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
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { fsAddPlayer } from "@/lib/organizer-context";
import { IconSearch, IconPlus } from "@/components/shared/icons";
import AddUserModal from "@/modules/user-management/add-user-modal";
import AddAdminModal from "@/modules/user-management/add-admin-modal";
import ViewUserModal from "@/modules/user-management/view-user-modal";
import DeleteConfirmModal from "@/modules/user-management/delete-confirm-modal";
import ModalBackdrop from "@/components/shared/modal-backdrop";
import {
  fsDeletePlayer,
  fsUpdatePlayer,
  fsUpdateTeam,
  fsDeleteTeam,
  fsUpdateUserTeamId,
} from "@/lib/organizer-context";

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
  /** Set when this user is the head of a team (populated lazily before delete) */
  leadsTeamName?: string;
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
  const [recoveryNotice, setRecoveryNotice] = useState("");

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
  // Create user — Firebase Auth + Firestore write.
  // If the Auth account already exists (orphaned from a previous deletion),
  // we recover it by looking up the original UID from deleted_user_reports,
  // then recreating the users + players docs without touching Auth at all.
  // The gamer's existing password is preserved; they can reset it from the
  // login page if needed.
  // ------------------------------------------------------------------
  const handleAddUser = async (data: Record<string, string>) => {
    setSaving(true);
    setSaveError("");

    // Shared helper — writes users doc + players doc given a known UID
    const writeFirestoreDocs = async (uid: string, roleKey: string) => {
      const fullName = `${data.firstName}${data.middleInitial ? ` ${data.middleInitial}.` : ""} ${data.lastName}`.trim();

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

      if (roleKey === "gamer") {
        await fsAddPlayer({
          name: fullName,
          email: data.email,
          ign: fullName,
          game: "MLBB",
          role: "Unassigned",
          rank: "Unranked",
          winRate: "—",
          kda: "—",
          history: [],
          drafted: false,
        });
      }

      // Optimistically add to local list
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
    };

    const roleMap: Record<string, string> = {
      Organizer: "organizer",
      Gamer: "gamer",
      Admin: "admin",
    };
    const roleKey = roleMap[data.role] ?? "gamer";

    try {
      // ── Normal path: create a fresh Firebase Auth account ──
      const credential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.tempPassword
      );
      await writeFirestoreDocs(credential.user.uid, roleKey);

    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";

      if (code === "auth/email-already-in-use") {
        // ── Recovery path: Auth account exists but Firestore docs were deleted ──
        // Check if a users doc already exists for this email (truly duplicate)
        const existingUserSnap = await getDocs(
          query(collection(db, "users"), where("email", "==", data.email))
        );
        if (!existingUserSnap.empty) {
          // A live users doc exists — this is a genuine duplicate, block it
          setSaveError("That email is already registered to an active account.");
          setSaving(false);
          return;
        }

        // No users doc → orphaned Auth account. Look up the original UID
        // from the deletion report we wrote when the account was deleted.
        const reportSnap = await getDocs(
          query(collection(db, "deleted_user_reports"), orderBy("createdAt", "desc"))
        );

        let orphanedUid: string | null = null;
        for (const reportDoc of reportSnap.docs) {
          const deletedUsers = reportDoc.data().deletedUsers as Array<{ id: string; email: string }> ?? [];
          const match = deletedUsers.find((u) => u.email === data.email);
          if (match) {
            orphanedUid = match.id;
            break;
          }
        }

        if (!orphanedUid) {
          // Auth account exists but we have no deletion record for it —
          // this account was created outside the app (e.g. directly in
          // Firebase console). We can't recover the UID client-side.
          setSaveError(
            "This email is already registered in the system but has no deletion record. Please contact a developer to recover this account."
          );
          setSaving(false);
          return;
        }

        // We have the UID — recreate the Firestore docs without touching Auth
        try {
          await writeFirestoreDocs(orphanedUid, roleKey);
          // Show a notice so the admin knows what happened
          setRecoveryNotice(
            `Account recovered. "${data.email}" already existed in Auth — their password was kept as-is. They can reset it from the login page if needed.`
          );
        } catch (recoveryErr) {
          console.error("Failed to recover orphaned account:", recoveryErr);
          setSaveError("Found the orphaned account but failed to recreate the profile. Please try again.");
        }
        setSaving(false);
        return;

      } else if (code === "auth/weak-password") {
        setSaveError("Password must be at least 6 characters.");
      } else {
        setSaveError("Failed to create user. Please try again.");
        console.error(err);
      }
      setSaving(false);
      return;
    }

    setSaving(false);
  };

  // ------------------------------------------------------------------
  // Pre-deletion leadership check — enriches UserRow with leadsTeamName
  // so the confirm modal can warn the admin about team cascade effects.
  // ------------------------------------------------------------------
  const enrichWithLeadership = async (rows: UserRow[]): Promise<UserRow[]> => {
    // Fetch all teams once (small collection, fine to read up-front)
    const teamsSnap = await getDocs(collection(db, "teams"));
    const enriched = await Promise.all(rows.map(async (u) => {
      if (u.role !== "Gamer") return u; // only gamers can be team leaders
      // Find the players doc for this user by email
      const playerSnap = await getDocs(
        query(collection(db, "players"), where("email", "==", u.email))
      );
      if (playerSnap.empty) return u;
      const playerDocId = playerSnap.docs[0].id;
      // Check if any team has this player as head
      const leaderTeam = teamsSnap.docs.find(
        (t) => t.data().headUid === playerDocId
      );
      return leaderTeam ? { ...u, leadsTeamName: leaderTeam.data().name as string } : u;
    }));
    return enriched;
  };

  // ------------------------------------------------------------------
  // Open delete confirm — run leadership check first so the modal
  // can warn the admin before they commit.
  // ------------------------------------------------------------------
  const openDeleteConfirm = async (rows: UserRow[]) => {
    const enriched = await enrichWithLeadership(rows);
    setUsersToDelete(enriched);
  };

  // ------------------------------------------------------------------
  // Delete — cascade: players doc, team (if leader), then users doc
  // ------------------------------------------------------------------
  const handleDeleteConfirm = async (reason: string) => {
    if (!usersToDelete || usersToDelete.length === 0) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const adminName = currentUserProfile
      ? `${currentUserProfile.firstName}${currentUserProfile.middleInitial ? ` ${currentUserProfile.middleInitial}.` : ""} ${currentUserProfile.lastName}`.trim()
      : "Admin";

    // Cascade for each deleted user:
    // 1. Find their players doc (if gamer)
    // 2a. If they lead a team → delete all team roster members' drafted state,
    //     then delete the team doc
    // 2b. If they're a drafted member (not leader) → remove from team roster
    // 3. Delete the players doc itself
    // 4. Delete the users doc
    for (const u of usersToDelete) {
      try {
        if (u.role === "Gamer") {
          // Find the players doc
          const playerSnap = await getDocs(
            query(collection(db, "players"), where("email", "==", u.email))
          );

          if (!playerSnap.empty) {
            const playerDocRef = playerSnap.docs[0];
            const playerDocId = playerDocRef.id;
            const playerData = playerDocRef.data();

            if (u.leadsTeamName) {
              // ── This gamer leads a team — cascade delete the whole team ──
              const teamSnap = await getDocs(
                query(collection(db, "teams"), where("headUid", "==", playerDocId))
              );
              for (const teamDoc of teamSnap.docs) {
                const team = teamDoc.data();
                // Release all confirmed members (except the leader who's being deleted)
                for (const memberName of (team.players as string[])) {
                  if (memberName === playerData.name) continue; // being deleted
                  const memberSnap = await getDocs(
                    query(collection(db, "players"), where("name", "==", memberName))
                  );
                  if (!memberSnap.empty) {
                    const mId = memberSnap.docs[0].id;
                    const mEmail = memberSnap.docs[0].data().email as string | undefined;
                    await fsUpdatePlayer(mId, { drafted: false, team: undefined });
                    if (mEmail) await fsUpdateUserTeamId(mEmail, null);
                  }
                }
                // Release pending members
                for (const pendingName of (team.pendingPlayers as string[] ?? [])) {
                  const pendingSnap = await getDocs(
                    query(collection(db, "players"), where("name", "==", pendingName))
                  );
                  if (!pendingSnap.empty) {
                    await fsUpdatePlayer(pendingSnap.docs[0].id, { pendingTeam: undefined });
                  }
                }
                await fsDeleteTeam(teamDoc.id);
              }
            } else if (playerData.drafted && playerData.team) {
              // ── Drafted member (not leader) — remove from roster ──
              const teamSnap = await getDocs(
                query(collection(db, "teams"), where("name", "==", playerData.team))
              );
              if (!teamSnap.empty) {
                const teamDoc = teamSnap.docs[0];
                const currentPlayers = (teamDoc.data().players as string[]).filter(
                  (n) => n !== playerData.name
                );
                await fsUpdateTeam(teamDoc.id, {
                  players: currentPlayers,
                  status: currentPlayers.length >= 5 ? "eligible" : "incomplete",
                });
              }
            } else if (playerData.pendingTeam) {
              // ── Pending member — remove from pending list ──
              const teamSnap = await getDocs(
                query(collection(db, "teams"), where("name", "==", playerData.pendingTeam))
              );
              if (!teamSnap.empty) {
                const teamDoc = teamSnap.docs[0];
                const currentPending = (teamDoc.data().pendingPlayers as string[] ?? []).filter(
                  (n) => n !== playerData.name
                );
                await fsUpdateTeam(teamDoc.id, { pendingPlayers: currentPending });
              }
            }

            // Delete the players doc itself
            await fsDeletePlayer(playerDocId);
          }
        }

        // Delete the users doc
        await deleteDoc(doc(db, "users", u.id));
      } catch (err) {
        console.error(`Failed cascade delete for user ${u.email}:`, err);
      }
    }

    // Optimistically remove from local list
    const idsToDelete = usersToDelete.map((u) => u.id);
    setUsers((prev) => prev.filter((u) => !idsToDelete.includes(u.id)));

    // 2. Write rich deletion report to Firestore
    try {
      const year = now.getFullYear();
      const reportId = `DR-${year}-${Date.now()}`;
      const reportDoc = {
        reportId,
        dateGenerated: dateStr,
        timeGenerated: timeStr,
        dateDeleted: dateStr,
        timeDeleted: timeStr,
        totalRecordsDeleted: usersToDelete.length,
        generatedBy: adminName,
        deletedBy: adminName,
        adminName,
        adminAccountId: currentUserProfile?.uid ?? "",
        adminRole: currentUserProfile?.role ?? "admin",
        adminEmail: currentUserProfile?.email ?? "",
        itemType: "User Account",
        deletedItemName: usersToDelete.length === 1
          ? usersToDelete[0].name
          : `${usersToDelete.length} users`,
        deletionCategory: "User Management",
        deletedUsers: usersToDelete.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          statusBeforeDeletion: u.status,
          created: u.created,
          leadsTeamName: u.leadsTeamName ?? null,
        })),
        reason,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "deleted_user_reports", reportId), reportDoc);
    } catch (err) {
      console.error("Failed to write deletion report:", err);
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

      {/* Recovery notice banner — shown when an orphaned Auth account was recovered */}
      {recoveryNotice && (
        <div style={{ marginBottom: "12px", padding: "10px 14px", backgroundColor: "rgba(0,245,212,0.07)", border: "1px solid rgba(0,245,212,0.25)", borderRadius: "8px", fontSize: "12px", color: "#00F5D4" }}>
          ✓ {recoveryNotice}
          <button onClick={() => setRecoveryNotice("")} style={{ float: "right", background: "none", border: "none", color: "#00F5D4", cursor: "pointer" }}>✕</button>
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
                  openDeleteConfirm(users.filter((u) => selectedUserIds.includes(u.id)));
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
            onClick={() => { setShowAddModal(true); setRecoveryNotice(""); setSaveError(""); }}
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
      <div className="flex flex-wrap items-center gap-4 mb-5 p-3.5 rounded-lg" style={{ border: "1px solid rgba(255, 255, 255, 0.08)", backgroundColor: "rgba(20, 20, 20, 0.6)", backdropFilter: "blur(10px)" }}>
        {/* Filter by */}
        <div className="flex items-center gap-2.5">
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: "1.1", color: "var(--c-text-dim)", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
            <span>Filter</span><span>By:</span>
          </div>
          <select value={filterBy} onChange={(e) => { setFilterBy(e.target.value); setSearch(""); }} className="dash-select"
            style={{ padding: "0 32px 0 12px", backgroundColor: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", color: "var(--c-text)", fontSize: "13px", outline: "none", cursor: "pointer", height: "38px", minWidth: "130px", appearance: "none", backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
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
              style={{ paddingLeft: "36px", paddingRight: "12px", height: "38px", width: "220px", fontSize: "13px", backgroundColor: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", color: "var(--c-text)", outline: "none" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--c-accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")} />
          </div>
        </div>

        {/* Sort by */}
        <div className="flex items-center gap-2.5">
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: "1.1", color: "var(--c-text-dim)", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
            <span>Sort</span><span>By:</span>
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="dash-select"
            style={{ padding: "0 32px 0 12px", backgroundColor: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", color: "var(--c-text)", fontSize: "13px", outline: "none", cursor: "pointer", height: "38px", minWidth: "160px", appearance: "none", backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
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
        <ViewUserModal user={viewUser} context={context} onClose={() => setViewUser(null)} onDelete={() => openDeleteConfirm([viewUser])} />
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