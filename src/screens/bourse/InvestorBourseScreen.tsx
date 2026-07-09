import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { BourseTickerBar } from "@/components/bourse/BourseTickerBar";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { bourseOpportunities, type BourseOpportunity } from "@/data/mock";
import { colors, radii, spacing } from "@/theme";

const TYPE_ICON: Record<
  BourseOpportunity["type"],
  keyof typeof Ionicons.glyphMap
> = {
  transport: "bus-outline",
  stockage: "archive-outline",
  transformation: "construct-outline",
};

export function InvestorBourseScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scrollPadding = useTabScrollPadding();

  return (
    <TabScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, scrollPadding]}
        testID="bourse-screen"
      >
        <BourseTickerBar />

        <View style={styles.kpiCard}>
          {[
            { l: t("bourse.volumeDayShort"), v: "12.4M FC", d: "+8.2%", up: true },
            { l: t("bourse.opportunities"), v: "24", d: "+3", up: true },
            { l: t("bourse.commShort"), v: "19%", d: "-0.4%", up: false },
          ].map((s) => (
            <View key={s.l} style={styles.kpiCell}>
              <Text style={styles.kpiLabel}>{s.l}</Text>
              <Text style={styles.kpiValue}>{s.v}</Text>
              <View style={styles.kpiDeltaRow}>
                <Ionicons
                  name={s.up ? "trending-up" : "trending-down"}
                  size={12}
                  color={s.up ? colors.success : colors.danger}
                />
                <Text
                  style={[
                    styles.kpiDelta,
                    { color: s.up ? colors.success : colors.danger },
                  ]}
                >
                  {s.d}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>{t("bourse.openOpportunities")}</Text>

        <View style={styles.list}>
          {bourseOpportunities.map((o) => {
            const filled = ((o.spotsTotal - o.spotsLeft) / o.spotsTotal) * 100;
            return (
              <Pressable
                key={o.id}
                onPress={() => router.push(`/bourse/${o.id}` as never)}
                style={styles.oppCard}
              >
                <View style={styles.oppIcon}>
                  <Ionicons
                    name={TYPE_ICON[o.type]}
                    size={20}
                    color={colors.amber[700]}
                  />
                </View>
                <View style={styles.oppBody}>
                  <View style={styles.oppTitleRow}>
                    <Text style={styles.oppTitle} numberOfLines={2}>
                      {o.title}
                    </Text>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{o.type.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.oppMeta}>
                    {o.volume} · {o.duration}
                  </Text>
                  <View style={styles.oppStats}>
                    <View>
                      <Text style={styles.statLabel}>{t("bourse.ticket")}</Text>
                      <Text style={styles.statValue}>{o.price}</Text>
                    </View>
                    <View style={styles.statRight}>
                      <Text style={styles.statLabel}>{t("bourse.comm")}</Text>
                      <Text style={[styles.statValue, styles.commValue]}>
                        +{o.commission}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.spotsRow}>
                    <Ionicons name="people-outline" size={12} color={colors.gray[500]} />
                    <Text style={styles.spotsText}>
                      {o.spotsLeft}/{o.spotsTotal} {t("bourse.places")}
                    </Text>
                    <View style={styles.spotsTrack}>
                      <View style={[styles.spotsFill, { width: `${filled}%` }]} />
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 0,
    gap: spacing.md,
  },
  kpiCard: {
    marginHorizontal: SCREEN_HORIZONTAL_PADDING,
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: "row",
  },
  kpiCell: { flex: 1, alignItems: "center" },
  kpiLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    textAlign: "center",
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.gray[900],
    marginTop: 2,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  kpiDeltaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  kpiDelta: { fontSize: 10, fontWeight: "700" },
  sectionLabel: {
    marginHorizontal: SCREEN_HORIZONTAL_PADDING,
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  list: {
    marginHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: 10,
  },
  oppCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
  },
  oppIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.amber[50],
    alignItems: "center",
    justifyContent: "center",
  },
  oppBody: { flex: 1, minWidth: 0 },
  oppTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  oppTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.gray[900],
    lineHeight: 18,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  typeBadge: {
    backgroundColor: colors.amber[400],
    borderRadius: radii.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: colors.amber[900],
    letterSpacing: 0.5,
  },
  oppMeta: {
    fontSize: 11,
    color: colors.gray[500],
    marginTop: spacing.xs,
    fontFamily: "NotoSans_400Regular",
  },
  oppStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statRight: { alignItems: "flex-end" },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  commValue: { color: colors.success },
  spotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
  },
  spotsText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.gray[500],
  },
  spotsTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.gray[100],
    borderRadius: 2,
    marginLeft: spacing.sm,
    overflow: "hidden",
  },
  spotsFill: {
    height: "100%",
    backgroundColor: colors.amber[400],
    borderRadius: 2,
  },
});
