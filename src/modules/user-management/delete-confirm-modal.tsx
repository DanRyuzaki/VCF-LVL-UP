"use client";
import ModalBackdrop from "@/components/shared/modal-backdrop";

interface DeleteConfirmModalProps {
  userName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({ userName, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <ModalBackdrop onClose={onClose} title="Confirm User Deletion" maxWidth="440px">
      {/* Warning icon */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="28" cy="28" r="26" stroke="#FF4655" strokeWidth="1.5" opacity="0.3" />
          <circle cx="28" cy="28" r="22" fill="rgba(255,70,85,0.06)" stroke="#FF4655" strokeWidth="1.5" />
          <path
            d="M28 18V32"
            stroke="#FF4655"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="28" cy="37" r="1.5" fill="#FF4655" />
        </svg>
      </div>

      <p
        style={{
          textAlign: "center",
          fontSize: "14px",
          color: "var(--c-text-muted)",
          lineHeight: 1.7,
          marginBottom: "28px",
        }}
      >
        Are you sure you want to delete{" "}
        <strong style={{ color: "var(--c-text)" }}>{userName}</strong>?
        <br />
        <span style={{ fontSize: "12px", color: "var(--c-text-dim)" }}>
          This action cannot be undone. All associated data will be permanently removed.
        </span>
      </p>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <button onClick={onClose} className="dash-btn-ghost text-xs px-5 py-2.5 rounded-lg">
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className="text-white text-xs font-semibold uppercase tracking-widest px-5 py-2.5 rounded-lg transition-colors"
          style={{ backgroundColor: "#FF4655" }}
          onMouseEnter={(e) => ((e.currentTarget).style.backgroundColor = "#E53E4D")}
          onMouseLeave={(e) => ((e.currentTarget).style.backgroundColor = "#FF4655")}
        >
          Confirm Delete
        </button>
      </div>
    </ModalBackdrop>
  );
}
