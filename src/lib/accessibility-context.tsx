"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AccessibilityContextValue {
  highContrast: boolean;
  setHighContrast: (active: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  highContrast: false,
  setHighContrast: () => {},
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrastState] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("vcf-lvl-up-contrast");
    if (saved === "true") {
      setHighContrastState(true);
      document.documentElement.setAttribute("data-contrast", "high");
    } else {
      document.documentElement.setAttribute("data-contrast", "normal");
    }
  }, []);

  const setHighContrast = (active: boolean) => {
    setHighContrastState(active);
    localStorage.setItem("vcf-lvl-up-contrast", String(active));
    document.documentElement.setAttribute("data-contrast", active ? "high" : "normal");
  };

  return (
    <AccessibilityContext.Provider value={{ highContrast, setHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);
