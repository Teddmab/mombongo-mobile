import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, type Role } from "@/context/AppContext";
import { useFullScreenInsets } from "@/hooks/useSafeInsets";
import { useAuth } from "@/hooks/useAuth";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { authService, AuthServiceError } from "@/services/auth.service";
import { colors, radii, shadows, spacing } from "@/theme";

type Mode = "login" | "signup" | "forgot";
type Step = "role" | "auth";

const ROLES: {
  id: Role;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  key: string;
  desc: string;
}[] = [
  {
    id: "investor",
    icon: "trending-up",
    iconBg: colors.green[100],
    iconColor: colors.green[700],
    key: "auth.roleInvestor",
    desc: "Investissez dans des produits agricoles et suivez vos rendements.",
  },
  {
    id: "farmer",
    icon: "leaf",
    iconBg: "#ECFCCB",
    iconColor: "#4D7C0F",
    key: "auth.roleFarmer",
    desc: "Gérez votre exploitation, vos financements et votre cycle cultural.",
  },
  {
    id: "merchant",
    icon: "storefront-outline",
    iconBg: colors.purple[100],
    iconColor: colors.purple[700],
    key: "auth.roleMerchant",
    desc: "Sourcez et commandez des produits agricoles pour votre commerce.",
  },
  {
    id: "agent",
    icon: "clipboard-outline",
    iconBg: colors.amber[100],
    iconColor: colors.amber[700],
    key: "auth.roleAgent",
    desc: "Suivez vos agriculteurs, soumettez des rapports de terrain.",
  },
];

export function AuthScreen() {
  const { t } = useTranslation();
  const { setRole, role } = useApp();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { top } = useFullScreenInsets();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>("role");
  const [mode, setMode] = useState<Mode>("login");
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [fullName, setFullName] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, isLoading, router]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await authService.signIn(email, pwd);
      // onAuthStateChanged + useEffect isAuthenticated handles redirect
    } catch (e) {
      setError(e instanceof AuthServiceError ? e.userMessage : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError(null);
    setLoading(true);
    try {
      await authService.signUp(email, pwd, fullName, role);
    } catch (e) {
      setError(e instanceof AuthServiceError ? e.userMessage : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    setError(null);
    setLoading(true);
    try {
      await authService.resetPassword(email);
      setSuccess(t("auth.resetSent"));
    } catch (e) {
      setError(e instanceof AuthServiceError ? e.userMessage : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const modeHeader = {
    login: { title: t("auth.title"), sub: t("auth.subtitle") },
    signup: { title: t("auth.signupTitle"), sub: t("auth.signupSubtitle") },
    forgot: { title: t("auth.forgotTitle"), sub: t("auth.forgotSubtitle") },
  }[mode];

  const roleHeader = {
    title: "Qui êtes-vous ?",
    sub: "Choisissez votre profil pour personnaliser votre expérience.",
  };

  const header = step === "role" ? roleHeader : modeHeader;

  if (isLoading) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.white} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      testID="auth-screen"
    >
      <View style={[styles.hero, { paddingTop: top + spacing["2xl"] }]}>
        <View style={styles.blob} />
        <View style={styles.heroIcon}>
          <Text style={{ fontSize: 18 }}>🌿</Text>
        </View>
        <Text style={styles.heroTitle}>{header.title}</Text>
        <Text style={styles.heroSub}>{header.sub}</Text>
      </View>

      <ScrollView
        style={styles.sheet}
        contentContainerStyle={[styles.sheetContent, { paddingBottom: Math.max(insets.bottom, spacing["2xl"]) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {success ? (
          <View style={styles.bannerSuccess} testID="auth-success">
            <Text style={styles.bannerSuccessText}>{success}</Text>
            <Pressable onPress={() => setSuccess(null)} hitSlop={8}>
              <Ionicons name="close" size={16} color={colors.green[700]} />
            </Pressable>
          </View>
        ) : null}

        {error ? (
          <View style={styles.bannerError} testID="auth-error">
            <Text style={styles.bannerErrorText}>{error}</Text>
            <Pressable onPress={() => setError(null)} hitSlop={8}>
              <Ionicons name="close" size={16} color="#B91C1C" />
            </Pressable>
          </View>
        ) : null}

        {step === "role" ? (
          <View style={styles.gap}>
            <View style={styles.roleGrid}>
              {ROLES.map((r) => {
                const selected = role === r.id;
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => setRole(r.id)}
                    style={[styles.roleCard, selected && styles.roleCardSelected]}
                  >
                    <View style={[styles.roleIconWrap, { backgroundColor: r.iconBg }]}>
                      <Ionicons name={r.icon} size={20} color={r.iconColor} />
                    </View>
                    <Text style={[styles.roleTitle, selected && styles.roleTitleSelected]}>
                      {t(r.key)}
                    </Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              testID="role-step-continue"
              onPress={() => setStep("auth")}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Continuer</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </Pressable>

            <Text style={styles.footerHint}>
              Vous avez déjà un compte ?{" "}
              <Text
                style={styles.link}
                onPress={() => {
                  setStep("auth");
                  switchMode("login");
                }}
              >
                Se connecter →
              </Text>
            </Text>
          </View>
        ) : (
          <View style={styles.gap}>
            {mode !== "forgot" ? (
              <Pressable onPress={() => setStep("role")} style={styles.roleChip}>
                {(() => {
                  const r = ROLES.find((x) => x.id === role);
                  if (!r) return null;
                  return (
                    <>
                      <View style={[styles.roleChipIcon, { backgroundColor: r.iconBg }]}>
                        <Ionicons name={r.icon} size={12} color={r.iconColor} />
                      </View>
                      <Text style={styles.roleChipText}>{t(r.key)}</Text>
                      <Text style={styles.roleChipEdit}>· Modifier</Text>
                    </>
                  );
                })()}
              </Pressable>
            ) : null}

            {mode === "signup" ? (
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={16} color={colors.gray[400]} style={styles.inputIcon} />
                <TextInput
                  testID="fullname-input"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={t("auth.fullNamePlaceholder")}
                  placeholderTextColor={colors.gray[400]}
                  style={styles.input}
                />
              </View>
            ) : null}

            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={16} color={colors.gray[400]} style={styles.inputIcon} />
              <TextInput
                testID="email-input"
                value={email}
                onChangeText={setEmail}
                placeholder={t("auth.emailPlaceholder")}
                placeholderTextColor={colors.gray[400]}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {mode !== "forgot" ? (
              <View style={styles.inputWrap}>
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={colors.gray[400]}
                  style={styles.inputIcon}
                />
                <TextInput
                  testID="password-input"
                  value={pwd}
                  onChangeText={setPwd}
                  placeholder={t("auth.passwordPlaceholder")}
                  placeholderTextColor={colors.gray[400]}
                  secureTextEntry={!showPwd}
                  style={[styles.input, { paddingRight: 44 }]}
                />
                <Pressable onPress={() => setShowPwd((v) => !v)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPwd ? "eye-off-outline" : "eye-outline"}
                    size={16}
                    color={colors.gray[400]}
                  />
                </Pressable>
              </View>
            ) : null}

            {mode === "login" ? (
              <View style={styles.loginRow}>
                <View style={styles.rememberRow}>
                  <Switch
                    value={remember}
                    onValueChange={setRemember}
                    trackColor={{ false: colors.gray[200], true: colors.green[700] }}
                    thumbColor={colors.white}
                  />
                  <Text style={styles.rememberText}>Se souvenir de moi</Text>
                </View>
                <Pressable onPress={() => switchMode("forgot")} testID="switch-to-forgot">
                  <Text style={styles.link}>{t("auth.forgot")}</Text>
                </Pressable>
              </View>
            ) : null}

            {mode === "login" ? (
              <>
                <Pressable
                  testID="login-submit"
                  onPress={handleLogin}
                  disabled={loading}
                  style={[styles.primaryBtn, loading && styles.btnDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnText}>{t("auth.continue")}</Text>
                      <Ionicons name="arrow-forward" size={16} color={colors.white} />
                    </>
                  )}
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>{t("auth.or")}</Text>
                  <View style={styles.divider} />
                </View>

                <GoogleSignInButton
                  role={role}
                  loading={loading}
                  setLoading={setLoading}
                  setError={setError}
                />

                <Text style={styles.footerHint}>
                  {t("auth.noAccount")}{" "}
                  <Text style={styles.link} onPress={() => switchMode("signup")} testID="switch-to-signup">
                    → {t("auth.signup")}
                  </Text>
                </Text>
              </>
            ) : null}

            {mode === "signup" ? (
              <>
                <Pressable
                  testID="signup-submit"
                  onPress={handleSignup}
                  disabled={loading}
                  style={[styles.primaryBtn, loading && styles.btnDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnText}>{t("auth.createCta")}</Text>
                      <Ionicons name="arrow-forward" size={16} color={colors.white} />
                    </>
                  )}
                </Pressable>
                <Text style={styles.footerHint}>
                  {t("auth.alreadyAccount")}{" "}
                  <Text style={styles.link} onPress={() => switchMode("login")} testID="switch-to-login">
                    {t("auth.backToLogin")}
                  </Text>
                </Text>
              </>
            ) : null}

            {mode === "forgot" ? (
              <>
                <Pressable
                  testID="forgot-submit"
                  onPress={handleForgot}
                  disabled={loading || !!success}
                  style={[styles.primaryBtn, (loading || !!success) && styles.btnDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.primaryBtnText}>{t("auth.sendReset")}</Text>
                  )}
                </Pressable>
                <Pressable onPress={() => switchMode("login")} testID="switch-to-login">
                  <Text style={[styles.link, styles.centerLink]}>
                    ← {t("auth.backToLogin")}
                  </Text>
                </Pressable>
              </>
            ) : null}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  loading: {
    flex: 1,
    backgroundColor: colors.green[700],
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    backgroundColor: colors.green[700],
    paddingHorizontal: spacing["2xl"],
    paddingBottom: spacing["3xl"],
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    top: -80,
    right: -64,
    width: 224,
    height: 224,
    borderRadius: 112,
    backgroundColor: "rgba(45, 115, 73, 0.4)",
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    marginTop: spacing.lg,
    fontSize: 26,
    fontWeight: "800",
    color: colors.white,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  heroSub: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "NotoSans_400Regular",
  },
  sheet: {
    flex: 1,
    marginTop: -spacing["2xl"],
    backgroundColor: colors.white,
    borderTopLeftRadius: radii["3xl"],
    borderTopRightRadius: radii["3xl"],
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["2xl"],
  },
  gap: { gap: spacing.md },
  bannerSuccess: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.green[50],
    borderWidth: 1,
    borderColor: colors.green[200],
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  bannerSuccessText: { flex: 1, fontSize: 13, color: colors.green[700] },
  bannerError: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  bannerErrorText: { flex: 1, fontSize: 13, color: "#B91C1C" },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  roleCard: {
    width: "47%",
    flexGrow: 1,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  roleCardSelected: {
    borderColor: colors.green[700],
    backgroundColor: colors.green[50],
  },
  roleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_700Bold",
  },
  roleTitleSelected: { color: colors.green[700] },
  roleDesc: {
    fontSize: 11,
    color: colors.gray[500],
    marginTop: 2,
    lineHeight: 15,
    fontFamily: "NotoSans_400Regular",
  },
  primaryBtn: {
    height: 48,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadows.elevated,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  btnDisabled: { opacity: 0.6 },
  footerHint: {
    textAlign: "center",
    fontSize: 12,
    color: colors.gray[500],
    fontFamily: "NotoSans_400Regular",
  },
  link: {
    color: colors.green[700],
    fontWeight: "700",
  },
  centerLink: { textAlign: "center", marginTop: spacing.xs },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.gray[100],
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: 6,
    marginBottom: spacing.xs,
  },
  roleChipIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  roleChipText: { fontSize: 12, fontWeight: "600", color: colors.gray[700] },
  roleChipEdit: { fontSize: 12, color: colors.gray[400] },
  inputWrap: { position: "relative" },
  inputIcon: { position: "absolute", left: 14, top: 16, zIndex: 1 },
  input: {
    height: 48,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    paddingLeft: 40,
    paddingRight: spacing.lg,
    fontSize: 14,
    color: colors.gray[900],
    fontFamily: "NotoSans_400Regular",
  },
  eyeBtn: { position: "absolute", right: 12, top: 14 },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rememberText: { fontSize: 12, color: colors.gray[500] },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginVertical: spacing.xs },
  divider: { flex: 1, height: 1, backgroundColor: colors.gray[200] },
  dividerText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    letterSpacing: 2,
  },
  googleBtn: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.gray[700],
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
});
