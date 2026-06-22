"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type FontSizeLevel = 1 | 2 | 3 | 4; // 1 = Small, 2 = Normal, 3 = Large, 4 = Extra Large

interface FontSizeContextValue {
  fontSize: FontSizeLevel;
  setFontSize: (level: FontSizeLevel) => void;
}

const FontSizeContext = createContext<FontSizeContextValue>({
  fontSize: 2,
  setFontSize: () => {},
});

const FONT_SIZE_MAP: Record<FontSizeLevel, string> = {
  1: "14px", // Small
  2: "16px", // Normal (Default)
  3: "18px", // Large
  4: "20px", // Extra Large
};

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSizeLevel>(2);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("vcf-lvl-up-font-size");
    if (saved) {
      const parsed = parseInt(saved, 10) as FontSizeLevel;
      if (parsed >= 1 && parsed <= 4) {
        setFontSizeState(parsed);
        document.documentElement.style.fontSize = FONT_SIZE_MAP[parsed];
      }
    }
  }, []);

  const setFontSize = (level: FontSizeLevel) => {
    setFontSizeState(level);
    localStorage.setItem("vcf-lvl-up-font-size", String(level));
    document.documentElement.style.fontSize = FONT_SIZE_MAP[level];
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export const useFontSize = () => useContext(FontSizeContext);
