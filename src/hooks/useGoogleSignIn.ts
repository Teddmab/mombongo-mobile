import { useCallback, useEffect, useRef } from "react";
import * as Google from "expo-auth-session/providers/google";
import type { Role } from "@/context/AppContext";
import type { UserRole } from "@/context/AuthContext";
import { getGoogleOAuthConfig, isGoogleSignInConfigured } from "@/lib/google-auth.config";
import { authService, AuthServiceError } from "@/services/auth.service";

export function useGoogleSignIn(options: {
  role: Role;
  onError: (message: string) => void;
  onSettled?: () => void;
}) {
  const { role, onError, onSettled } = options;
  const oauth = getGoogleOAuthConfig();
  const processing = useRef(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: oauth.webClientId!,
    iosClientId: oauth.iosClientId!,
    androidClientId: oauth.androidClientId!,
  });

  useEffect(() => {
    if (!response || processing.current) return;

    if (response.type === "success") {
      const idToken = response.params.id_token;
      if (!idToken) {
        onError("Token Google manquant.");
        onSettled?.();
        return;
      }

      processing.current = true;
      void authService
        .signInWithGoogleIdToken(idToken, role as UserRole)
        .catch((e) => {
          onError(e instanceof AuthServiceError ? e.userMessage : "Erreur Google");
        })
        .finally(() => {
          processing.current = false;
          onSettled?.();
        });
      return;
    }

    if (response.type === "error") {
      onError(response.error?.message ?? "Connexion Google échouée");
      onSettled?.();
      return;
    }

    if (response.type === "dismiss" || response.type === "cancel") {
      onSettled?.();
    }
  }, [response, role, onError, onSettled]);

  const signInWithGoogle = useCallback(async () => {
    if (!isGoogleSignInConfigured()) {
      onError("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID manquant dans .env");
      onSettled?.();
      return;
    }
    if (!request) {
      onError("Google Sign-In pas encore prêt, réessayez.");
      onSettled?.();
      return;
    }
    await promptAsync();
  }, [request, promptAsync, onError, onSettled]);

  return {
    signInWithGoogle,
    isGoogleReady: Boolean(request) && isGoogleSignInConfigured(),
  };
}
