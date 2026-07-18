import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import type { Role } from "@/context/AppContext";
import type { UserRole } from "@/context/AuthContext";
import {
  getGoogleOAuthConfig,
  isExpoGo,
  isGoogleSignInConfigured,
  isNativeGoogleSignInAvailable,
} from "@/lib/google-auth.config";
import { authService, AuthServiceError } from "@/services/auth.service";

let configured = false;

function ensureGoogleConfigured() {
  if (configured) return;
  const { webClientId, iosClientId } = getGoogleOAuthConfig();
  if (!webClientId) return;
  GoogleSignin.configure({
    webClientId,
    ...(iosClientId ? { iosClientId } : {}),
    offlineAccess: false,
  });
  configured = true;
}

export function useGoogleSignIn(options: {
  role: Role;
  onError: (message: string) => void;
  onSettled?: () => void;
}) {
  const { role, onError, onSettled } = options;
  const processing = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isNativeGoogleSignInAvailable()) {
      setReady(false);
      return;
    }
    try {
      ensureGoogleConfigured();
      setReady(true);
    } catch {
      setReady(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (isExpoGo()) {
      onError(
        "Google Sign-In natif nécessite un build EAS (pas Expo Go). Lancez : eas build -p android --profile preview",
      );
      onSettled?.();
      return;
    }

    if (!isGoogleSignInConfigured()) {
      onError("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID manquant dans .env");
      onSettled?.();
      return;
    }

    if (processing.current) return;
    processing.current = true;

    try {
      ensureGoogleConfigured();
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        onSettled?.();
        return;
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        onError("Token Google manquant. Vérifiez le Web Client ID Firebase.");
        onSettled?.();
        return;
      }

      await authService.signInWithGoogleIdToken(idToken, role as UserRole);
    } catch (e) {
      if (isErrorWithCode(e)) {
        if (e.code === statusCodes.SIGN_IN_CANCELLED) {
          onSettled?.();
          return;
        }
        if (e.code === statusCodes.IN_PROGRESS) {
          onError("Connexion Google déjà en cours…");
          onSettled?.();
          return;
        }
        if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          onError("Google Play Services indisponible sur cet appareil.");
          onSettled?.();
          return;
        }
      }
      onError(e instanceof AuthServiceError ? e.userMessage : "Erreur Google Sign-In");
    } finally {
      processing.current = false;
      onSettled?.();
    }
  }, [role, onError, onSettled]);

  return {
    signInWithGoogle,
    isGoogleReady: ready && isNativeGoogleSignInAvailable(),
    isExpoGo: isExpoGo(),
  };
}
