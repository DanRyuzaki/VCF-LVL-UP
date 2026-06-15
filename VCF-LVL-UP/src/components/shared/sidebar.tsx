"use client";
import Link from "next/link";
import { DynamicIcon, IconLogout } from "@/components/shared/icons";
import { UserRole } from "@/types/user";
import { ROLE_CONFIG } from "@/lib/roles";

interface SidebarProps {
  role: UserRole;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ role, activeSection, onSectionChange }: SidebarProps) {
  const config = ROLE_CONFIG[role];

  return (
    <aside className="w-[220px] min-h-[calc(100vh-60px)] bg-[#121212] border-r border-[#2E2E2E] flex flex-col shrink-0">
      <div className="flex-1 py-6">
        {/* Role Badge */}
        <div className="px-5 mb-5">
          <div className="text-[10px] uppercase tracking-[2px] text-[#808080] mb-1">Role</div>
          <div
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: config.color }}
          >
            {config.label}
          </div>
        </div>

        <div className="h-px bg-[#2E2E2E] mb-4 mx-5" />

        {/* Nav items */}
        <div className="px-0">
          <div className="text-[10px] uppercase tracking-[2px] text-[#808080] px-5 mb-2">
            Navigation
          </div>
          {config.sidebarItems.map((item) => {
            const isActive = activeSection === item.section;
            return (
              <button
                key={item.section}
                onClick={() => onSectionChange(item.section)}
                className={`w-full flex items-center gap-3 px-5 py-[10px] text-sm transition-all border-l-2 text-left ${
                  isActive
                    ? "border-[#FF4655] text-[#FF4655] bg-[#FF4655]/[0.06]"
                    : "border-transparent text-[#B8B8B8] hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <DynamicIcon name={item.icon} size={15} />
                <span className="tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-[#2E2E2E]">
        <div className="text-[10px] text-[#808080] uppercase tracking-wider mb-1">Logged in as</div>
        <div className="text-sm font-medium mb-3">{config.label}</div>
        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 border border-[#2E2E2E] text-[#808080] hover:text-white hover:border-[#808080] text-xs uppercase tracking-widest px-3 py-2 rounded-md transition-all"
        >
          <IconLogout size={13} />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
