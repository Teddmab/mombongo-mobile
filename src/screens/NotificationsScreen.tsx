import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackHeader } from "@/components/shell/StackHeader";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useNotifications, type Notification } from "@/hooks/useLocalData";
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
  const insets = useSafeAreaInsets();
  const { data: initialNotifs = [] } = useNotifications();
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    setItems(initialNotifs);
  }, [initialNotifs]);
  const unread = items.filter((n) => !n.read).length;

  const grouped = useMemo(() => {
    const map: Record<string, Notification[]> = {};
    items.forEach((n) => {
      if (!map[n.date]) map[n.date] = [];
      map[n.date].push(n);
    });
    return map;
  }, [items]);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <View style={styles.root} testID="notifications-screen">
      <StackHeader title="Notifications" />

      <View style={styles.toolbar}>
        {unread > 0 ? (
          <Text style={styles.unreadText}>
            {unread} non lue{unread > 1 ? "s" : ""}
          </Text>
        ) : (
          <Text style={styles.unreadText}>Tout est lu</Text>
        )}
        {unread > 0 ? (
          <Pressable onPress={markAllRead} style={styles.markAllBtn}>
            <Ionicons name="checkmark-done" size={14} color={colors.gray[600]} />
            <Text style={styles.markAllText}>Tout lire</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 16) + spacing.lg,
        }}
      >
        {Object.entries(grouped).map(([date, group]) => (
          <View key={date}>
            <Text style={styles.dateLabel}>{date}</Text>
            {group.map((n) => {
              const meta = KIND_META[n.kind];
              return (
                <Pressable
                  key={n.id}
                  onPress={() => markRead(n.id)}
                  style={[styles.item, !n.read && styles.itemUnread]}
                >
                  <View style={[styles.itemIcon, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={18} color={meta.color} />
                  </View>
                  <View style={styles.itemBody}>
                    <View style={styles.itemTop}>
                      <Text style={[styles.itemTitle, !n.read && styles.itemTitleUnread]} numberOfLines={2}>
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

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={40} color={colors.gray[400]} style={{ opacity: 0.4 }} />
            <Text style={styles.emptyText}>Aucune notification</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>Les notifications sont conservées 30 jours</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBackground },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    backgroundColor: colors.white,
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
