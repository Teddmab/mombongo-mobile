import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
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
    walletUsd: data.walletUsd as number | undefined,
    totalInvestedUsd: data.totalInvestedUsd as number | undefined,
    totalEarnedUsd: data.totalEarnedUsd as number | undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const devMode = isDevMode();
  const { role, isReady } = useApp();
  const [user, setUser] = useState<FirebaseUser | null>(devMode ? DEV_MOCK_USER : null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(
    devMode ? DEV_MOCK_PROFILE : null,
  );
  const [isLoading, setIsLoading] = useState(!devMode);

  useEffect(() => {
    if (!devMode || !isReady) return;
    setUser(DEV_MOCK_USER);
    setUserProfile({ ...DEV_MOCK_PROFILE, role: role as UserRole });
    setIsLoading(false);
  }, [devMode, isReady, role]);

  const refreshProfile = async () => {
    if (devMode || !user) return;
    try {
      const result = await getUserProfileFn({});
      setUserProfile(normalizeProfile(result.data ?? null));
    } catch {
      setUserProfile(null);
    }
  };

  const signInDev = useCallback(async (role: Role) => {
    if (!devMode) return;
    setUser(DEV_MOCK_USER);
    setUserProfile({ ...DEV_MOCK_PROFILE, role: role as UserRole });
  }, [devMode]);

  const signOut = useCallback(async () => {
    if (devMode) {
      setUser(DEV_MOCK_USER);
      setUserProfile({ ...DEV_MOCK_PROFILE, role: role as UserRole });
      return;
    }
    await firebaseSignOut(auth);
  }, [devMode, role]);

  useEffect(() => {
    if (devMode) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsLoading(false);
        try {
          const result = await getUserProfileFn({});
          setUserProfile(normalizeProfile(result.data ?? null));
        } catch {
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [devMode]);

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
