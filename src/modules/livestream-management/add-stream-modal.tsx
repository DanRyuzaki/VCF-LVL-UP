"use client";
import { useState } from "react";
import ModalBackdrop from "@/components/shared/modal-backdrop";
import { Livestream } from "@/types/announcement";
import { tournaments } from "@/data/tournaments";

interface AddStreamModalProps {
  onClose: () => void;
  onSave: (stream: Livestream) => void;
}

export default function AddStreamModal({ onClose, onSave }: AddStreamModalProps) {
  const [title, setTitle] = useState("");
  const [tournament, setTournament] = useState(tournaments[0]?.name || "");
  const [platform, setPlatform] = useState("YouTube");
  const [url, setUrl] = useState("");
  const [schedule, setSchedule] = useState("");
  const [status, setStatus] = useState<"live" | "scheduled" | "ended">("scheduled");
  const [submitted, setSubmitted] = useState(false);

  const handleSave = () => {
    setSubmitted(true);
    if (!title || !url) return;

    const newStream: Livestream = {
      id: `ls_${Date.now()}`,
      label: title,
      title,
      url,
      status,
      tournamentName: tournament,
      platform,
      schedule,
    };
    onSave(newStream);
    onClose();
  };

  const fieldError = (val: string) => submitted && !val;

  return (
    <ModalBackdrop onClose={onClose} title="Add Stream" subtitle="Create a new livestream entry" maxWidth="520px">
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
          <select value={tournament} onChange={(e) => setTournament(e.target.value)} className="dash-select">
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
          onChange={(e) => setUrl(e.target.value)}
          className="dash-input"
          placeholder="https://youtube.com/watch?v=..."
          style={fieldError(url) ? { borderColor: "#EF4444" } : {}}
        />
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
          className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: "#FF4655" }}
          onMouseEnter={(e) => ((e.currentTarget).style.backgroundColor = "#E53E4D")}
          onMouseLeave={(e) => ((e.currentTarget).style.backgroundColor = "#FF4655")}
        >
          Save
        </button>
      </div>
    </ModalBackdrop>
  );
}
