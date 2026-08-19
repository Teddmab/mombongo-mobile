import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FundModal } from "@/components/FundModal";
import { StackHeader } from "@/components/shell/StackHeader";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useAuth } from "@/hooks/useAuth";
import { useFarmer } from "@/hooks/useFinancing";
import { useProducts } from "@/hooks/useProducts";
import { colors, radii, shadows, spacing } from "@/theme";

export function FarmerDetailScreen({ farmerId }: { farmerId?: string }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const { data: f, isLoading } = useFarmer(farmerId);
  const { data: products = [] } = useProducts();
  const [fundOpen, setFundOpen] = useState(false);

  if (isLoading || !f) {
    return (
      <View style={styles.root} testID="farmer-detail-screen">
        <StackHeader title="Financement" />
        <Text style={{ textAlign: "center", marginTop: 48, color: colors.gray[500] }}>
          {isLoading ? "Chargement…" : "Agriculteur introuvable"}
        </Text>
      </View>
    );
  }

  const pct = f.needed > 0 ? Math.round((f.raised / f.needed) * 100) : 0;
  const farmerProducts = products.filter((p) => p.farmer === f.name);

  return (
    <View style={styles.root} testID="farmer-detail-screen">
      <StackHeader title="Financement" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 80 }}
      >
        <View style={styles.hero}>
          <View style={styles.heroAvatar}>
            {f.image ? (
              <Image source={{ uri: f.image }} style={styles.heroImg} />
            ) : (
              <Text style={styles.heroEmoji}>{f.avatar}</Text>
            )}
          </View>
          <Text style={styles.heroName}>{f.name}</Text>
          <View style={styles.heroLoc}>
            <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.heroLocText}>{f.location}</Text>
          </View>
        </View>

        <View style={[styles.statsRow, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          <Stat v={`${f.surface} ha`} l="Surface" />
          <Stat v={`${f.experience} ans`} l="Expérience" />
          <Stat v={String(f.trustScore)} l="Score" />
        </View>

        <Text style={styles.sectionLabel}>Histoire</Text>
        <View style={[styles.card, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          <Text style={styles.story}>{f.story}</Text>
          <View style={styles.cropRow}>
            {f.crops.map((c) => (
              <View key={c} style={styles.cropBadge}>
                <Text style={styles.cropText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        {farmerProducts.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Produits</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
                gap: spacing.md,
              }}
            >
              {farmerProducts.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/market/${p.id}` as never)}
                  style={styles.productCard}
                >
                  <Text style={styles.productIcon}>{p.icon}</Text>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productRoi}>+{p.roi}% ROI</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}

        <Text style={styles.sectionLabel}>Collecte</Text>
        <View style={[styles.card, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          <Text style={styles.collectValue}>${f.raised.toLocaleString()}</Text>
          <Text style={styles.collectNeeded}>/ ${f.needed.toLocaleString()}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.pctText}>{pct}% financé · 34 contributeurs</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable onPress={() => setFundOpen(true)} style={styles.supportBtn}>
          <Text style={styles.supportBtnText}>Financer cet agriculteur</Text>
        </Pressable>
      </View>

      <FundModal
        visible={fundOpen}
        onClose={() => setFundOpen(false)}
        farmer={f}
        onSuccess={() => {
          void refreshProfile();
        }}
      />
    </View>
  );
}

function Stat({ v, l }: { v: string; l: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue}>{v}</Text>
      <Text style={styles.statLabel}>{l}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBackground },
  hero: {
    backgroundColor: colors.green[700],
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing["2xl"],
  },
  heroAvatar: {
    width: 96,
    height: 96,
    borderRadius: radii["3xl"],
    backgroundColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  heroImg: { width: "100%", height: "100%" },
  heroEmoji: { fontSize: 48 },
  heroName: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
    marginTop: spacing.md,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  heroLoc: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: spacing.xs },
  heroLocText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
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
  statValue: { fontSize: 16, fontWeight: "800", color: colors.gray[900] },
  statLabel: { fontSize: 10, color: colors.gray[400], marginTop: 2 },
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
  story: { fontSize: 13, color: colors.gray[700], lineHeight: 20 },
  cropRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: spacing.md },
  cropBadge: {
    backgroundColor: colors.green[50],
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cropText: { fontSize: 11, fontWeight: "700", color: colors.green[700] },
  productCard: {
    width: 112,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: "center",
  },
  productIcon: { fontSize: 28 },
  productName: { fontSize: 12, fontWeight: "700", color: colors.gray[900], marginTop: 6, textAlign: "center" },
  productRoi: { fontSize: 11, fontWeight: "700", color: colors.green[700], marginTop: 4 },
  collectValue: { fontSize: 24, fontWeight: "800", color: colors.gray[900] },
  collectNeeded: { fontSize: 13, color: colors.gray[400], marginTop: 2 },
  progressTrack: {
    height: 10,
    backgroundColor: colors.gray[100],
    borderRadius: 5,
    overflow: "hidden",
    marginTop: spacing.md,
  },
  progressFill: { height: "100%", backgroundColor: colors.green[700] },
  pctText: { fontSize: 11, fontWeight: "600", color: colors.green[700], marginTop: spacing.sm },
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
  supportBtn: {
    height: 48,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.elevated,
  },
  supportBtnText: { fontSize: 14, fontWeight: "700", color: colors.white },
});
