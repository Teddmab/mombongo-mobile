import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { InvestModal } from "@/components/market/InvestModal";
import { StackHeader } from "@/components/shell/StackHeader";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useAuth } from "@/hooks/useAuth";
import { products, type Product } from "@/data/mock";
import { colors, radii, shadows, spacing } from "@/theme";

function clampAmount(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  tone: "green" | "amber" | "blue";
}) {
  const toneStyle =
    tone === "green"
      ? { bg: colors.green[50], color: colors.green[700] }
      : tone === "amber"
        ? { bg: colors.amber[50], color: colors.amber[700] }
        : { bg: "#EFF6FF", color: "#2563EB" };

  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: toneStyle.bg }]}>
        <Ionicons name={icon} size={16} color={toneStyle.color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function ProductDetailScreen({ productId }: { productId?: string }) {
  const insets = useSafeAreaInsets();
  const { userProfile } = useAuth();
  const product = products.find((p) => p.id === productId) ?? products[0];
  const walletBalance = userProfile?.walletUsd ?? 2450;
  const maxAmount = product.minInvest * 10;

  const [amount, setAmount] = useState(product.minInvest);
  const [investOpen, setInvestOpen] = useState(false);

  const expectedReturn = useMemo(() => Math.round(amount * (1 + product.roi / 100)), [amount, product.roi]);
  const profit = expectedReturn - amount;

  const adjustAmount = (delta: number) => {
    setAmount((prev) => clampAmount(prev + delta, product.minInvest, maxAmount));
  };

  return (
    <View style={styles.root} testID="product-detail-screen">
      <StackHeader title="Marché" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 88 }}
      >
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Text style={styles.heroIcon}>{product.icon}</Text>
          </View>
          <Text style={styles.heroName}>{product.name}</Text>
          <View style={styles.heroLoc}>
            <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.heroLocText}>
              {product.location} · {product.farmer ?? "Agriculteur vérifié"}
            </Text>
          </View>
        </View>

        <View style={[styles.statsRow, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          <StatCard icon="trending-up-outline" value={`${product.roi}%`} label="ROI" tone="green" />
          <StatCard icon="time-outline" value={`${product.duration}j`} label="Durée" tone="amber" />
          <StatCard icon="cube-outline" value={String(product.stock)} label={product.unit} tone="blue" />
        </View>

        <Text style={styles.sectionLabel}>Description</Text>
        <View style={[styles.card, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          <Text style={styles.description}>
            {product.description ??
              "Investissement agricole sécurisé avec suivi en temps réel par nos agents terrain."}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Simulateur</Text>
        <View style={[styles.card, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          <Text style={styles.simLabel}>Montant à investir</Text>
          <Text style={styles.simAmount}>${amount}</Text>

          <View style={styles.stepperRow}>
            <Pressable onPress={() => adjustAmount(-50)} style={styles.stepperBtn}>
              <Ionicons name="remove" size={18} color={colors.green[700]} />
            </Pressable>
            <View style={styles.stepperTrack}>
              <View
                style={[
                  styles.stepperFill,
                  {
                    width: `${((amount - product.minInvest) / (maxAmount - product.minInvest)) * 100}%`,
                  },
                ]}
              />
            </View>
            <Pressable onPress={() => adjustAmount(50)} style={styles.stepperBtn}>
              <Ionicons name="add" size={18} color={colors.green[700]} />
            </Pressable>
          </View>
          <View style={styles.boundsRow}>
            <Text style={styles.boundText}>${product.minInvest} min.</Text>
            <Text style={styles.boundText}>${maxAmount}</Text>
          </View>

          <View style={styles.returnBox}>
            <View>
              <Text style={styles.returnLabel}>RETOUR</Text>
              <Text style={styles.returnValue}>${expectedReturn}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.returnLabel}>PROFIT</Text>
              <Text style={styles.returnValue}>+${profit}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          onPress={() => setInvestOpen(true)}
          style={styles.investBtn}
        >
          <Text style={styles.investBtnText}>Investir ${amount}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.white} />
        </Pressable>
        <Pressable
          onPress={() => Alert.alert("Mombongo", "Un agent vous recontactera bientôt.")}
          style={styles.agentBtn}
        >
          <Text style={styles.agentBtnText}>Consulter un agent</Text>
        </Pressable>
      </View>

      <InvestModal
        visible={investOpen}
        onClose={() => setInvestOpen(false)}
        product={{
          id: product.id,
          name: product.name,
          icon: product.icon,
          roi: product.roi,
          minInvest: product.minInvest,
          duration: product.duration,
        }}
        walletBalance={walletBalance}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBackground },
  hero: {
    backgroundColor: colors.green[700],
    paddingTop: spacing.md,
    paddingBottom: spacing["2xl"],
    alignItems: "center",
  },
  heroIconWrap: {
    width: 128,
    height: 128,
    borderRadius: radii["3xl"],
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroIcon: { fontSize: 56 },
  heroName: {
    marginTop: spacing.md,
    fontSize: 24,
    fontWeight: "800",
    color: colors.white,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  heroLoc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  heroLocText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: -spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  statCard: { flex: 1, alignItems: "center" },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  statLabel: { fontSize: 10, color: colors.gray[400], fontWeight: "600", marginTop: 2 },
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
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  description: {
    fontSize: 13,
    color: colors.gray[700],
    lineHeight: 20,
    fontFamily: "NotoSans_400Regular",
  },
  simLabel: { fontSize: 11, color: colors.gray[500] },
  simAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.gray[900],
    marginTop: 2,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
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
    borderWidth: 1,
    borderColor: colors.green[200],
    backgroundColor: colors.green[50],
    alignItems: "center",
    justifyContent: "center",
  },
  stepperTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: "hidden",
  },
  stepperFill: { height: "100%", backgroundColor: colors.green[700] },
  boundsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  boundText: { fontSize: 10, color: colors.gray[400], fontWeight: "700" },
  returnBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.green[50],
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  returnLabel: { fontSize: 10, fontWeight: "700", color: colors.green[700], letterSpacing: 0.5 },
  returnValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.green[700],
    marginTop: 2,
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
    gap: spacing.sm,
  },
  investBtn: {
    height: 48,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    ...shadows.elevated,
  },
  investBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  agentBtn: {
    height: 44,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  agentBtnText: { fontSize: 13, fontWeight: "600", color: colors.gray[700] },
});
