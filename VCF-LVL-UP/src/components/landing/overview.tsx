export default function OverviewSection() {
  const stats = [
    { value: "2025", label: "Season Year" },
    { value: "MLBB", label: "Game 1" },
    { value: "CODM", label: "Game 2" },
    { value: "8", label: "Max Teams" },
    { value: "5", label: "Players / Team" },
    { value: "Single Elim", label: "Format" },
  ];

  return (
    <section className="py-8 px-6 bg-[#121212] border-y border-[#2E2E2E]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-head text-xl font-bold text-[#FF4655]">{s.value}</div>
              <div className="text-[10px] text-[#808080] uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
