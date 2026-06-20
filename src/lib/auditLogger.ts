// src/lib/auditLogger.ts
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AuditLogEntry {
  type: "INFO" | "WARN" | "ERROR";
  message: string;
  meta?: Record<string, unknown>;
}

/** Strip undefined values so Firestore never receives them. */
function cleanMeta(meta: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(meta).filter(([, v]) => v !== undefined)
  );
}

export async function auditLog(
  entry: AuditLogEntry,
  options: { profile?: { role: string } | null; suppressError?: boolean } = {}
): Promise<void> {
  const { profile, suppressError = false } = options;

  try {
    if (!profile || profile.role !== "developer") {
      if (!suppressError) console.warn("auditLog: non‑developer attempt ignored");
      return;
    }

    await addDoc(collection(db, "audit_logs"), {
      type: entry.type,
      message: entry.message,
      createdAt: serverTimestamp(),
      ...(entry.meta ? cleanMeta(entry.meta) : {}),
    });
  } catch (err) {
    if (!suppressError) {
      console.error("auditLog failed:", err);
    }
  }
}

export const logInfo = (
  msg: string,
  meta?: Record<string, unknown>,
  options?: { profile?: { role: string } | null; suppressError?: boolean }
) => auditLog({ type: "INFO", message: msg, meta }, options);

export const logWarn = (
  msg: string,
  meta?: Record<string, unknown>,
  options?: { profile?: { role: string } | null; suppressError?: boolean }
) => auditLog({ type: "WARN", message: msg, meta }, options);

export const logError = (
  msg: string,
  meta?: Record<string, unknown>,
  options?: { profile?: { role: string } | null; suppressError?: boolean }
) => auditLog({ type: "ERROR", message: msg, meta }, options);
