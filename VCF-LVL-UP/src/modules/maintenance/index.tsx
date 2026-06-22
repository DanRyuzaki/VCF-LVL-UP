"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

// NOTE: audit_logs are write-only via Cloud Functions in production.
// For now maintenance actions are UI-only stubs that show the developer
// what would be triggered. Hook up to a Cloud Function endpoint when ready.

type ActionStatus = "idle" | "running" | "done" | "error";

interface MaintenanceAction {
  id: string;
  label: string;
  description: string;
  danger: boolean;
}

const ACTIONS: MaintenanceAction[] = [
  {
    id: "clear-cache",
    label: "Clear Server Cache",
    description: "Invalidates cached query results and forces a fresh read from Firestore on next load.",
    danger: false,
  },
  {
    id: "rebuild-index",
    label: "Rebuild Search Index",
    description: "Regenerates full-text search indexes for users, teams, and tournaments.",
    danger: false,
  },
  {
    id: "run-cleanup",
    label: "Run Orphan Cleanup",
    description: "Removes orphaned Firestore documents that no longer have a parent reference (e.g., matches without a tournamentId).",
    danger: false,
  },
  {
    id: "toggle-maintenance",
    label: "Toggle Maintenance Mode",
    description: "Puts the platform into read-only maintenance mode. All write actions will be disabled for non-developer users.",
    danger: true,
  },
  {
    id: "flush-sessions",
    label: "Flush All User Sessions",
    description: "Revokes all active Firebase Auth sessions. All users will be logged out and must sign in again.",
    danger: true,
  },
];

export default function MaintenanceModule() {
  const { profile, loading } = useAuth();

  const [statuses, setStatuses] = useState<Record<string, ActionStatus>>(
    Object.fromEntries(ACTIONS.map((a) => [a.id, "idle"]))
  );
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (loading) {
    return <div className="p-6 text-sm" style={{ color: "var(--c-text-dim)" }}>Loading…</div>;
  }

  const allowed = profile?.role === "developer";

  if (!allowed) {
    return (
      <div className="p-6 text-red-400 text-sm">
        Access denied. Developers only.
      </div>
    );
  }

  const handleAction = async (id: string) => {
    setStatuses((s) => ({ ...s, [id]: "running" }));
    setConfirmId(null);

    // Simulate async action (replace with real Cloud Function call)
    await new Promise((res) => setTimeout(res, 1500));

    // TODO: Replace with actual fetch to your Cloud Function:
    // const res = await fetch("/api/maintenance/" + id, { method: "POST" });
    // if (!res.ok) { setStatuses(s => ({ ...s, [id]: "error" })); return; }

    setStatuses((s) => ({ ...s, [id]: "done" }));
    setTimeout(() => setStatuses((s) => ({ ...s, [id]: "idle" })), 3000);
  };

  const statusLabel = (s: ActionStatus) =>
    s === "running" ? "Running…" :
    s === "done"    ? "✓ Done"   :
    s === "error"   ? "✗ Error"  :
    "Run";

  const statusClass = (s: ActionStatus, danger: boolean) => {
    if (s === "running") return "bg-black/10 dark:bg-white/10 text-black/50 dark:text-white/50 cursor-not-allowed";
    if (s === "done")    return "bg-emerald-600 text-white";
    if (s === "error")   return "bg-red-600 text-white";
    return danger
      ? "bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30"
      : "bg-indigo-600 hover:bg-indigo-500 text-white";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--c-text)" }}>Maintenance</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--c-text-dim)" }}>
          System-level operations — developer access only
        </p>
      </div>

      {/* Warning banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex gap-3 items-start">
        <span className="text-amber-600 dark:text-amber-400 text-lg mt-0.5">⚠</span>
        <div>
          <p className="text-amber-700 dark:text-amber-300 text-sm font-medium">Handle with care</p>
          <p className="text-amber-700/60 dark:text-amber-300/60 text-xs mt-0.5">
            Dangerous actions are marked in red. They affect all users immediately and cannot be undone.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {ACTIONS.map((action) => {
          const status = statuses[action.id];
          const isConfirming = confirmId === action.id;

          return (
            <div
              key={action.id}
              className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
                action.danger ? "border-red-500/20" : "border-black/10 dark:border-white/10"
              }`}
              style={{ backgroundColor: "var(--c-surface2)" }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium" style={{ color: "var(--c-text)" }}>{action.label}</p>
                  {action.danger && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-medium">
                      DANGER
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: "var(--c-text-dim)" }}>{action.description}</p>
              </div>

              <div className="shrink-0 flex gap-2">
                {isConfirming ? (
                  <>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="px-3 py-1.5 text-xs rounded-lg transition"
                      style={{ color: "var(--c-text-dim)", border: "1px solid var(--c-border)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAction(action.id)}
                      className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg transition font-medium"
                    >
                      Confirm
                    </button>
                  </>
                ) : (
                  <button
                    disabled={status === "running"}
                    onClick={() =>
                      action.danger
                        ? setConfirmId(action.id)
                        : handleAction(action.id)
                    }
                    className={`px-4 py-1.5 text-xs rounded-lg transition font-medium ${statusClass(status, action.danger)}`}
                  >
                    {statusLabel(status)}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-[11px]" style={{ color: "var(--c-text-dim)", opacity: 0.5 }}>
        Actions are currently UI stubs. Connect each to a Cloud Function endpoint
        at <code style={{ color: "var(--c-text-dim)", opacity: 0.7 }}>/api/maintenance/{"<action-id>"}</code> to enable real execution.
      </p>
    </div>
  );
}
