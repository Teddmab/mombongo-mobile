import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import type { Role } from "@/context/AppContext";
import { useApp } from "@/context/AppContext";
import { auth, functions } from "@/lib/firebase";
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
}

export const AuthContext = createContext<AuthContextValue | null>(null);

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
  const { role } = useApp();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const result = await getUserProfileFn({});
      setUserProfile(normalizeProfile(result.data ?? null));
    } catch {
      setUserProfile(null);
    }
  };

  const signOut = useCallback(async () => {
    setUser(null);
    setUserProfile(null);
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore sign-out failures
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
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

      setUser(null);
      setUserProfile(null);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
