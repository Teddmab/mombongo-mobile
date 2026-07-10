import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import type { Role } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import { isDevMode } from "@/lib/dev";
import { isGoogleSignInConfigured } from "@/lib/google-auth.config";
import { colors, radii, spacing } from "@/theme";

function GoogleIcon() {
  return <Text style={{ fontSize: 16 }}>G</Text>;
}

function GoogleSignInButtonLive({
  role,
  loading,
  setLoading,
  setError,
}: {
  role: Role;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setError: (m: string | null) => void;
}) {
  const { t } = useTranslation();
  const { signInWithGoogle, isGoogleReady } = useGoogleSignIn({
    role,
    onError: setError,
    onSettled: () => setLoading(false),
  });

  const handlePress = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!isGoogleReady) {
        setError("Google Sign-In non configuré. Ajoutez EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID dans .env");
        setLoading(false);
        return;
      }
      await signInWithGoogle();
    } catch {
      setError("Erreur lors de la connexion Google.");
      setLoading(false);
    }
  };

  return (
    <Pressable
      testID="google-signin"
      onPress={handlePress}
      disabled={loading || !isGoogleReady}
      style={[styles.googleBtn, (loading || !isGoogleReady) && styles.btnDisabled]}
    >
      <GoogleIcon />
      <Text style={styles.googleBtnText}>{t("auth.google")}</Text>
    </Pressable>
  );
}

function GoogleSignInButtonDev({
  role,
  loading,
  setLoading,
  setError,
}: {
  role: Role;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setError: (m: string | null) => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { signInDev } = useAuth();

  const handlePress = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInDev(role);
      router.replace("/(tabs)/home");
    } catch {
      setError("Erreur lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      testID="google-signin"
      onPress={handlePress}
      disabled={loading}
      style={[styles.googleBtn, loading && styles.btnDisabled]}
    >
      <GoogleIcon />
      <Text style={styles.googleBtnText}>{t("auth.google")}</Text>
    </Pressable>
  );
}

/** Bouton Google — hook OAuth uniquement en live + config présente (évite le crash iOS). */
export function GoogleSignInButton({
  role,
  loading,
  setLoading,
  setError,
}: {
  role: Role;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setError: (m: string | null) => void;
}) {
  if (isDevMode()) {
    return (
      <GoogleSignInButtonDev
        role={role}
        loading={loading}
        setLoading={setLoading}
        setError={setError}
      />
    );
  }

  if (!isGoogleSignInConfigured()) {
    const msg =
      "Google non configuré : ajoutez EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID dans .env (Firebase → Auth → Google → Web client ID), puis relancez Expo avec --clear.";

    return (
      <Pressable
        testID="google-signin"
        onPress={() => setError(msg)}
        style={[styles.googleBtn, styles.googleBtnUnconfigured]}
      >
        <GoogleIcon />
        <Text style={styles.googleBtnText}>Continuer avec Google</Text>
      </Pressable>
    );
  }

  return (
    <GoogleSignInButtonLive
      role={role}
      loading={loading}
      setLoading={setLoading}
      setError={setError}
    />
  );
}

const styles = StyleSheet.create({
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 48,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  btnDisabled: { opacity: 0.5 },
  googleBtnUnconfigured: { opacity: 0.85, borderColor: colors.amber[500] },
  googleBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.gray[800],
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
