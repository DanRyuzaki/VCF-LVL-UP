"use client";
import { UserRole } from "@/types/user";


interface RoleSelectorProps {
  selected: UserRole | null;
  onSelect: (role: UserRole) => void;
}


const roles: { role: UserRole; label: string; icon: React.ReactNode }[] = [
  {
    role: "gamer",
    label: "Gamer",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" /><line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><circle cx="16" cy="11" r="1" fill="currentColor" /><circle cx="18" cy="13" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    role: "organizer",
    label: "Organizer",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    role: "admin",
    label: "Admin",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    role: "developer",
    label: "Developer",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
];


export default function RoleSelector({ selected, onSelect }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mb-6">
      {roles.map(({ role, label, icon }) => {
        const isActive = selected === role;
        return (
          <button
            key={role}
            type="button"
            onClick={() => onSelect(role)}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm transition-all text-left ${
              isActive
                ? "border-[#FF4655] text-[#FF4655] bg-[#FF4655]/[0.08]"
                : "border-[#2E2E2E] text-[#B8B8B8] bg-[#1A1A1A] hover:border-[#FF4655]/50 hover:text-white"
            }`}
          >
            <span className={isActive ? "text-[#FF4655]" : "text-[#808080]"}>{icon}</span>
            <span className="font-medium uppercase tracking-wider text-xs">{label}</span>
          </button>
        );
      })}
    </div>
  );
}



