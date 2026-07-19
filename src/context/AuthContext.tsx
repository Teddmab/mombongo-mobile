import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import type { Role } from "@/context/AppContext";
import { useApp } from "@/context/AppContext";
import { auth, functions, isDevMode } from "@/lib/firebase";
import { LoadingScreen } from "@/screens/LoadingScreen";

export type UserRole = "admin" | "agent" | "farmer" | "merchant" | "investor";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  walletUsd?: number;
  walletCdf?: number;
  totalInvestedUsd?: number;
  totalEarnedUsd?: number;
}

export interface AuthContextValue {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** Mode dev uniquement — session mock après auth.service */
  signInDev: (role: Role) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const DEV_MOCK_PROFILE: UserProfile = {
  uid: "dev-user-001",
  email: "alain@mombongo.cd",
  displayName: "Alain",
  role: "investor",
  walletUsd: 500,
  walletCdf: 1_400_000,
  totalInvestedUsd: 1200,
  totalEarnedUsd: 180,
};

const DEV_MOCK_USER = {
  uid: DEV_MOCK_PROFILE.uid,
  email: DEV_MOCK_PROFILE.email,
  displayName: DEV_MOCK_PROFILE.displayName,
  photoURL: null,
} as unknown as FirebaseUser;

const getUserProfileFn = httpsCallable<Record<string, never>, Record<string, unknown>>(
  functions,
  "getUserProfile",
);

function normalizeProfile(data: Record<string, unknown> | null): UserProfile | null {
  if (!data || typeof data.uid !== "string") return null;
  return {
    uid: data.uid,
    email: (data.email as string) ?? "",
    displayName: (data.fullName as string) || (data.displayName as string) || "",
    role: (data.role as UserRole) ?? "investor",
    walletUsd: typeof data.walletUsd === "number" ? data.walletUsd : undefined,
    walletCdf: typeof data.walletCdf === "number" ? data.walletCdf : undefined,
    totalInvestedUsd: typeof data.totalInvestedUsd === "number" ? data.totalInvestedUsd : undefined,
    totalEarnedUsd: typeof data.totalEarnedUsd === "number" ? data.totalEarnedUsd : undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { role } = useApp();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  /** Session mock locale (email en DEV) — évite l’auto-login au démarrage */
  const devSessionRef = useRef(false);

  const refreshProfile = async () => {
    if (!user || user.uid.startsWith("dev-")) return;
    try {
      const result = await getUserProfileFn({});
      setUserProfile(normalizeProfile(result.data ?? null));
    } catch {
      setUserProfile(null);
    }
  };

  const signInDev = useCallback(async (nextRole: Role) => {
    if (!isDevMode()) return;
    devSessionRef.current = true;
    setUser(DEV_MOCK_USER);
    setUserProfile({ ...DEV_MOCK_PROFILE, role: nextRole as UserRole });
  }, []);

  const signOut = useCallback(async () => {
    devSessionRef.current = false;
    setUser(null);
    setUserProfile(null);
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore si pas de session Firebase
    }
  }, []);

  // Toujours écouter Firebase (Google Sign-In réel même si DEV_MODE pour les données)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        devSessionRef.current = false;
        setUser(firebaseUser);
        setIsLoading(false);
        try {
          const result = await getUserProfileFn({});
          setUserProfile(normalizeProfile(result.data ?? null));
        } catch {
          setUserProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? "",
            displayName: firebaseUser.displayName ?? "",
            role: role as UserRole,
          });
        }
        return;
      }

      if (!devSessionRef.current) {
        setUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [role]);

  if (isLoading) return <LoadingScreen />;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        isAuthenticated: !!user,
        signOut,
        refreshProfile,
        signInDev,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
