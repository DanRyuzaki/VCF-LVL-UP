"use client";
import { useEffect } from "react";

interface ModalBackdropProps {
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function ModalBackdrop({ onClose, title, subtitle, children, maxWidth = "480px" }: ModalBackdropProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "modalFadeIn 0.2s ease-out",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "90%",
          maxWidth,
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: "12px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(255,70,85,0.06)",
          animation: "modalSlideIn 0.25s ease-out",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            color: "var(--c-text-dim)",
            cursor: "pointer",
            padding: "4px",
            lineHeight: 1,
            fontSize: "18px",
            transition: "color 0.15s",
            zIndex: 1,
          }}
          onMouseEnter={(e) => ((e.currentTarget).style.color = "var(--c-text)")}
          onMouseLeave={(e) => ((e.currentTarget).style.color = "var(--c-text-dim)")}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header */}
        {(title || subtitle) && (
          <div style={{ padding: "24px 24px 0 24px" }}>
            {title && (
              <h3
                className="font-head"
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--c-text)",
                  margin: 0,
                  paddingRight: "32px",
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: "12px", color: "var(--c-text-dim)", marginTop: "4px" }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: "20px 24px 24px 24px" }}>
          {children}
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
