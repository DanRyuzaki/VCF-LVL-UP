"use client";
import { useState, useEffect } from "react";
import { IconSearch, IconPlus } from "@/components/shared/icons";
import AddUserModal from "@/modules/user-management/add-user-modal";
import AddAdminModal from "@/modules/user-management/add-admin-modal";
import ViewUserModal from "@/modules/user-management/view-user-modal";
import DeleteConfirmModal from "@/modules/user-management/delete-confirm-modal";
import ModalBackdrop from "@/components/shared/modal-backdrop";

const initialUsers = [
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

interface Props {
  context?: "admin" | "developer";
  onNavigate?: (section: string) => void;
}

export default function UserManagementModule({ context = "admin", onNavigate }: Props) {
  const isDev = context === "developer";
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("Name");
  const [sortBy, setSortBy] = useState("name_asc");
  const [users, setUsers] = useState(initialUsers);
  const [hydrated, setHydrated] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewUser, setViewUser] = useState<(typeof initialUsers)[0] | null>(null);
  
  // Selection mode states
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Deletion process states
  const [usersToDelete, setUsersToDelete] = useState<(typeof initialUsers)[0][] | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Hydration effect to load users from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("vcf_users");
    if (saved) {
      setUsers(JSON.parse(saved));
    } else {
      localStorage.setItem("vcf_users", JSON.stringify(initialUsers));
    }
    setHydrated(true);
  }, []);

  // Sync users to localStorage on update
  const saveUsers = (updatedList: typeof users) => {
    setUsers(updatedList);
    localStorage.setItem("vcf_users", JSON.stringify(updatedList));
  };

  const filtered = users.filter((u) => {
    const query = search.toLowerCase();
    if (!query) return true;
    if (filterBy === "Name") {
      return u.name.toLowerCase().includes(query);
    } else if (filterBy === "Email Address") {
      return u.email.toLowerCase().includes(query);
    } else if (filterBy === "Role") {
      return u.role.toLowerCase().includes(query);
    }
    return true;
  });

  const parseDateStr = (dateStr: string) => {
    if (!dateStr || dateStr === "—") return 0;
    const currentYear = new Date().getFullYear();
    const timestamp = Date.parse(`${dateStr}, ${currentYear}`);
    return isNaN(timestamp) ? 0 : timestamp;
  };

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name_asc") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "name_desc") {
      return b.name.localeCompare(a.name);
    }
    if (sortBy === "created_newest") {
      return parseDateStr(b.created) - parseDateStr(a.created);
    }
    if (sortBy === "created_oldest") {
      return parseDateStr(a.created) - parseDateStr(b.created);
    }
    if (sortBy === "login_newest") {
      return parseDateStr(b.lastLogin) - parseDateStr(a.lastLogin);
    }
    if (sortBy === "login_oldest") {
      return parseDateStr(a.lastLogin) - parseDateStr(b.lastLogin);
    }
    if (sortBy === "status_active") {
      const statusA = a.status.toLowerCase() === "active" ? 1 : 0;
      const statusB = b.status.toLowerCase() === "active" ? 1 : 0;
      return statusB - statusA;
    }
    if (sortBy === "status_inactive") {
      const statusA = a.status.toLowerCase() === "active" ? 1 : 0;
      const statusB = b.status.toLowerCase() === "active" ? 1 : 0;
      return statusA - statusB;
    }
    return 0;
  });

  const handleAddUser = (data: Record<string, string>) => {
    const newId = `usr_${String(users.length + 1).padStart(3, "0")}`;
    const mi = data.middleInitial ? ` ${data.middleInitial}.` : "";
    const updated = [
      ...users,
      {
        id: newId,
        name: `${data.firstName}${mi} ${data.lastName}`,
        email: data.email,
        role: data.role || "Admin",
        status: data.status?.toLowerCase() || "active",
        created: new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
        lastLogin: "—",
      },
    ];
    saveUsers(updated);
  };

  const handleDeleteConfirm = (reason: string) => {
    if (!usersToDelete || usersToDelete.length === 0) return;
    const idsToDelete = usersToDelete.map(u => u.id);
    const updated = users.filter((u) => !idsToDelete.includes(u.id));
    saveUsers(updated);

    // Save deletion report to localStorage
    const savedReports = localStorage.getItem("vcf_deleted_reports");
    const reports = savedReports ? JSON.parse(savedReports) : [];
    
    // Auto-increment sequence number
    const year = new Date().getFullYear();
    const nextSeq = String(reports.length + 1).padStart(5, "0");
    const reportId = `DR-${year}-${nextSeq}`;

    // Format current date and time
    const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    
    // Format AM/PM manually or using system
    const formatTime = () => {
      const d = new Date();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      return `${hours}:${minutes} ${ampm}`;
    };
    const timeStr = formatTime();

    // Construct activity log timestamps
    const getLogTime = (offsetSec = 0) => {
      const d = new Date(Date.now() - offsetSec * 1000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      const sec = String(d.getSeconds()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
    };

    const newReport = {
      reportId,
      dateGenerated: dateStr,
      timeGenerated: timeStr,
      totalRecordsDeleted: usersToDelete.length,
      generatedBy: "Maria Santos", // Mocked Admin Name
      adminName: "Maria Santos",
      adminRole: "Administrator",
      adminEmail: "maria@wbc.org",
      adminAccountId: "ADM-001",
      deletedUsers: usersToDelete.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        statusBeforeDeletion: u.status,
        created: u.created,
      })),
      dateDeleted: dateStr,
      timeDeleted: timeStr,
      deletedBy: "Maria Santos",
      deletionCategory: "User Account Removal",
      reason: reason,
      activityLog: [
        { time: getLogTime(13), description: `Administrator Maria Santos opened User Details.` },
        { time: getLogTime(7), description: `Administrator Maria Santos selected ${usersToDelete.length > 1 ? "multiple users" : "Delete User"}.` },
        { time: getLogTime(3), description: `Deletion reason submitted: "${reason}"` },
        { time: getLogTime(0), description: `User Account(s) ${usersToDelete.map(u => `${u.id} (${u.name})`).join(", ")} permanently deleted.` },
        { time: getLogTime(0), description: `Deletion activity successfully recorded in Deleted Reports.` },
      ],
      verifiedBy: "Developer",
      verificationDate: dateStr,
    };

    localStorage.setItem("vcf_deleted_reports", JSON.stringify([newReport, ...reports]));

    // Reset selection and deletion modal state
    setSelectionMode(false);
    setSelectedUserIds([]);
    setUsersToDelete(null);
    setViewUser(null);
    setShowSuccessModal(true);
  };

  /* Table headers differ based on context */
  const headers = isDev
    ? ["UID", "Name", "Email", "Role", "Status", "Created", "Last Login", "Actions"]
    : ["Name", "Email", "Role", "Status", "Created", "Last Login", "Actions"];

  if (!hydrated) {
    return <div className="text-center py-8 text-sm" style={{ color: "var(--c-text-dim)" }}>Loading users...</div>;
  }

  return (
    <div>
      {/* Top Header Row - Outside of Table/Filter Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        {/* Left side: Selection status */}
        <div>
          {selectionMode && selectedUserIds.length > 0 && (
            <span style={{ color: "var(--c-text-dim)", fontSize: "13px" }}>
              {selectedUserIds.length} user{selectedUserIds.length > 1 ? "s" : ""} selected
            </span>
          )}
        </div>

        {/* Right side: Add and Multi-delete action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {selectionMode && (
            <>
              <button
                onClick={() => {
                  if (selectedUserIds.length === 0) return;
                  const items = users.filter((u) => selectedUserIds.includes(u.id));
                  setUsersToDelete(items);
                }}
                disabled={selectedUserIds.length === 0}
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  height: "38px",
                  padding: "0 16px",
                  borderRadius: "6px",
                  backgroundColor: selectedUserIds.length > 0 ? "#FF4655" : "rgba(255, 70, 85, 0.05)",
                  border: selectedUserIds.length > 0 ? "1.5px solid #FF4655" : "1.5px solid var(--c-border)",
                  color: selectedUserIds.length > 0 ? "#FFFFFF" : "var(--c-text-dim)",
                  cursor: selectedUserIds.length > 0 ? "pointer" : "not-allowed",
                  transition: "all 0.15s ease",
                }}
                title="Delete Selected Users"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedUserIds([]);
                }}
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  height: "38px",
                  padding: "0 16px",
                  borderRadius: "6px",
                  backgroundColor: "transparent",
                  border: "1.5px solid var(--c-border)",
                  color: "var(--c-text-dim)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--c-text)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--c-text-dim)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--c-text-dim)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)";
                }}
              >
                Cancel
              </button>
            </>
          )}

          {/* Add User/Admin Button */}
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#FF4655",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              height: "38px",
              padding: "0 16px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E53E4D")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FF4655")}
          >
            <IconPlus size={13} /> {isDev ? "Add Admin" : "Add User"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-5 p-3.5 rounded-lg" style={{ border: "1px solid rgba(255, 255, 255, 0.08)", backgroundColor: "rgba(20, 20, 20, 0.6)", backdropFilter: "blur(10px)" }}>
        {/* Filter Dropdown */}
        <div className="flex items-center gap-2.5">
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: "1.1", color: "var(--c-text-dim)", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
            <span>Filter</span>
            <span>By:</span>
          </div>
          <select
            value={filterBy}
            onChange={(e) => {
              setFilterBy(e.target.value);
              setSearch(""); // clear search on filter criteria change
            }}
            className="dash-select"
            style={{
              padding: "0 32px 0 12px",
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "6px",
              color: "var(--c-text)",
              fontSize: "13px",
              outline: "none",
              cursor: "pointer",
              height: "38px",
              minWidth: "130px",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
            }}
          >
            <option value="Name">Name</option>
            <option value="Email Address">Email Address</option>
            <option value="Role">Role</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2.5">
          <span style={{ color: "var(--c-text-dim)", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Search:</span>
          <div className="relative">
            <IconSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--c-text-dim)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${filterBy.toLowerCase()}...`}
              style={{
                paddingLeft: "36px",
                paddingRight: "12px",
                height: "38px",
                width: "220px",
                fontSize: "13px",
                backgroundColor: "rgba(0, 0, 0, 0.45)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "6px",
                color: "var(--c-text)",
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--c-accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)")}
            />
          </div>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2.5">
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: "1.1", color: "var(--c-text-dim)", fontSize: "10px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
            <span>Sort</span>
            <span>By:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="dash-select"
            style={{
              padding: "0 32px 0 12px",
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "6px",
              color: "var(--c-text)",
              fontSize: "13px",
              outline: "none",
              cursor: "pointer",
              height: "38px",
              minWidth: "160px",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
            }}
          >
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

        {/* Select All / Deselect All Button (visible contextually or for all role dashboard checks) */}
        <button
          onClick={() => {
            const allSelected = sorted.every((u) => selectedUserIds.includes(u.id));
            if (!selectionMode) {
              setSelectionMode(true);
              setSelectedUserIds(sorted.map((u) => u.id));
            } else {
              if (allSelected) {
                setSelectionMode(false);
                setSelectedUserIds([]);
              } else {
                setSelectedUserIds(sorted.map((u) => u.id));
              }
            }
          }}
          style={{
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            height: "38px",
            padding: "0 16px",
            borderRadius: "6px",
            border: "1.5px solid #00D4FF",
            backgroundColor: selectionMode && sorted.every((u) => selectedUserIds.includes(u.id)) ? "rgba(0, 212, 255, 0.15)" : "transparent",
            color: "#00D4FF",
            cursor: "pointer",
            transition: "all 0.15s ease",
            marginLeft: "auto"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 212, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = selectionMode && sorted.every((u) => selectedUserIds.includes(u.id)) ? "rgba(0, 212, 255, 0.15)" : "transparent";
          }}
        >
          {selectionMode && sorted.every((u) => selectedUserIds.includes(u.id)) ? "Deselect All" : "Select All"}
        </button>
      </div>

      <div className="dash-table-wrap">
        <table className="w-full border-collapse">
          <thead className="dash-thead">
            <tr>
              {selectionMode && <th className="dash-th" style={{ width: "40px", paddingRight: 0 }}></th>}
              {headers.map((h) => (
                <th key={h} className="dash-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((u) => {
              const isSelected = selectedUserIds.includes(u.id);
              return (
                <tr key={u.id} className="dash-tr">
                  {selectionMode && (
                    <td className="dash-td" style={{ width: "40px", paddingRight: 0 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedUserIds((prev) =>
                            prev.includes(u.id)
                              ? prev.filter((id) => id !== u.id)
                              : [...prev, u.id]
                          );
                        }}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                          accentColor: "#FFC107", // In Yellow selection indicators
                        }}
                      />
                    </td>
                  )}
                  {isDev && <td className="dash-td-dim font-mono">{u.id}</td>}
                  <td className="dash-td font-medium">{u.name}</td>
                  <td className="dash-td-muted">{u.email}</td>
                  <td className="dash-td">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${roleBadge(u.role)}`}>{u.role}</span>
                  </td>
                  <td className="dash-td">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${u.status === "active" ? "bg-[#00F5D4]/15 text-[#00F5D4]" : u.status === "suspended" ? "bg-[#FF4655]/15 text-[#FF4655]" : ""}`} style={u.status !== "active" && u.status !== "suspended" ? { backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" } : {}}>{u.status}</span>
                  </td>
                  <td className="dash-td-dim">{u.created}</td>
                  <td className="dash-td-dim">{u.lastLogin}</td>
                  <td className="dash-td">
                    <button
                      onClick={() => setViewUser(u)}
                      className="dash-btn-ghost text-xs px-3 py-1 rounded"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add User / Add Admin Modal */}
      {showAddModal && (
        isDev
          ? <AddAdminModal onClose={() => setShowAddModal(false)} onSave={handleAddUser} />
          : <AddUserModal onClose={() => setShowAddModal(false)} onSave={handleAddUser} />
      )}

      {/* View User Modal */}
      {viewUser && !usersToDelete && (
        <ViewUserModal
          user={viewUser}
          context={context}
          onClose={() => setViewUser(null)}
          onDelete={() => setUsersToDelete([viewUser])}
        />
      )}

      {/* Delete Confirmation Modal */}
      {usersToDelete && (
        <DeleteConfirmModal
          usersToDelete={usersToDelete}
          onClose={() => setUsersToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <ModalBackdrop onClose={() => setShowSuccessModal(false)} title="Deletion Successful" maxWidth="440px">
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            {/* Green Check Icon */}
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto" }}>
              <circle cx="28" cy="28" r="26" stroke="#00F5D4" strokeWidth="1.5" opacity="0.3" />
              <circle cx="28" cy="28" r="22" fill="rgba(0,245,212,0.06)" stroke="#00F5D4" strokeWidth="1.5" />
              <path
                d="M20 28L25 33L36 22"
                stroke="#00F5D4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h3 style={{ textAlign: "center", fontSize: "16px", fontWeight: 700, color: "var(--c-text)", marginBottom: "8px" }}>
            Successfully deleted.
          </h3>
          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--c-text-muted)", lineHeight: 1.5, marginBottom: "24px" }}>
            You can download or export the deletion report from the Deleted Reports page.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="dash-btn-ghost text-xs px-5 py-2.5 rounded-lg"
            >
              Close
            </button>
            {onNavigate && (
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigate("deleted-reports");
                }}
                className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2.5 rounded-lg transition-colors"
                style={{ backgroundColor: "var(--c-accent)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--c-accent-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--c-accent)")}
              >
                Go to Deleted Reports
              </button>
            )}
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
}
