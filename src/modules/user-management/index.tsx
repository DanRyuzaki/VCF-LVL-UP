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

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex items-center gap-4 mb-4">
        {/* Search input */}
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
              fontSize: "0.8125rem",
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

        {/* in Blue: Select All button (Admin only) */}
        {!isDev && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!selectionMode) {
                  setSelectionMode(true);
                  setSelectedUserIds(filtered.map((u) => u.id));
                } else {
                  const allSelected = filtered.every((u) => selectedUserIds.includes(u.id));
                  if (allSelected) {
                    setSelectionMode(false);
                    setSelectedUserIds([]);
                  } else {
                    setSelectedUserIds(filtered.map((u) => u.id));
                  }
                }
              }}
              style={{
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1.5px solid #00D4FF",
                backgroundColor: selectionMode ? "rgba(0, 212, 255, 0.1)" : "transparent",
                color: "#00D4FF",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 212, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = selectionMode ? "rgba(0, 212, 255, 0.1)" : "transparent";
              }}
            >
              {selectionMode && filtered.every((u) => selectedUserIds.includes(u.id)) ? "Deselect All" : "Select All"}
            </button>

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
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    padding: "8px 16px",
                    borderRadius: "8px",
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
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    padding: "8px 16px",
                    borderRadius: "8px",
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
          </div>
        )}

        <div className="ml-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
          >
            <IconPlus size={13} /> {isDev ? "Add Admin" : "Add User"}
          </button>
        </div>
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
            {filtered.map((u) => {
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
