import { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { StackHeader } from "@/components/shell/StackHeader";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  type Notification,
} from "@/hooks/useNotifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { colors, radii, spacing } from "@/theme";

const KIND_META: Record<
  Notification["kind"],
  { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string }
> = {
  profit: { icon: "cash-outline", bg: colors.green[50], color: colors.green[700] },
  opportunity: { icon: "trending-up-outline", bg: colors.amber[50], color: colors.amber[700] },
  report: { icon: "document-text-outline", bg: "#EFF6FF", color: "#2563EB" },
  course: { icon: "school-outline", bg: colors.purple[100], color: colors.purple[700] },
  system: { icon: "notifications-outline", bg: colors.gray[100], color: colors.gray[600] },
};

export function NotificationsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: items = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const { permission, enablePush } = usePushNotifications();

  const unread = items.filter((n) => !n.read).length;

  const grouped = useMemo(() => {
    const map: Record<string, Notification[]> = {};
    items.forEach((n) => {
      if (!map[n.date]) map[n.date] = [];
      map[n.date].push(n);
    });
    return map;
  }, [items]);

  const onEnablePush = async () => {
    const status = await enablePush();
    if (status === "granted") {
      Alert.alert("Mombongo", t("notifications.enabled"));
    } else if (status === "denied") {
      Alert.alert("Mombongo", t("notifications.denied"));
    } else {
      Alert.alert("Mombongo", t("notifications.unavailable"));
    }
  };

  return (
    <View style={styles.root} testID="notifications-screen">
      <StackHeader title={t("notifications.title")} />

      {permission !== "granted" ? (
        <Pressable
          onPress={() => void onEnablePush()}
          style={styles.enableBanner}
          testID="notification-enable-btn"
        >
          <Ionicons name="notifications-outline" size={18} color={colors.amber[900]} />
          <Text style={styles.enableText}>{t("notifications.enable")}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.amber[900]} />
        </Pressable>
      ) : (
        <View style={styles.enabledBanner} testID="notification-bell">
          <Ionicons name="notifications" size={16} color={colors.green[700]} />
          <Text style={styles.enabledText}>{t("notifications.enabled")}</Text>
        </View>
      )}

      <View style={styles.toolbar}>
        {unread > 0 ? (
          <Text style={styles.unreadText}>
            {t("notifications.unreadCount", { count: unread })}
          </Text>
        ) : (
          <Text style={styles.unreadText}>{t("notifications.allRead")}</Text>
        )}
        {unread > 0 ? (
          <Pressable
            onPress={() => markAll.mutate(items.map((n) => n.id))}
            style={styles.markAllBtn}
            disabled={markAll.isPending}
          >
            <Ionicons name="checkmark-done" size={14} color={colors.gray[600]} />
            <Text style={styles.markAllText}>{t("notifications.markAll")}</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 16) + spacing.lg,
        }}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.green[700]} style={{ marginTop: spacing.xl }} />
        ) : null}

        {Object.entries(grouped).map(([date, group]) => (
          <View key={date}>
            <Text style={styles.dateLabel}>{date}</Text>
            {group.map((n) => {
              const meta = KIND_META[n.kind];
              return (
                <Pressable
                  key={n.id}
                  onPress={() => {
                    if (!n.read) markRead.mutate(n.id);
                  }}
                  style={[styles.item, !n.read && styles.itemUnread]}
                >
                  <View style={[styles.itemIcon, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={18} color={meta.color} />
                  </View>
                  <View style={styles.itemBody}>
                    <View style={styles.itemTop}>
                      <Text
                        style={[styles.itemTitle, !n.read && styles.itemTitleUnread]}
                        numberOfLines={2}
                      >
                        {n.title}
                      </Text>
                      <Text style={styles.itemTime}>{n.time}</Text>
                    </View>
                    <Text style={styles.itemBodyText} numberOfLines={2}>
                      {n.body}
                    </Text>
                  </View>
                  {!n.read ? <View style={styles.dot} /> : null}
                </Pressable>
              );
            })}
          </View>
        ))}

        {!isLoading && items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="notifications-off-outline"
              size={40}
              color={colors.gray[400]}
              style={{ opacity: 0.4 }}
            />
            <Text style={styles.emptyText}>{t("notifications.empty")}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>{t("notifications.retention")}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBackground },
  enableBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: SCREEN_HORIZONTAL_PADDING,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.amber[50],
    borderWidth: 1,
    borderColor: colors.amber[100],
    borderRadius: radii.xl,
  },
  enableText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.amber[900],
  },
  enabledBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: SCREEN_HORIZONTAL_PADDING,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.green[50],
    borderRadius: radii.lg,
  },
  enabledText: { fontSize: 12, fontWeight: "600", color: colors.green[700] },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  unreadText: { fontSize: 12, color: colors.gray[500] },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.lg,
  },
  markAllText: { fontSize: 11, fontWeight: "700", color: colors.gray[600] },
  dateLabel: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  itemUnread: { backgroundColor: "rgba(238,246,240,0.5)" },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  itemBody: { flex: 1, minWidth: 0 },
  itemTop: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  itemTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_700Bold",
  },
  itemTitleUnread: { fontWeight: "800", fontFamily: "PlusJakartaSans_800ExtraBold" },
  itemTime: { fontSize: 10, color: colors.gray[400], marginTop: 2 },
  itemBodyText: { fontSize: 12, color: colors.gray[500], marginTop: 4, lineHeight: 17 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green[600],
    marginTop: 6,
  },
  empty: { alignItems: "center", paddingVertical: spacing["3xl"] },
  emptyText: { fontSize: 13, fontWeight: "600", color: colors.gray[400], marginTop: spacing.md },
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: colors.gray[400],
    marginTop: spacing.xl,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
});
