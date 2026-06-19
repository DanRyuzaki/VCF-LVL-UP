"use client";
import { useState } from "react";

interface ApprovalItem {
  type: string;
  label: string;
  submittedBy: string;
  date: string;
  status: string;
}

const initialItems: ApprovalItem[] = [
  { type: "Announcement", label: "Practice Schedule Update",      submittedBy: "Organizer", date: "Jun 12", status: "pending" },
  { type: "Calendar",     label: "CODM Finals Event",             submittedBy: "Organizer", date: "Jun 11", status: "pending" },
  { type: "Account",      label: "New Organizer — Maria Santos",  submittedBy: "System",    date: "Jun 10", status: "pending" },
];

function typeBadge(t: string) {
  if (t === "Announcement") return "bg-[#FF4655]/20 text-[#FF4655]";
  if (t === "Calendar")     return "bg-[#8B5CF6]/20 text-[#8B5CF6]";
  return "text-[#808080]";
}

export default function ApprovalsManagementModule() {
  const [items, setItems] = useState<ApprovalItem[]>(initialItems);

  const handleApprove = (label: string) =>
    setItems((prev) => prev.map((i) => i.label === label ? { ...i, status: "approved" } : i));

  const handleReject = (label: string) =>
    setItems((prev) => prev.map((i) => i.label === label ? { ...i, status: "rejected" } : i));

  return (
    <div className="dash-table-wrap">
      <table className="w-full border-collapse">
        <thead className="dash-thead">
          <tr>
            {["Type", "Title", "Submitted By", "Date", "Actions"].map((h) => (
              <th key={h} className="dash-th">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.label} className="dash-tr">
              <td className="dash-td">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${typeBadge(item.type)}`}>
                  {item.type}
                </span>
              </td>
              <td className="dash-td">{item.label}</td>
              <td className="dash-td-muted">{item.submittedBy}</td>
              <td className="dash-td-dim">{item.date}</td>
              <td className="dash-td">
                {item.status === "pending" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(item.label)}
                      className="bg-[#00F5D4]/20 text-[#00F5D4] hover:bg-[#00F5D4]/30 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(item.label)}
                      className="dash-btn-ghost text-xs px-3 py-1.5 rounded"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      item.status === "approved"
                        ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                        : "bg-[#FF4655]/20 text-[#FF4655]"
                    }`}
                  >
                    {item.status}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}