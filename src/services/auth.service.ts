import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  type User as FirebaseUser,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import i18n from "@/i18n";
import { auth, functions, isDevMode } from "@/lib/firebase";
import type { UserRole } from "@/context/AuthContext";

export class AuthServiceError extends Error {
  constructor(
    public code: string,
    public userMessage: string,
  ) {
    super(userMessage);
    this.name = "AuthServiceError";
  }
}

const ERROR_MAP: Record<string, string> = {
  "auth/user-not-found": "auth.error.userNotFound",
  "auth/wrong-password": "auth.error.wrongPassword",
  "auth/invalid-credential": "auth.error.wrongPassword",
  "auth/email-already-in-use": "auth.error.emailInUse",
  "auth/weak-password": "auth.error.weakPassword",
  "auth/invalid-email": "auth.error.invalidEmail",
  "auth/network-request-failed": "auth.error.network",
  "auth/too-many-requests": "auth.error.tooManyRequests",
  "auth/operation-not-allowed": "auth.error.operationNotAllowed",
};

function toAuthError(err: unknown): AuthServiceError {
  const e = err as { code?: string; message?: string };
  const code = e?.code ?? "unknown";

  if (code.startsWith("functions/")) {
    return new AuthServiceError(code, i18n.t("auth.error.service"));
  }

  const key = ERROR_MAP[code];
  if (key) return new AuthServiceError(code, i18n.t(key));

  if (e.message && !e.message.startsWith("Firebase:")) {
    return new AuthServiceError(code, e.message);
  }

  return new AuthServiceError(code, i18n.t("common.error"));
}

class AuthService {
  async signIn(email: string, password: string): Promise<FirebaseUser> {
    if (isDevMode()) {
      return { uid: "dev-user-001", email } as unknown as FirebaseUser;
    }
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (e) {
      throw toAuthError(e);
    }
  }

  async signUp(
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
  ): Promise<FirebaseUser> {
    if (isDevMode()) {
      return {
        uid: "dev-user-001",
        email,
        displayName: fullName,
      } as unknown as FirebaseUser;
    }
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: fullName });
      await httpsCallable(functions, "createUserProfile")({
        fullName,
        email,
        role,
        preferredLanguage: (i18n.language as "fr" | "en" | "ln") ?? "fr",
      });
      return user;
    } catch (e) {
      throw toAuthError(e);
    }
  }

  async signInWithGoogleIdToken(idToken: string, role: UserRole): Promise<FirebaseUser> {
    if (isDevMode()) {
      return {
        uid: "dev-google-001",
        email: "google@mombongo.cd",
        displayName: "Google User",
      } as unknown as FirebaseUser;
    }
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const { user } = await signInWithCredential(auth, credential);
      await httpsCallable(functions, "createUserProfile")({
        fullName: user.displayName ?? "",
        email: user.email ?? "",
        role,
        preferredLanguage: (i18n.language as "fr" | "en" | "ln") ?? "fr",
        avatarUrl: user.photoURL,
      });
      return user;
    } catch (e) {
      throw toAuthError(e);
    }
  }

  async resetPassword(email: string): Promise<void> {
    if (!email.trim()) {
      throw new AuthServiceError("invalid-email", i18n.t("auth.error.invalidEmail"));
    }
    if (isDevMode()) return;
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e) {
      throw toAuthError(e);
    }
  }
}

export const authService = new AuthService();
