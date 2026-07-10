import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useAuth } from "@/hooks/useAuth";
import { useFeaturedProducts, type Product } from "@/hooks/useProducts";
import { useInvestments } from "@/hooks/useInvestments";
import { useActivity } from "@/hooks/useLocalData";
import { formatUsd } from "@/lib/utils";
import { colors, radii, shadows, spacing } from "@/theme";

const QUICK = [
  { icon: "cash-outline" as const, key: "invest", href: "/(tabs)/market", tone: "green" },
  { icon: "trending-up-outline" as const, key: "bourse", href: "/(tabs)/bourse", tone: "amber" },
  { icon: "school-outline" as const, key: "academia", href: "/(tabs)/academia", tone: "blue" },
  { icon: "leaf-outline" as const, key: "finance", href: "/financement", tone: "green" },
];

const ACTIVITY_ICONS = {
  profit: "cash-outline",
  opportunity: "megaphone-outline",
  report: "checkmark-circle-outline",
  course: "chatbubble-outline",
} as const;

function categoryStyle(category: Product["category"]) {
  if (category === "logistique") return { bg: colors.amber[50], color: colors.amber[500] };
  if (category === "export") return { bg: "#DBEAFE", color: "#2563EB" };
  return { bg: colors.green[50], color: colors.green[700] };
}

export function InvestorHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scrollPadding = useTabScrollPadding();
  const { userProfile } = useAuth();
  const { data: featured = [] } = useFeaturedProducts();
  const { data: investments = [] } = useInvestments();
  const { data: activity = [] } = useActivity();
  const totalInvested = formatUsd(userProfile?.totalInvestedUsd ?? 4850);
  const totalEarned = formatUsd(userProfile?.totalEarnedUsd ?? 342);

  return (
    <TabScreen>
      <ScrollView
        contentContainerStyle={[styles.content, scrollPadding]}
        showsVerticalScrollIndicator={false}
        testID="home-screen"
      >
      <View style={[styles.portfolioCard, shadows.elevated]}>
        <Text style={styles.portfolioLabel}>{t("home.portfolio")}</Text>
        <Text style={styles.portfolioValue}>{totalInvested}</Text>
        <Text style={styles.portfolioDelta}>
          ↑ +{totalEarned} {t("home.monthChange")} · +7.6% {t("home.avgRoi")}
        </Text>
        <View style={styles.divider} />
        <View style={styles.statsRow}>
          {[
            { l: t("home.invests"), v: "3" },
            { l: t("home.gains"), v: totalEarned },
            { l: t("home.nextReturn"), v: `12 ${t("home.days")}` },
          ].map((s) => (
            <View key={s.l} style={styles.stat}>
              <Text style={styles.statValue}>{s.v}</Text>
              <Text style={styles.statLabel}>{s.l}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.quickGrid}>
        {QUICK.map((q) => (
          <Pressable
            key={q.key}
            onPress={() => router.push(q.href as never)}
            style={styles.quickBtn}
          >
            <View style={styles.quickIcon}>
              <Ionicons name={q.icon} size={16} color={colors.green[700]} />
            </View>
            <Text style={styles.quickLabel}>{t(`home.actions.${q.key}`)}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>{t("home.active")}</Text>
      <View style={styles.gapSm}>
        {investments.map((inv) => {
          const isBourse = inv.badge === "BOURSE";
          return (
            <View key={inv.id} style={styles.investCard}>
              {inv.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{inv.badge}</Text>
                </View>
              ) : null}
              <View style={[styles.investIcon, isBourse ? styles.investIconAmber : styles.investIconGreen]}>
                <Ionicons
                  name={isBourse ? "stats-chart-outline" : "leaf-outline"}
                  size={20}
                  color={isBourse ? colors.amber[500] : colors.green[700]}
                />
              </View>
              <View style={styles.investBody}>
                <Text style={styles.investName} numberOfLines={1}>
                  {inv.name}
                </Text>
                <Text style={styles.investMeta}>
                  {inv.meta ||
                    `${t("home.harvest")}: ${inv.harvestDate} · ${inv.daysLeft} ${t("home.daysLeft")}`}
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${inv.progress}%`,
                        backgroundColor: isBourse ? colors.amber[400] : colors.green[700],
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.investRight}>
                <Text style={styles.investAmount}>
                  {inv.currency === "USD"
                    ? `$${inv.amount.toLocaleString()}`
                    : `${inv.amount.toLocaleString()} FC`}
                </Text>
                <Text style={styles.investRoi}>
                  +{inv.roi}% {isBourse ? t("home.commission") : "ROI"}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>{t("home.recent")}</Text>
      <View style={styles.activityCard}>
        {activity.map((a, idx) => {
          const tone =
            a.tone === "green"
              ? { bg: colors.green[50], text: colors.green[700] }
              : a.tone === "amber"
                ? { bg: colors.amber[50], text: colors.amber[700] }
                : { bg: "#DBEAFE", text: "#2563EB" };
          return (
            <View
              key={a.id}
              style={[styles.activityRow, idx < activity.length - 1 && styles.activityBorder]}
            >
              <View style={[styles.activityIcon, { backgroundColor: tone.bg }]}>
                <Ionicons
                  name={ACTIVITY_ICONS[a.kind]}
                  size={16}
                  color={tone.text}
                />
              </View>
              <View style={styles.activityBody}>
                <Text style={styles.activityTitle}>{a.title}</Text>
                <Text style={styles.activitySub} numberOfLines={1}>
                  {a.subtitle}
                </Text>
              </View>
              <View style={styles.activityRight}>
                {a.amount ? <Text style={styles.activityAmount}>{a.amount}</Text> : null}
                {a.cta && !a.amount ? (
                  <Text style={[styles.activityCta, { color: tone.text }]}>{a.cta}</Text>
                ) : null}
                <Text style={styles.activityTime}>{a.time}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.recoHeader}>
        <Text style={styles.sectionLabelInline}>{t("home.recommended")}</Text>
        <Pressable onPress={() => router.push("/(tabs)/market")}>
          <Text style={styles.seeAll}>
            {t("home.seeAll")} <Ionicons name="chevron-forward" size={12} color={colors.green[700]} />
          </Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recoRow}>
        {featured.map((p, i) => {
          const cs = categoryStyle(p.category);
          return (
            <Pressable
              key={p.id}
              style={styles.recoCard}
              onPress={() => router.push(`/(tabs)/market` as never)}
            >
              <View style={styles.recoTop}>
                <View style={[styles.recoIcon, { backgroundColor: cs.bg }]}>
                  <Ionicons
                    name={
                      p.category === "logistique"
                        ? "bus-outline"
                        : p.category === "export"
                          ? "bag-outline"
                          : "leaf-outline"
                    }
                    size={22}
                    color={cs.color}
                  />
                </View>
                <View
                  style={[
                    styles.recoTag,
                    i === 0 ? styles.recoTagNew : styles.recoTagExport,
                  ]}
                >
                  <Text style={[styles.recoTagText, i === 0 ? styles.recoTagNewText : styles.recoTagExportText]}>
                    {i === 0 ? t("home.newBadge") : t("market.export")}
                  </Text>
                </View>
              </View>
              <Text style={styles.recoName}>{p.name}</Text>
              <Text style={styles.recoLoc}>{p.location}</Text>
              <Text style={styles.recoRoi}>↑ {p.roi}% ROI</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SCREEN_HORIZONTAL_PADDING,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  portfolioCard: {
    backgroundColor: colors.green[700],
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  portfolioLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.white,
    marginTop: 6,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  portfolioDelta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 6,
    fontFamily: "NotoSans_400Regular",
  },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: spacing.lg },
  statsRow: { flexDirection: "row" },
  stat: { flex: 1, alignItems: "center" },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  quickGrid: { flexDirection: "row", gap: spacing.sm },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: 6,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    backgroundColor: colors.green[50],
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: colors.gray[500],
    textAlign: "center",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  sectionLabelInline: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  gapSm: { gap: spacing.sm },
  investCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.amber[400],
    borderRadius: radii.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 8, fontWeight: "800", color: colors.amber[900] },
  investIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  investIconGreen: { backgroundColor: colors.green[50] },
  investIconAmber: { backgroundColor: colors.amber[50] },
  investBody: { flex: 1, minWidth: 0 },
  investName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_700Bold",
  },
  investMeta: { fontSize: 11, color: colors.gray[400], marginTop: 2 },
  progressTrack: {
    height: 6,
    backgroundColor: colors.gray[100],
    borderRadius: 3,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  investRight: { alignItems: "flex-end" },
  investAmount: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  investRoi: { fontSize: 11, fontWeight: "700", color: colors.success, marginTop: 2 },
  activityCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  activityBody: { flex: 1, minWidth: 0 },
  activityTitle: { fontSize: 12, fontWeight: "700", color: colors.gray[900] },
  activitySub: { fontSize: 11, color: colors.gray[500], marginTop: 1 },
  activityRight: { alignItems: "flex-end" },
  activityAmount: { fontSize: 12, fontWeight: "800", color: colors.success },
  activityCta: { fontSize: 11, fontWeight: "700" },
  activityTime: { fontSize: 9, color: colors.gray[400], marginTop: 2 },
  recoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  seeAll: { fontSize: 11, fontWeight: "700", color: colors.green[700] },
  recoRow: { gap: spacing.md, paddingBottom: spacing.sm },
  recoCard: {
    width: 176,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  recoTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  recoIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  recoTag: { borderRadius: radii.full, paddingHorizontal: 6, paddingVertical: 2 },
  recoTagNew: { backgroundColor: colors.amber[400] },
  recoTagExport: { backgroundColor: "#DBEAFE" },
  recoTagText: { fontSize: 8, fontWeight: "800", letterSpacing: 0.5 },
  recoTagNewText: { color: colors.amber[900] },
  recoTagExportText: { color: "#2563EB" },
  recoName: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.gray[900],
    marginTop: spacing.sm,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  recoLoc: { fontSize: 10, color: colors.gray[400], marginTop: 2 },
  recoRoi: { fontSize: 12, fontWeight: "800", color: colors.success, marginTop: spacing.xs },
});
