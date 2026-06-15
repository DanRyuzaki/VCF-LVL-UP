interface StatCardProps {
  value: string | number;
  label: string;
  accent?: "red" | "teal" | "purple" | "default";
}

const accentColors: Record<string, string> = {
  red:     "text-[#FF4655]",
  teal:    "text-[#00F5D4]",
  purple:  "text-[#8B5CF6]",
  default: "text-white",
};

export default function StatCard({ value, label, accent = "default" }: StatCardProps) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg p-5">
      <div className={`font-head text-3xl font-bold leading-none ${accentColors[accent]}`}>
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-[1.5px] text-[#808080] mt-1">{label}</div>
    </div>
  );
}
