import { useState } from "react";

interface StatCardProps {
  value: string | number;
  label: string;
  accent?: "red" | "teal" | "purple" | "default";
  /** Optional hover popup text (e.g. full email) */
  tooltip?: string;
}

const accentHex: Record<string, string> = {
  red:     "#FF4655",
  teal:    "#00F5D4",
  purple:  "#8B5CF6",
  default: "var(--c-text)",
};

export default function StatCard({ value, label, accent = "default", tooltip }: StatCardProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="rounded-lg p-5 border min-w-0"
      style={{
        backgroundColor: "var(--c-surface2)",
        borderColor: "var(--c-border)",
        position: "relative",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="font-head text-3xl font-bold leading-none"
        style={{
          color: accentHex[accent],
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          wordBreak: "break-all",
        }}
      >
        {value}
      </div>
      <div
        className="text-[11px] uppercase tracking-[1.5px] mt-2"
        style={{ color: "var(--c-text-dim)" }}
      >
        {label}
      </div>

      {tooltip && hover && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: "calc(100% + 8px)",
            zIndex: 60,
            backgroundColor: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            color: "var(--c-text)",
            padding: "8px 10px",
            borderRadius: "8px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            whiteSpace: "nowrap",
            fontSize: "0.8125rem",
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}
