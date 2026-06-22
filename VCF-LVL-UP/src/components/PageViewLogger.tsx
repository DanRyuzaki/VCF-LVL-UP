// src/components/PageViewLogger.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { logInfo } from "@/lib/auditLogger";

export default function PageViewLogger() {
  const pathname = usePathname();   // ✅ correct App Router hook — never undefined
  const { profile } = useAuth();

  useEffect(() => {
    if (!pathname) return;
    logInfo(
      `Page view: ${pathname}`,
      { pathname },
      { profile, suppressError: true }  // suppressError=true → no console.warn for non-devs
    );
  }, [pathname, profile]);

  return null;
}
