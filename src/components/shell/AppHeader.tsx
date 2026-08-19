import { Pressable, StyleSheet, Text, View, Image, Alert } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { logoMombongo } from "@/assets/images";
import { colors, spacing } from "@/theme";

const ROLE_BADGE = {
  investor: { label: "Investisseur", bg: colors.blue[100], text: colors.blue[700] },
  farmer: { label: "Agriculteur", bg: colors.green[100], text: colors.green[700] },
  agent: { label: "Agent terrain", bg: colors.amber[100], text: colors.amber[700] },
  merchant: { label: "Commerçant", bg: colors.purple[100], text: colors.purple[700] },
} as const;

const TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/home": { title: "Mombongo", subtitle: "home.greeting" },
  "/market": { title: "nav.market" },
  "/bourse": { title: "nav.bourse", subtitle: "bourse.subtitle" },
  "/academia": { title: "nav.academia", subtitle: "academia.subtitle" },
  "/profile": { title: "nav.profile" },
};

export function AppHeader() {
  const { t } = useTranslation();
  const { role } = useApp();
  const { userProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const unread = useUnreadNotificationCount();
  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.investor;
  const firstName = (userProfile?.displayName || "Alain").split(" ")[0];

  const routeKey = pathname.replace("/(tabs)", "") || "/home";
  const meta = TITLES[routeKey] ?? TITLES["/home"];
  const subtitleKey = meta.subtitle;

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Image
            source={logoMombongo}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.titles}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>
                {meta.title.startsWith("nav.") || meta.title === "Mombongo"
                  ? meta.title === "Mombongo"
                    ? "Mombongo"
                    : t(meta.title)
                  : meta.title}
              </Text>
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
              </View>
            </View>
            {subtitleKey ? (
              <Text style={styles.subtitle}>
                {subtitleKey === "home.greeting" ? t("home.greeting", { name: firstName }) : t(subtitleKey)}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => router.push("/notifications" as never)}
            testID="notification-bell"
            accessibilityLabel={t("notifications.enable")}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.gray[700]} />
            {unread > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unread > 9 ? "9+" : String(unread)}</Text>
              </View>
            ) : null}
          </Pressable>
          {routeKey === "/profile" ? (
            <Pressable
              style={styles.iconBtn}
              onPress={() => Alert.alert("Mombongo", "Paramètres — bientôt disponible")}
            >
              <Ionicons name="settings-outline" size={20} color={colors.gray[700]} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    paddingHorizontal: spacing.lg,
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  logo: { height: 28, width: 28 },
  titles: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_700Bold",
  },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 9, fontWeight: "800" },
  subtitle: {
    fontSize: 11,
    color: colors.gray[500],
    marginTop: 2,
    fontFamily: "NotoSans_400Regular",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: { flexDirection: "row", alignItems: "center" },
  unreadBadge: {
    position: "absolute",
    top: 6,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.white,
  },
});
