import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackHeader } from "@/components/shell/StackHeader";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useInvestments, usePortfolioStats, type Investment } from "@/hooks/useInvestments";
import { formatUsd } from "@/lib/utils";
import { colors, radii, shadows, spacing } from "@/theme";

function formatFc(n: number) {
  return `${n.toLocaleString("fr-FR")} FC`;
}

function InvestmentCard({ inv }: { inv: Investment }) {
  const { t } = useTranslation();
  const router = useRouter();
  const isBourse = inv.badge === "BOURSE";

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push(
          (isBourse ? "/(tabs)/bourse" : `/market/${inv.productId}`) as never,
        )
      }
    >
      <View
        style={[
          styles.cardIcon,
          isBourse ? styles.cardIconAmber : styles.cardIconGreen,
        ]}
      >
        <Ionicons
          name={isBourse ? "stats-chart-outline" : "leaf-outline"}
          size={22}
          color={isBourse ? colors.amber[500] : colors.green[700]}
        />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.cardName} numberOfLines={1}>
              {inv.name}
            </Text>
            {inv.meta ? <Text style={styles.cardMeta}>{inv.meta}</Text> : null}
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.cardAmount}>
              {inv.currency === "FC" ? formatFc(inv.amount) : formatUsd(inv.amount)}
            </Text>
            <Text style={styles.cardRoi}>+{inv.roi}%</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={colors.gray[400]} />
            <Text style={styles.metaText}>{inv.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={colors.gray[400]} />
            <Text style={styles.metaText}>{inv.harvestDate}</Text>
          </View>
        </View>

        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{inv.progress}%</Text>
          <Text style={styles.progressLabel}>
            {inv.daysLeft} {t("home.daysLeft")}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${inv.progress}%`,
                backgroundColor: isBourse ? colors.amber[400] : colors.success,
              },
            ]}
          />
        </View>

        {inv.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{inv.badge}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export function PortfolioScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: investments = [], isLoading } = useInvestments();
  const { totalUsd, estimatedReturnUsd, activeCount } = usePortfolioStats();

  return (
    <View style={styles.root} testID="portfolio-screen">
      <StackHeader title={t("home.portfolio")} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 16) + 24,
        }}
      >
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>{t("home.portfolio")}</Text>
          <Text style={styles.heroValue}>{formatUsd(totalUsd)}</Text>
          <View style={styles.heroStats}>
            <View>
              <Text style={styles.heroStatLabel}>{t("home.estimatedReturn")}</Text>
              <Text style={styles.heroStatGreen}>+{formatUsd(estimatedReturnUsd)}</Text>
            </View>
            <View>
              <Text style={styles.heroStatLabel}>{t("home.invests")}</Text>
              <Text style={styles.heroStatValue}>{activeCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.list}>
          {isLoading ? (
            <ActivityIndicator color={colors.green[700]} style={{ marginTop: 32 }} />
          ) : investments.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="grid-outline" size={32} color={colors.gray[400]} />
              </View>
              <Text style={styles.emptyTitle}>{t("home.noInvestments")}</Text>
              <Text style={styles.emptyDesc}>{t("home.noInvestmentsDesc")}</Text>
              <Pressable
                style={styles.cta}
                onPress={() => router.push("/(tabs)/market" as never)}
              >
                <Text style={styles.ctaText}>{t("home.browseMarket")}</Text>
                <Ionicons name="arrow-up-outline" size={16} color="#fff" />
              </Pressable>
            </View>
          ) : (
            investments.map((inv) => <InvestmentCard key={inv.id} inv={inv} />)
          )}
        </View>

        {investments.length > 0 ? (
          <Pressable
            style={styles.browseBtn}
            onPress={() => router.push("/(tabs)/market" as never)}
          >
            <Ionicons name="trending-up-outline" size={16} color="#fff" />
            <Text style={styles.ctaText}>{t("home.browseMarket")}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBackground },
  hero: {
    backgroundColor: colors.green[800],
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  heroLabel: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroValue: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 34,
    color: "#fff",
  },
  heroStats: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  heroStatLabel: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
  },
  heroStatGreen: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 15,
    color: colors.green[200],
    marginTop: 2,
  },
  heroStatValue: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 15,
    color: "#fff",
    marginTop: 2,
  },
  list: {
    marginTop: -12,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: 10,
  },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: spacing.md,
    ...shadows.card,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconGreen: { backgroundColor: colors.green[50] },
  cardIconAmber: { backgroundColor: colors.amber[50] },
  cardBody: { flex: 1, minWidth: 0 },
  cardTop: { flexDirection: "row", gap: 8 },
  cardName: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 14,
    color: colors.gray[900],
  },
  cardMeta: {
    fontFamily: "NotoSans_400Regular",
    fontSize: 11,
    color: colors.gray[400],
    marginTop: 2,
  },
  cardRight: { alignItems: "flex-end" },
  cardAmount: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 15,
    color: colors.gray[900],
  },
  cardRoi: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 11,
    color: colors.success,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: {
    fontFamily: "NotoSans_400Regular",
    fontSize: 11,
    color: colors.gray[400],
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 4,
  },
  progressLabel: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 10,
    color: colors.gray[400],
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.gray[100],
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999 },
  badge: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: colors.amber[400],
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 9,
    color: colors.amber[900],
    letterSpacing: 0.5,
  },
  empty: {
    backgroundColor: "#fff",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.gray[100],
    padding: spacing.xl,
    alignItems: "center",
    marginTop: spacing.md,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 16,
    color: colors.gray[800],
    textAlign: "center",
  },
  emptyDesc: {
    fontFamily: "NotoSans_400Regular",
    fontSize: 13,
    color: colors.gray[400],
    textAlign: "center",
    marginTop: 6,
    maxWidth: 220,
  },
  cta: {
    marginTop: spacing.lg,
    height: 40,
    paddingHorizontal: 20,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctaText: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 13,
    color: "#fff",
  },
  browseBtn: {
    alignSelf: "center",
    marginTop: spacing.lg,
    height: 40,
    paddingHorizontal: 20,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
