import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Role } from "@/context/AppContext";
import type { AuthUser } from "@/services/auth.service";

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
  user: AuthUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (user: AuthUser, role: Role) => Promise<void>;
  signOut: () => Promise<void>;
}

const SESSION_KEY = "mb_auth_session";

export const AuthContext = createContext<AuthContextValue | null>(null);

function buildProfile(user: AuthUser, role: Role): UserProfile {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: role as UserRole,
    walletUsd: 500,
    totalInvestedUsd: 4850,
    totalEarnedUsd: 342,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { user: AuthUser; profile: UserProfile };
          setUser(parsed.user);
          setUserProfile(parsed.profile);
        }
      } catch {
        // ignore corrupt session
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (authUser: AuthUser, role: Role) => {
    const profile = buildProfile(authUser, role);
    setUser(authUser);
    setUserProfile(profile);
    await AsyncStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ user: authUser, profile }),
    );
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setUserProfile(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
