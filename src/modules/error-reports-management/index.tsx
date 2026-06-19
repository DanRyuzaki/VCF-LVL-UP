"use client";

const errors = [
  { time: "13:45:22", error: "Firebase Auth timeout",      page: "/login",                  severity: "High" },
  { time: "13:15:09", error: "Slow render: Bracket tree",  page: "/organizer/brackets",     severity: "Medium" },
  { time: "10:22:01", error: "Missing livestream embed",   page: "/gamer/livestream",       severity: "Low" },
];

function sevStyle(s: string) {
  if (s === "High")   return "bg-[#FF4655]/20 text-[#FF4655]";
  if (s === "Medium") return "bg-yellow-400/20 text-yellow-400";
  return "text-[#808080]";
}

function sevBg(s: string) {
  return s === "Low" ? "var(--c-surface3)" : undefined;
}

export default function ErrorReportsManagementModule() {
  return (
    <div className="dash-table-wrap">
      <table className="w-full border-collapse">
        <thead className="dash-thead">
          <tr>
            {["Time", "Error", "Page", "Severity"].map((h) => (
              <th key={h} className="dash-th">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {errors.map((e, i) => (
            <tr key={i} className="dash-tr">
              <td className="dash-td-dim font-mono">{e.time}</td>
              <td className="dash-td">{e.error}</td>
              <td className="dash-td-muted font-mono">{e.page}</td>
              <td className="dash-td">
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${sevStyle(e.severity)}`}
                  style={sevBg(e.severity) ? { backgroundColor: sevBg(e.severity) } : {}}
                >
                  {e.severity}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}