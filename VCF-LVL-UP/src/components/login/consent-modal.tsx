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
      <div className="bg-[#121212] border border-[#2E2E2E] rounded-xl p-7 w-full max-w-md relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#808080] hover:text-white transition-colors"
        >
          <IconX size={18} />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="text-[10px] uppercase tracking-[2px] text-[#FF4655] mb-1">
            Republic Act No. 10173
          </div>
          <h3 className="font-head text-xl font-bold uppercase tracking-wide">
            Data Privacy Consent
          </h3>
        </div>

        {/* Consent Text */}
        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-4 mb-5 max-h-40 overflow-y-auto">
          <p className="text-[#B8B8B8] text-xs leading-relaxed">
            In compliance with the{" "}
            <strong className="text-white">
              Data Privacy Act of 2012 (Republic Act No. 10173)
            </strong>
            , I hereby voluntarily consent to the collection, processing, storage, and use of my
            personal information for the purpose of accessing and participating in{" "}
            <strong className="text-white">Faith-Based Youth eSports Events</strong>. I understand
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
            className="mt-0.5 w-4 h-4 accent-[#FF4655] cursor-pointer"
          />
          <span className="text-xs text-[#B8B8B8] leading-relaxed group-hover:text-white transition-colors">
            I have read, understood, and voluntarily agree to the Data Privacy notice above.
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-[#2E2E2E] text-[#808080] hover:text-white hover:border-[#808080] text-xs uppercase tracking-widest py-2.5 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (agreed) onAccept(); }}
            disabled={!agreed}
            className={`flex-1 text-xs font-semibold uppercase tracking-widest py-2.5 rounded-lg transition-all ${
              agreed
                ? "bg-[#FF4655] hover:bg-[#E53E4D] text-white cursor-pointer"
                : "bg-[#FF4655]/30 text-white/40 cursor-not-allowed"
            }`}
          >
            I Agree &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}
