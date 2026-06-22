"use client";
import { useState, useContext } from "react";
import ModalBackdrop from "@/components/shared/modal-backdrop";
import { Livestream } from "@/types/announcement";
import { OrganizerContext } from "@/lib/organizer-context";

interface AddStreamModalProps {
  existingStreams: Livestream[];
  onClose: () => void;
  onSave:  (stream: Livestream) => void | Promise<void>;
}

export default function AddStreamModal({ existingStreams = [], onClose, onSave }: AddStreamModalProps) {
  // Pull live tournament list from OrganizerContext (Firestore-backed).
  // If this modal is rendered outside the OrganizerProvider (shouldn't happen
  // for admin) we fall back to an empty list gracefully.
  const ctx         = useContext(OrganizerContext);
  const tournaments = ctx?.tournaments ?? [];

  const defaultTournament =
    tournaments.length > 0 ? `${tournaments[0].name} S${tournaments[0].season}` : "";

  const [title,      setTitle]      = useState("");
  const [tournament, setTournament] = useState(defaultTournament);
  const [platform,   setPlatform]   = useState("YouTube");
  const [url,        setUrl]        = useState("");
  const [schedule,   setSchedule]   = useState("");
  const [status,     setStatus]     = useState<"live" | "scheduled" | "ended">("scheduled");
  const [submitted,  setSubmitted]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const fieldError = (val: string) => submitted && !val;

  const handleSave = async () => {
    setSubmitted(true);
    setError(null);
    if (!title || !url) return;

    if (schedule) {
      const now = new Date();
      const selected = new Date(schedule);
      if (selected < now) {
        setError("Stream schedule cannot be in the past.");
        return;
      }

      const isDoubleBooked = existingStreams.some(
        (s) => s.schedule && new Date(s.schedule).getTime() === selected.getTime()
      );
      if (isDoubleBooked) {
        setError("A livestream is already scheduled at this date and time.");
        return;
      }
    }

    const newStream: Livestream = {
      id:             `ls_${Date.now()}`,   // transient; Firestore will assign real ID
      label:          title,
      title,
      url,
      status,
      tournamentName: tournament || "—",
      platform,
      schedule,
    };

    setSaving(true);
    try {
      await onSave(newStream);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose} title="Add Stream" subtitle="Create a new livestream entry" maxWidth="520px">
      {error && (
        <div className="bg-[#FF4655]/10 border border-[#FF4655]/30 text-[#FF4655] text-xs rounded-lg px-4 py-2 mb-4">
          {error}
        </div>
      )}
      {/* Stream Title */}
      <div style={{ marginBottom: "16px" }}>
        <label className="dash-label">
          Stream Title <span style={{ color: "#EF4444" }}>*</span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="dash-input"
          placeholder="e.g. MLBB QF Day 1"
          style={fieldError(title) ? { borderColor: "#EF4444" } : {}}
        />
      </div>

      {/* Tournament + Platform */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div>
          <label className="dash-label">Tournament</label>
          <select
            value={tournament}
            onChange={(e) => setTournament(e.target.value)}
            className="dash-select"
          >
            {tournaments.length === 0 && (
              <option value="">No tournaments available</option>
            )}
            {tournaments.map((t) => (
              <option key={t.id} value={`${t.name} S${t.season}`}>
                {t.name} S{t.season}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="dash-label">Stream Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="dash-select">
            <option>YouTube</option>
            <option>Facebook</option>
            <option>Twitch</option>
          </select>
        </div>
      </div>

      {/* Stream URL */}
      <div style={{ marginBottom: "16px" }}>
        <label className="dash-label">
          Stream URL <span style={{ color: "#EF4444" }}>*</span>
        </label>
        <input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            // Auto-detect platform from URL
            try {
              const host = new URL(e.target.value).hostname.replace("www.", "");
              if (["youtube.com", "m.youtube.com", "youtu.be"].includes(host)) setPlatform("YouTube");
              else if (["facebook.com", "fb.watch"].includes(host)) setPlatform("Facebook");
              else if (host === "twitch.tv") setPlatform("Twitch");
            } catch { /* ignore invalid URL while typing */ }
          }}
          className="dash-input"
          placeholder="Paste a YouTube, Facebook, or Twitch URL"
          style={fieldError(url) ? { borderColor: "#EF4444" } : {}}
        />
        <div className="text-[10px] mt-1.5 space-y-0.5" style={{ color: "var(--c-text-dim)" }}>
          <div><strong style={{ color: "var(--c-text-muted)" }}>YouTube:</strong> youtube.com/watch?v=... · youtu.be/... · youtube.com/live/...</div>
          <div><strong style={{ color: "var(--c-text-muted)" }}>Facebook:</strong> facebook.com/.../videos/... · fb.watch/...</div>
          <div><strong style={{ color: "var(--c-text-muted)" }}>Twitch:</strong> twitch.tv/channel · twitch.tv/videos/...</div>
        </div>
      </div>


      {/* Schedule + Status */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
        <div>
          <label className="dash-label">Stream Schedule</label>
          <input
            type="datetime-local"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="dash-input"
          />
        </div>
        <div>
          <label className="dash-label">Stream Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "live" | "scheduled" | "ended")}
            className="dash-select"
          >
            <option value="live">Live</option>
            <option value="scheduled">Scheduled</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button onClick={onClose} className="dash-btn-ghost text-xs px-5 py-2 rounded-lg">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
          style={{ backgroundColor: "#FF4655" }}
          onMouseEnter={(e) => { (e.currentTarget).style.backgroundColor = "#E53E4D"; }}
          onMouseLeave={(e) => { (e.currentTarget).style.backgroundColor = "#FF4655"; }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </ModalBackdrop>
  );
}
