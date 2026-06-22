// src/modules/user-management/validation-utils.ts
// Shared validation utilities for Add User / Add Admin modals.

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ---------------------------------------------------------------------------
// 1. Name Validation
// ---------------------------------------------------------------------------

/**
 * Validates first name or last name.
 * - Required
 * - Must start with a letter
 * - Letters, spaces, apostrophes, and hyphens only
 */
export function validateFirstLastName(value: string, fieldName: string): string {
  if (!value.trim()) return `${fieldName} is required.`;
  if (/^[^a-zA-Z]/.test(value)) return `${fieldName} must start with a letter.`;
  if (!/^[a-zA-Z][a-zA-Z' \-]*$/.test(value))
    return `${fieldName} can only contain letters, spaces, apostrophes, and hyphens.`;
  return "";
}

/**
 * Validates middle initial.
 * - Optional (returns "" if empty)
 * - Two letters only
 */
export function validateMiddleInitial(value: string): string {
  if (!value) return ""; // optional
  if (!/^[a-zA-Z]{1,2}$/.test(value))
    return "Middle initial must be one or two letters only.";
  return "";
}

// ---------------------------------------------------------------------------
// 2. Email Validation
// ---------------------------------------------------------------------------

/**
 * Validates email address format.
 * Accepts: john@email.com, john.dela.cruz@gmail.com, johndelacruz143@yahoo.com
 */
export function validateEmail(email: string): string {
  if (!email.trim()) return "Email address is required.";
  if (/^[^a-zA-Z]/.test(email)) return "Email must start with a letter.";
  const re = /^[a-zA-Z][a-zA-Z0-9._%+\-]*@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!re.test(email)) return "Please enter a valid email address (e.g. john@email.com).";
  return "";
}

// ---------------------------------------------------------------------------
// 3. Password Validation
// ---------------------------------------------------------------------------

interface PasswordContext {
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Validates the temporary password against complexity + security rules.
 * Returns an array of error messages (empty = valid).
 */
export function validatePassword(password: string, ctx: PasswordContext): string[] {
  const errors: string[] = [];

  if (!password) {
    errors.push("Temporary password is required.");
    return errors;
  }

  if (password.length < 8) errors.push("Must be at least 8 characters.");
  if (!/[A-Z]/.test(password)) errors.push("Must contain at least 1 uppercase letter.");
  if (!/[a-z]/.test(password)) errors.push("Must contain at least 1 lowercase letter.");
  if (!/[0-9]/.test(password)) errors.push("Must contain at least 1 digit.");
  if (!/[^a-zA-Z0-9]/.test(password)) errors.push("Must contain at least 1 special character.");

  // Security: cannot contain username, email, or full name
  const lowerPwd = password.toLowerCase();
  const emailLocal = ctx.email.split("@")[0]?.toLowerCase();
  if (emailLocal && emailLocal.length >= 3 && lowerPwd.includes(emailLocal))
    errors.push("Cannot contain your email username.");
  if (ctx.email && lowerPwd.includes(ctx.email.toLowerCase()))
    errors.push("Cannot contain the email address.");
  const fullName = `${ctx.firstName} ${ctx.lastName}`.trim().toLowerCase();
  if (fullName.length >= 3 && lowerPwd.includes(fullName))
    errors.push("Cannot contain the full name.");
  if (ctx.firstName && ctx.firstName.length >= 3 && lowerPwd.includes(ctx.firstName.toLowerCase()))
    errors.push("Cannot contain the first name.");
  if (ctx.lastName && ctx.lastName.length >= 3 && lowerPwd.includes(ctx.lastName.toLowerCase()))
    errors.push("Cannot contain the last name.");

  return errors;
}

/**
 * Live password strength meter.
 * Returns label + color for the strength indicator.
 */
export function getPasswordStrength(password: string): {
  label: string;
  color: string;
  percent: number;
} {
  if (!password) return { label: "", color: "transparent", percent: 0 };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Bonus for length
  const isLong = password.length >= 12;

  if (score <= 2) return { label: "Weak", color: "#EF4444", percent: 25 };
  if (score === 3) return { label: "Fair", color: "#F59E0B", percent: 50 };
  if (score === 4) return { label: "Strong", color: "#84CC16", percent: 75 };
  if (score === 5 && isLong) return { label: "Very Strong", color: "#00F5D4", percent: 100 };
  if (score === 5) return { label: "Strong", color: "#84CC16", percent: 75 };

  return { label: "Weak", color: "#EF4444", percent: 25 };
}

// ---------------------------------------------------------------------------
// 4. Profanity Filter
// ---------------------------------------------------------------------------

// Common offensive words (kept minimal but effective).
// All comparisons are case-insensitive and match whole words within the value.
const PROFANE_WORDS: string[] = [
  "ass", "asshole", "bastard", "bitch", "bobo", "bullshit", "crap", "cunt",
  "damn", "dick", "dumbass", "fag", "fuck", "fucker", "fucking", "gago",
  "hell", "idiot", "jackass", "jerk", "motherfucker", "nigger", "nigga",
  "penis", "piss", "prick", "puke", "puta", "putangina", "pussy", "rape",
  "retard", "sex", "shit", "slut", "stupid", "tanga", "tite", "twat",
  "vagina", "whore", "wtf",
];

/**
 * Checks if a string contains profane/offensive words.
 * Returns error message if profanity is found, empty string otherwise.
 */
export function containsProfanity(value: string): string {
  if (!value) return "";
  const lower = value.toLowerCase().replace(/[^a-z\s]/g, "");
  // Check both as whole word match and as substring (in case of concatenation tricks)
  for (const word of PROFANE_WORDS) {
    // Whole-word boundary check
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(lower)) {
      return "Please enter a valid name. Offensive language is not allowed.";
    }
    // Also check as substring for concatenated variants (e.g. "assh0le" won't match but "asshat" will)
    if (lower.includes(word)) {
      return "Please enter a valid name. Offensive language is not allowed.";
    }
  }
  return "";
}

// ---------------------------------------------------------------------------
// 5. Duplicate Email Check (Firestore)
// ---------------------------------------------------------------------------

/**
 * Checks if an email already exists in the Firestore `users` collection.
 * Returns error message if duplicate, empty string if available.
 */
export async function checkDuplicateEmail(email: string): Promise<string> {
  try {
    const snap = await getDocs(
      query(collection(db, "users"), where("email", "==", email))
    );
    if (!snap.empty) {
      return "Email already registered. Please use another email address.";
    }
  } catch (err) {
    console.error("Failed to check duplicate email:", err);
    // Don't block account creation on a network error — let the server-side
    // Firebase Auth duplicate check catch it instead.
  }
  return "";
}
