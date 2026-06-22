interface StatCardProps {
  value: string | number;
  label: string;
  accent?: "red" | "teal" | "purple" | "default";
}

const accentHex: Record<string, string> = {
  red:     "#FF4655",
  teal:    "#00F5D4",
  purple:  "#8B5CF6",
  default: "var(--c-text)",
};

export default function StatCard({ value, label, accent = "default" }: StatCardProps) {
  return (
    <div
      className="rounded-lg p-5 border"
      style={{
        backgroundColor: "var(--c-surface2)",
        borderColor: "var(--c-border)",
      }}
    >
      <div
        className="font-head text-3xl font-bold leading-none"
        style={{ color: accentHex[accent] }}
      >
        {value}
      </div>
      <div
        className="text-[11px] uppercase tracking-[1.5px] mt-1"
        style={{ color: "var(--c-text-dim)" }}
      >
        {label}
      </div>
    </div>
  );
}
