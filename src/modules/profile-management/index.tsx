"use client";
import { useState, useEffect } from "react";
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import StatCard from "@/components/shared/stat-card";

export default function ProfileManagementModule() {
  const { profile, loading } = useAuth();

  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [error,   setError]     = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);

  // Editable fields
  const [firstName,       setFirstName]       = useState("");
  const [middleInitial,   setMiddleInitial]   = useState("");
  const [lastName,        setLastName]        = useState("");
  const [inGameName,      setInGameName]      = useState("");
  const [phone,           setPhone]           = useState("");

  // Seed local state whenever the Firestore profile loads / changes
  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName ?? "");
    setMiddleInitial(profile.middleInitial ?? "");
    setLastName(profile.lastName ?? "");
    setInGameName(profile.inGameName ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  const handleCancel = () => {
    if (!profile) return;
    setFirstName(profile.firstName ?? "");
    setMiddleInitial(profile.middleInitial ?? "");
    setLastName(profile.lastName ?? "");
    setInGameName(profile.inGameName ?? "");
    setPhone(profile.phone ?? "");
    setEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const trimmedFirst = firstName.trim();
      const trimmedLast = lastName.trim();
      const trimmedIgn = inGameName.trim();

      await updateDoc(doc(db, "users", profile.uid), {
        firstName:     trimmedFirst,
        middleInitial: middleInitial.trim() || null,
        lastName:      trimmedLast,
        inGameName:    trimmedIgn || null,
        phone:         phone.trim() || null,
        updatedAt:     serverTimestamp(),
      });

      // Keep the matching `players` doc's name/ign in sync. `players` has no
      // `uid` field — email is the only join key shared with `users` (see
      // fsUpdateUserTeamId for the same pattern on the organizer side).
      // This is intentionally best-effort: a gamer created before the
      // user-management fix (or seeded without a players doc) simply has
      // nothing to sync yet — that's not an error, and must never block the
      // profile save itself.
      if (profile.email) {
        try {
          const playerSnap = await getDocs(
            query(collection(db, "players"), where("email", "==", profile.email), limit(1))
          );
          if (!playerSnap.empty) {
            const playerDocId = playerSnap.docs[0].id;
            await updateDoc(doc(db, "players", playerDocId), {
              name: `${trimmedFirst} ${trimmedLast}`.trim(),
              ign: trimmedIgn || `${trimmedFirst} ${trimmedLast}`.trim(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (syncErr) {
          // Non-fatal — log only, never surface to the gamer or block save.
          console.error("Failed to sync players doc after profile update:", syncErr);
        }
      }

      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading / unauthenticated states ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-[#FF4655] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="dash-card p-6 text-center" style={{ color: "var(--c-text-muted)" }}>
        Profile not found. Please sign in again.
      </div>
    );
  }

  const fullName    = [profile.firstName, profile.middleInitial, profile.lastName].filter(Boolean).join(" ");
  const initials    = [profile.firstName?.[0], profile.lastName?.[0]].filter(Boolean).join("").toUpperCase();
  const gamerLabel  =
    profile.gamerType === "team_leader" ? "Team Leader"
    : profile.gamerType === "team_member" ? "Team Member"
    : "Free Agent";

  // ── Editable field rows ────────────────────────────────────────────────────
  const fields: { label: string; value: string; setter: (v: string) => void; placeholder?: string }[] = [
    { label: "First Name",      value: firstName,     setter: setFirstName,     placeholder: "e.g. John" },
    { label: "Middle Initial",  value: middleInitial, setter: setMiddleInitial, placeholder: "e.g. D" },
    { label: "Last Name",       value: lastName,      setter: setLastName,      placeholder: "e.g. Dela Cruz" },
    { label: "In-Game Name",    value: inGameName,    setter: setInGameName,    placeholder: "e.g. JohnDC_MLBB" },
    { label: "Phone Number",    value: phone,         setter: setPhone,         placeholder: "+63 912 345 6789" },
  ];

  return (
    <div className="space-y-5">
      {/* Avatar + identity strip */}
      <div className="flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-head text-2xl font-bold flex-shrink-0"
          style={{
            backgroundColor: "var(--c-surface3)",
            border: "2px solid var(--c-accent)",
            color: "var(--c-accent)",
          }}
        >
          {initials || "?"}
        </div>
        <div>
          <div
            className="font-head text-xl font-bold uppercase tracking-wide"
            style={{ color: "var(--c-text)" }}
          >
            {fullName || "—"}
          </div>
          <div className="text-sm" style={{ color: "var(--c-text-muted)" }}>
            {profile.inGameName || "No IGN set"}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block bg-[#00F5D4]/15 text-[#00F5D4] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
              {gamerLabel}
            </span>
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
              style={{ backgroundColor: "var(--c-surface3)", color: "var(--c-text-dim)" }}
            >
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      {/* Stat cards — read-only info from Firestore */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard value={profile.email}  label="Email" accent="teal" tooltip={profile.email} />
        <StatCard value={profile.status} label="Account Status" />
        <StatCard
          value={profile.teamId ? "Assigned" : "No Team"}
          label="Team"
          accent={profile.teamId ? undefined : "red"}
        />
      </div>

      {/* Feedback banners */}
      {success && (
        <div className="bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4] text-xs rounded-lg px-4 py-2">
          Profile updated successfully.
        </div>
      )}
      {error && (
        <div className="bg-[#FF4655]/10 border border-[#FF4655]/30 text-[#FF4655] text-xs rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* Update Profile form */}
      <div className="dash-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="dash-section-title" style={{ marginBottom: 0 }}>
            Update Profile
          </div>
          <button
            onClick={editing ? handleCancel : () => setEditing(true)}
            className="dash-btn-ghost text-xs px-3 py-1 rounded"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fields.map(({ label, value, setter, placeholder }) => (
            <div key={label}>
              <label className="dash-label">{label}</label>
              <input
                value={value}
                onChange={(e) => setter(e.target.value)}
                disabled={!editing}
                placeholder={placeholder}
                className="dash-input"
                style={{ opacity: editing ? 1 : 0.5 }}
              />
            </div>
          ))}
        </div>

        {editing && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 bg-[#FF4655] hover:bg-[#E53E4D] text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        )}
      </div>

      {/* Read-only account details */}
      <div className="dash-card p-5">
        <div className="dash-section-title">Account Details</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            ["Account ID (UID)",   profile.uid],
            ["Role",               profile.role],
            ["Gamer Type",         profile.gamerType ?? "—"],
            ["Created By",         profile.createdBy ?? "—"],
          ].map(([label, val]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="dash-label" style={{ marginBottom: 0 }}>{label}</span>
              <span className="font-mono text-xs break-all" style={{ color: "var(--c-text-muted)" }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}