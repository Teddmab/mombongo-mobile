import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { farmers } from "@/data/mock";
import { colors, radii, shadows, spacing } from "@/theme";

export function InvestorFinancementContent({ bottomInset }: { bottomInset: number }) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Math.max(bottomInset, 16) + spacing.lg }}
    >
      <View style={[styles.impactCard, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
        <Text style={styles.impactLabel}>{t("financement.impactShort")}</Text>
        <Text style={styles.impactValue}>$24,820</Text>
        <Text style={styles.impactSub}>{t("financement.raisedForShort")}</Text>
        <View style={styles.impactDivider} />
        <View style={styles.impactGrid}>
          {[
            { v: "84", l: t("financement.haShort") },
            { v: "312", l: t("financement.jobsShort") },
            { v: "96%", l: t("financement.repaymentShort") },
          ].map((s) => (
            <View key={s.l} style={styles.impactCell}>
              <Text style={styles.impactCellValue}>{s.v}</Text>
              <Text style={styles.impactCellLabel}>{s.l}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.sectionLabel}>{t("financement.enCollecte")}</Text>
      <View style={[styles.list, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
        {farmers.map((f) => {
          const pct = Math.round((f.raised / f.needed) * 100);
          return (
            <Pressable
              key={f.id}
              onPress={() => router.push(`/financement/${f.id}` as never)}
              style={styles.farmerCard}
            >
              <View style={styles.farmerTop}>
                <View style={styles.avatarWrap}>
                  {f.image ? (
                    <Image source={{ uri: f.image }} style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.avatarEmoji}>{f.avatar}</Text>
                  )}
                </View>
                <View style={styles.farmerBody}>
                  <Text style={styles.farmerName}>{f.name}</Text>
                  <View style={styles.locRow}>
                    <Ionicons name="location-outline" size={12} color={colors.gray[500]} />
                    <Text style={styles.locText}>{f.location}</Text>
                  </View>
                  <View style={styles.cropRow}>
                    {f.crops.map((c) => (
                      <View key={c} style={styles.cropBadge}>
                        <Text style={styles.cropText}>{c}</Text>
                      </View>
                    ))}
                    <View style={styles.scoreBadge}>
                      <Ionicons name="ribbon-outline" size={10} color={colors.amber[700]} />
                      <Text style={styles.scoreText}>{f.trustScore}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.fundingRow}>
                <Text style={styles.raised}>${f.raised.toLocaleString()}</Text>
                <Text style={styles.needed}>/ ${f.needed.toLocaleString()}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.pctText}>{t("financement.collected", { pct })}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  impactCard: {
    marginTop: spacing.md,
    backgroundColor: colors.green[700],
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.elevated,
  },
  impactLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  impactValue: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.white,
    marginTop: 4,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  impactSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  impactDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: spacing.lg },
  impactGrid: { flexDirection: "row" },
  impactCell: { flex: 1, alignItems: "center" },
  impactCellValue: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.white,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  impactCellLabel: { fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  sectionLabel: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    marginHorizontal: SCREEN_HORIZONTAL_PADDING,
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  list: { gap: spacing.md },
  farmerCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  farmerTop: { flexDirection: "row", gap: spacing.md },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.xl,
    backgroundColor: colors.green[50],
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarEmoji: { fontSize: 24 },
  farmerBody: { flex: 1 },
  farmerName: { fontSize: 14, fontWeight: "700", color: colors.gray[900] },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  locText: { fontSize: 11, color: colors.gray[500] },
  cropRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: spacing.sm },
  cropBadge: {
    backgroundColor: colors.green[50],
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cropText: { fontSize: 9, fontWeight: "700", color: colors.green[700] },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.amber[50],
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  scoreText: { fontSize: 9, fontWeight: "700", color: colors.amber[700] },
  fundingRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  raised: { fontSize: 12, fontWeight: "800", color: colors.gray[900] },
  needed: { fontSize: 11, color: colors.gray[400] },
  progressTrack: {
    height: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 6,
  },
  progressFill: { height: "100%", backgroundColor: colors.green[700] },
  pctText: { fontSize: 10, fontWeight: "700", color: colors.green[700], marginTop: 4 },
});
