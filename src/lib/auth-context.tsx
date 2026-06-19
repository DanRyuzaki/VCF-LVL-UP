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
import { doc, getDoc } from "firebase/firestore";
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
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: undefined,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<
    FirebaseUser | null | undefined
  >(undefined); // undefined = not yet resolved
  const [profile, setProfile] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const snap = await getDoc(doc(db, "users", fbUser.uid));
          setProfile(snap.exists() ? (snap.data() as FirestoreUser) : null);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
