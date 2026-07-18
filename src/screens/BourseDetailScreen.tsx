import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { PaymentModal } from "@/components/PaymentModal";
import { StackHeader } from "@/components/shell/StackHeader";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useBourseOpportunity } from "@/hooks/useBourse";
import type { BourseOpportunity } from "@/hooks/useBourse";
import { colors, radii, shadows, spacing } from "@/theme";

const TYPE_ICON: Record<
  BourseOpportunity["type"],
  keyof typeof Ionicons.glyphMap
> = {
  transport: "bus-outline",
  stockage: "archive-outline",
  transformation: "construct-outline",
};

export function BourseDetailScreen({ opportunityId }: { opportunityId?: string }) {
  const insets = useSafeAreaInsets();
  const { data: opp, isLoading } = useBourseOpportunity(opportunityId);

  const [stake, setStake] = useState(50000);
  const [payOpen, setPayOpen] = useState(false);

  const commission = opp?.commission ?? 0;
  const commissionAmount = useMemo(
    () => Math.round((stake * commission) / 100),
    [stake, commission],
  );
  const total = stake + commissionAmount;

  const adjustStake = (delta: number) => {
    setStake((prev) => Math.min(500000, Math.max(10000, prev + delta)));
  };

  if (isLoading) {
    return (
      <View style={styles.root}>
        <StackHeader title="Bourse" />
        <Text style={{ textAlign: "center", marginTop: 48, color: colors.gray[500] }}>
          Chargement…
        </Text>
      </View>
    );
  }

  if (!opp) {
    return (
      <View style={styles.root}>
        <StackHeader title="Bourse" />
        <Text style={{ textAlign: "center", marginTop: 48, color: colors.gray[500] }}>
          Opportunité introuvable
        </Text>
      </View>
    );
  }

  const filled = ((opp.spotsTotal - opp.spotsLeft) / opp.spotsTotal) * 100;

  return (
    <View style={styles.root} testID="bourse-detail-screen">
      <StackHeader title="Bourse" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 72 }}
      >
        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={styles.heroIcon}>
              <Ionicons name={TYPE_ICON[opp.type]} size={28} color={colors.amber[900]} />
            </View>
            <View style={styles.heroBody}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{opp.type.toUpperCase()}</Text>
              </View>
              <Text style={styles.heroTitle}>{opp.title}</Text>
              {opp.destination ? (
                <View style={styles.routeRow}>
                  <Text style={styles.routeText}>{opp.origin}</Text>
                  <Ionicons name="arrow-forward" size={12} color={colors.amber[400]} />
                  <Text style={styles.routeText}>{opp.destination}</Text>
                </View>
              ) : (
                <Text style={styles.routeText}>{opp.origin}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={[styles.statsRow, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>+{opp.commission}%</Text>
            <Text style={styles.statLabel}>Commission</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{opp.duration}</Text>
            <Text style={styles.statLabel}>Durée</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>
              {opp.spotsLeft}/{opp.spotsTotal}
            </Text>
            <Text style={styles.statLabel}>Places</Text>
          </View>
        </View>

        <View style={[styles.subCard, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          <View style={styles.subHeader}>
            <Ionicons name="people-outline" size={16} color={colors.amber[700]} />
            <Text style={styles.subTitle}>Souscription en cours</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${filled}%` }]} />
          </View>
          <Text style={styles.subMeta}>
            {Math.round(filled)}% souscrit · {opp.spotsLeft} places restantes
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Détails</Text>
        <View style={[styles.detailsCard, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          {[
            { icon: "cube-outline" as const, l: "Volume", v: opp.volume },
            { icon: "pricetag-outline" as const, l: "Ticket d'entrée", v: opp.price },
            { icon: "time-outline" as const, l: "Délai estimé", v: opp.duration },
          ].map((row) => (
            <View key={row.l} style={styles.detailRow}>
              <Ionicons name={row.icon} size={16} color={colors.amber[500]} />
              <Text style={styles.detailLabel}>{row.l}</Text>
              <Text style={styles.detailValue}>{row.v}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Calculateur</Text>
        <View style={[styles.calcCard, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          <Text style={styles.calcLabel}>Votre mise</Text>
          <Text style={styles.calcAmount}>
            {stake.toLocaleString()} <Text style={styles.calcCurrency}>FC</Text>
          </Text>
          <View style={styles.stepperRow}>
            <Pressable onPress={() => adjustStake(-5000)} style={styles.stepperBtn}>
              <Ionicons name="remove" size={18} color={colors.amber[700]} />
            </Pressable>
            <View style={styles.stepperTrack}>
              <View
                style={[
                  styles.stepperFill,
                  { width: `${((stake - 10000) / (500000 - 10000)) * 100}%` },
                ]}
              />
            </View>
            <Pressable onPress={() => adjustStake(5000)} style={styles.stepperBtn}>
              <Ionicons name="add" size={18} color={colors.amber[700]} />
            </Pressable>
          </View>
          <View style={styles.calcSummary}>
            <View style={styles.calcLine}>
              <Text style={styles.calcLineLabel}>Mise</Text>
              <Text style={styles.calcLineValue}>{stake.toLocaleString()} FC</Text>
            </View>
            <View style={styles.calcLine}>
              <Text style={styles.calcLineLabel}>Commission ({opp.commission}%)</Text>
              <Text style={[styles.calcLineValue, { color: colors.success }]}>
                +{commissionAmount.toLocaleString()} FC
              </Text>
            </View>
            <View style={[styles.calcLine, styles.calcTotal]}>
              <Text style={styles.calcTotalLabel}>Total retour</Text>
              <Text style={styles.calcTotalValue}>{total.toLocaleString()} FC</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable onPress={() => setPayOpen(true)} style={styles.reserveBtn}>
          <Text style={styles.reserveBtnText}>Réserver une place · {opp.price}</Text>
        </Pressable>
      </View>

      <PaymentModal
        visible={payOpen}
        onClose={() => setPayOpen(false)}
        type="reserve"
        title="Réservation Bourse"
        subtitle={opp.title}
        amount={stake}
        currency="FC"
        onSuccess={() => setPayOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBackground },
  hero: {
    backgroundColor: colors.tickerBackground,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  heroRow: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.xl,
    backgroundColor: colors.amber[400],
    alignItems: "center",
    justifyContent: "center",
  },
  heroBody: { flex: 1 },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.amber[400],
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.amber[900],
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.white,
    marginTop: 6,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  routeText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  statsRow: {
    flexDirection: "row",
    marginTop: -spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  statCell: { flex: 1, alignItems: "center" },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  statLabel: { fontSize: 10, color: colors.gray[400], fontWeight: "600", marginTop: 2 },
  subCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.amber[50],
    borderWidth: 1,
    borderColor: colors.amber[100],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  subHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.sm },
  subTitle: { fontSize: 12, fontWeight: "700", color: colors.amber[900] },
  progressTrack: {
    height: 8,
    backgroundColor: colors.white,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.amber[400] },
  subMeta: { fontSize: 11, fontWeight: "600", color: colors.amber[900], marginTop: spacing.sm },
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
  detailsCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  detailRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  detailLabel: { flex: 1, fontSize: 12, color: colors.gray[500], fontWeight: "600" },
  detailValue: { fontSize: 13, fontWeight: "800", color: colors.gray[900] },
  calcCard: {
    backgroundColor: colors.tickerBackground,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.3)",
  },
  calcLabel: { fontSize: 11, fontWeight: "700", color: colors.amber[400], letterSpacing: 0.5 },
  calcAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.amber[400],
    marginTop: 4,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  calcCurrency: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 3,
    overflow: "hidden",
  },
  stepperFill: { height: "100%", backgroundColor: colors.amber[400] },
  calcSummary: {
    marginTop: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: spacing.sm,
  },
  calcLine: { flexDirection: "row", justifyContent: "space-between" },
  calcLineLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  calcLineValue: { fontSize: 13, fontWeight: "700", color: colors.white },
  calcTotal: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: spacing.sm,
    marginTop: 2,
  },
  calcTotalLabel: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  calcTotalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.amber[400],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: spacing.md,
    backgroundColor: colors.appBackground,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  reserveBtn: {
    height: 48,
    backgroundColor: colors.amber[400],
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.elevated,
  },
  reserveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.amber[900],
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
