import i18n from "@/i18n";
import { isDevMode } from "@/lib/dev";
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

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

class AuthService {
  async signIn(email: string, _password: string): Promise<AuthUser> {
    if (!email.trim()) {
      throw new AuthServiceError("invalid-email", i18n.t("auth.error.invalidEmail"));
    }
    if (isDevMode()) {
      return {
        uid: "dev-user-001",
        email,
        displayName: email.split("@")[0] || "Utilisateur",
        photoURL: null,
      };
    }
    throw new AuthServiceError("not-implemented", i18n.t("common.error"));
  }

  async signUp(
    email: string,
    password: string,
    fullName: string,
    _role: UserRole,
  ): Promise<AuthUser> {
    if (!fullName.trim()) {
      throw new AuthServiceError("invalid-name", i18n.t("common.error"));
    }
    if (password.length < 6) {
      throw new AuthServiceError("weak-password", i18n.t("auth.error.weakPassword"));
    }
    return this.signIn(email, password).then((u) => ({ ...u, displayName: fullName }));
  }

  async signInWithGoogle(): Promise<AuthUser> {
    if (isDevMode()) {
      return {
        uid: "dev-google-001",
        email: "google@mombongo.cd",
        displayName: "Google User",
        photoURL: null,
      };
    }
    throw new AuthServiceError("not-implemented", i18n.t("common.error"));
  }

  async resetPassword(email: string): Promise<void> {
    if (!email.trim()) {
      throw new AuthServiceError("invalid-email", i18n.t("auth.error.invalidEmail"));
    }
    if (isDevMode()) return;
    throw new AuthServiceError("not-implemented", i18n.t("common.error"));
  }
}

export const authService = new AuthService();
