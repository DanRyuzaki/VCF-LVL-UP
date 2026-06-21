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
      className="rounded-lg p-5 border min-w-0"
      style={{
        backgroundColor: "var(--c-surface2)",
        borderColor: "var(--c-border)",
      }}
    >
      <div
        className="font-head text-lg sm:text-xl lg:text-3xl font-bold leading-tight break-all"
        style={{ color: accentHex[accent] }}
      >
        {value}
      </div>
      <div
        className="text-[11px] uppercase tracking-[1.5px] mt-2"
        style={{ color: "var(--c-text-dim)" }}
      >
        {label}
      </div>
    </div>
  );
}
