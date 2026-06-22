"use client";
// src/lib/auth-context.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserRole, GamerType } from "@/types/user";

// ---------------------------------------------------------------------------
// Shape of the Firestore user document (mirrors the schema in context summary)
// ---------------------------------------------------------------------------
export interface FirestoreUser {
  uid: string;
  email: string;
  firstName: string;
  middleInitial: string | null;
  lastName: string;
  role: UserRole;
  gamerType: GamerType | null;
  teamId: string | null;
  inGameName: string | null;
  phone: string | null;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin: string;
  createdBy: string | null;
}

// ---------------------------------------------------------------------------
// Context value
// ---------------------------------------------------------------------------
interface AuthContextValue {
  /** Raw Firebase Auth user (null = signed out, undefined = still loading) */
  firebaseUser: FirebaseUser | null | undefined;
  /** Merged Firestore profile for the signed-in user */
  profile: FirestoreUser | null;
  /** True while we're waiting for onAuthStateChanged to resolve */
  loading: boolean;
  /**
   * True if the most recent attempt to read the user's profile document
   * failed for a reason OTHER than "user is signed out" (e.g. a transient
   * network error or a permissions error). Distinguishes "we don't know
   * the profile right now" from "this user genuinely has no profile doc."
   * Role-gated UI should treat this as "still uncertain," not "deny access."
   */
  profileError: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: undefined,
  profile: null,
  loading: true,
  profileError: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<
    FirebaseUser | null | undefined
  >(undefined); // undefined = not yet resolved
  const [profile, setProfile] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);

  useEffect(() => {
    // Tracks the live profile listener for whichever user is currently
    // signed in, so we can tear it down cleanly when the user changes
    // or signs out, and so a token-refresh re-fire of onAuthStateChanged
    // doesn't spin up a duplicate listener.
    let unsubProfile: (() => void) | null = null;
    let currentUid: string | null = null;

    const teardownProfileListener = () => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }
      currentUid = null;
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);

      if (!fbUser) {
        // Genuinely signed out — clear everything, including any error state.
        teardownProfileListener();
        setProfile(null);
        setProfileError(false);
        setLoading(false);
        return;
      }

      // onAuthStateChanged re-fires on token refresh even though it's the
      // SAME user. If we already have a live listener for this uid, leave
      // it running rather than tearing it down and racing a fresh fetch —
      // that race is what was causing `profile` to intermittently flicker
      // to null mid-session.
      if (currentUid === fbUser.uid && unsubProfile) {
        setLoading(false);
        return;
      }

      teardownProfileListener();
      currentUid = fbUser.uid;

      unsubProfile = onSnapshot(
        doc(db, "users", fbUser.uid),
        (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as FirestoreUser);
            setProfileError(false);
          } else {
            // The doc really doesn't exist for this uid — this is a real
            // "no profile" case, not a transient failure.
            setProfile(null);
            setProfileError(false);
          }
          setLoading(false);
        },
        (err) => {
          // Transient/network/permission error — log it, and surface
          // profileError so callers can distinguish "unknown" from
          // "confirmed no profile." Importantly: do NOT null out a
          // profile we already successfully loaded, since a momentary
          // listener error shouldn't kick an admin out of admin pages.
          console.error("Failed to load user profile:", err);
          setProfileError(true);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      teardownProfileListener();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, profileError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
