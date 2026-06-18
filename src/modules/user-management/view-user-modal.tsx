"use client";
import ModalBackdrop from "@/components/shared/modal-backdrop";

interface ViewUserModalProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    created: string;
    lastLogin: string;
  };
  context: "admin" | "developer";
  onClose: () => void;
  onDelete: () => void;
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid var(--c-border)",
      }}
    >
      <span style={{ fontSize: "12px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </span>
      <span style={{ fontSize: "13px", fontWeight: 500, color: accent || "var(--c-text)" }}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  const isSuspended = status === "suspended";
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
      style={{
        backgroundColor: isActive
          ? "rgba(0,245,212,0.15)"
          : isSuspended
          ? "rgba(255,70,85,0.15)"
          : "var(--c-surface3)",
        color: isActive ? "#00F5D4" : isSuspended ? "#FF4655" : "var(--c-text-dim)",
      }}
    >
      {status}
    </span>
  );
}

export default function ViewUserModal({ user, context, onClose, onDelete }: ViewUserModalProps) {
  const isAdmin = context === "admin";

  return (
    <ModalBackdrop
      onClose={onClose}
      title="User Details"
      subtitle={isAdmin ? "Profile and activity information" : "Complete user record with system data"}
      maxWidth="540px"
    >
      {/* User header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,70,85,0.1)",
            border: "1.5px solid var(--c-accent)",
            color: "var(--c-accent)",
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "16px",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {user.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--c-text)" }}>{user.name}</div>
          <div style={{ fontSize: "12px", color: "var(--c-text-muted)" }}>{user.email}</div>
        </div>
      </div>

      {/* Section: Profile Information */}
      <div style={{ marginBottom: "20px" }}>
        <div className="dash-section-title" style={{ marginBottom: "8px" }}>
          Profile Information
        </div>
        <div
          style={{
            backgroundColor: "var(--c-surface2)",
            border: "1px solid var(--c-border)",
            borderRadius: "8px",
            padding: "4px 16px",
          }}
        >
          <InfoRow label="Full Name" value={user.name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Assigned Role" value={user.role} accent={
            user.role === "Admin" ? "#FF4655" : user.role === "Organizer" ? "#8B5CF6" : "#00F5D4"
          } />
          <InfoRow label="Account Status" value={user.status} />
          <InfoRow label="Registration Date" value={user.created} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
            <span style={{ fontSize: "12px", color: "var(--c-text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Status
            </span>
            <StatusBadge status={user.status} />
          </div>
        </div>
      </div>

      {/* Developer-only: Internal Data */}
      {!isAdmin && (
        <div style={{ marginBottom: "20px" }}>
          <div className="dash-section-title" style={{ marginBottom: "8px" }}>
            Internal System Data
          </div>
          <div
            style={{
              backgroundColor: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              padding: "4px 16px",
            }}
          >
            <InfoRow label="Internal UID" value={user.id} accent="#FF4655" />
            <InfoRow label="Last Login" value={user.lastLogin} />
            <InfoRow label="Account Created" value={user.created} />
            <InfoRow label="Auth Provider" value="Firebase Auth" />
            <InfoRow label="Role History" value={`${user.role} (since ${user.created})`} />
          </div>
        </div>
      )}

      {/* Activity Summary (Admin) */}
      {isAdmin && (
        <div style={{ marginBottom: "20px" }}>
          <div className="dash-section-title" style={{ marginBottom: "8px" }}>
            Activity Summary
          </div>
          <div
            style={{
              backgroundColor: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              padding: "4px 16px",
            }}
          >
            <InfoRow label="Last Login" value={user.lastLogin} />
            <InfoRow label="Total Logins" value="23" />
            <InfoRow label="Tournaments Joined" value={user.role === "Gamer" ? "2" : "—"} />
            <InfoRow label="Matches Played" value={user.role === "Gamer" ? "9" : "—"} />
          </div>
        </div>
      )}

      {/* Tournament Participation (Admin) */}
      {isAdmin && user.role === "Gamer" && (
        <div style={{ marginBottom: "20px" }}>
          <div className="dash-section-title" style={{ marginBottom: "8px" }}>
            Tournament Participation History
          </div>
          <div
            style={{
              backgroundColor: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "var(--c-surface3)" }}>
                <tr>
                  {["Tournament", "Season", "Team", "Result"].map((h) => (
                    <th key={h} className="dash-th" style={{ padding: "10px 12px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "MLBB Championship", season: "S4", team: "Team Blaze", result: "Ongoing" },
                  { name: "MLBB Championship", season: "S3", team: "Team Blaze", result: "Semi-Finals" },
                ].map((t, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--c-border)" }}>
                    <td style={{ padding: "10px 12px", fontSize: "13px", color: "var(--c-text)" }}>{t.name}</td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "var(--c-text-dim)" }}>{t.season}</td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "var(--c-text-muted)" }}>{t.team}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: t.result === "Ongoing" ? "rgba(255,70,85,0.15)" : "var(--c-surface3)",
                          color: t.result === "Ongoing" ? "#FF4655" : "var(--c-text-dim)",
                        }}
                      >
                        {t.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Developer-only: System Activity */}
      {!isAdmin && (
        <div style={{ marginBottom: "20px" }}>
          <div className="dash-section-title" style={{ marginBottom: "8px" }}>
            System Activity Records
          </div>
          <div
            style={{
              backgroundColor: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              padding: "12px 16px",
              fontFamily: "monospace",
              fontSize: "11px",
              maxHeight: "120px",
              overflowY: "auto",
            }}
          >
            {[
              { time: "Jun 12 14:02", action: "Login from 192.168.1.15" },
              { time: "Jun 11 09:30", action: "Profile updated" },
              { time: "Jun 10 16:45", action: "Password changed" },
              { time: "Jun 8 11:22", action: "Login from 192.168.1.15" },
              { time: "May 30 08:15", action: "Account created by Admin" },
            ].map((log, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "4px 0",
                  borderBottom: i < 4 ? "1px solid var(--c-border)" : "none",
                }}
              >
                <span style={{ color: "var(--c-text-dim)", flexShrink: 0 }}>{log.time}</span>
                <span style={{ color: "var(--c-text-muted)" }}>{log.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete User Button */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid var(--c-border)" }}>
        <button
          onClick={onDelete}
          className="text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
          style={{
            backgroundColor: "rgba(255,70,85,0.08)",
            border: "1px solid rgba(255,70,85,0.25)",
            color: "#FF4655",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget).style.backgroundColor = "#FF4655";
            (e.currentTarget).style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget).style.backgroundColor = "rgba(255,70,85,0.08)";
            (e.currentTarget).style.color = "#FF4655";
          }}
        >
          Delete User
        </button>
        <button onClick={onClose} className="dash-btn-ghost text-xs px-5 py-2 rounded-lg">
          Close
        </button>
      </div>
    </ModalBackdrop>
  );
}
