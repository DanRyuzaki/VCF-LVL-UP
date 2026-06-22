"use client";
import { useState } from "react";
import { IconX } from "@/components/shared/icons";

interface ConsentModalProps {
  onAccept: () => void;
  onClose: () => void;
}

export default function ConsentModal({ onAccept, onClose }: ConsentModalProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <div
        className="border rounded-xl p-7 w-full max-w-md relative"
        style={{
          backgroundColor: "var(--c-surface)",
          borderColor: "var(--c-border)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: "var(--c-text-dim)" }}
        >
          <IconX size={18} />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="text-[10px] uppercase tracking-[2px] mb-1" style={{ color: "var(--c-accent)" }}>
            Republic Act No. 10173
          </div>
          <h3 className="font-head text-xl font-bold uppercase tracking-wide" style={{ color: "var(--c-text)" }}>
            Data Privacy Consent
          </h3>
        </div>

        {/* Consent Text */}
        <div
          className="rounded-lg p-4 mb-5 max-h-40 overflow-y-auto border"
          style={{
            backgroundColor: "var(--c-surface2)",
            borderColor: "var(--c-border)",
          }}
        >
          <p className="text-xs leading-relaxed" style={{ color: "var(--c-text-muted)" }}>
            In compliance with the{" "}
            <strong style={{ color: "var(--c-text)" }}>
              Data Privacy Act of 2012 (Republic Act No. 10173)
            </strong>
            , I hereby voluntarily consent to the collection, processing, storage, and use of my
            personal information for the purpose of accessing and participating in{" "}
            <strong style={{ color: "var(--c-text)" }}>Faith-Based Youth eSports Events</strong>. I understand
            that my information will be handled securely and used only for legitimate system
            operations and event management purposes. The data collected may include but is not
            limited to: name, email address, in-game details, team assignments, and participation
            records. This data will not be shared with third parties without prior consent.
          </p>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 cursor-pointer"
            style={{ accentColor: "var(--c-accent)" }}
          />
          <span className="text-xs leading-relaxed transition-colors" style={{ color: "var(--c-text-muted)" }}>
            I have read, understood, and voluntarily agree to the Data Privacy notice above.
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border text-xs uppercase tracking-widest py-2.5 rounded-lg transition-all"
            style={{ borderColor: "var(--c-border)", color: "var(--c-text-dim)" }}
          >
            Cancel
          </button>
          <button
            onClick={() => { if (agreed) onAccept(); }}
            disabled={!agreed}
            className="flex-1 text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-all"
            style={{
              backgroundColor: agreed ? "var(--c-accent)" : "rgba(255,70,85,0.3)",
              color: agreed ? "#fff" : "rgba(255,255,255,0.4)",
              cursor: agreed ? "pointer" : "not-allowed",
            }}
          >
            I Agree &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}
