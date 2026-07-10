import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BourseTickerBar } from "@/components/bourse/BourseTickerBar";
import { PublierLotModal, ReserverLotModal } from "@/components/forms/ActionForms";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useBourseOpportunities, type BourseOpportunity } from "@/hooks/useLocalData";
import { colors, radii, spacing } from "@/theme";

const TYPE_ICON = {
  transport: "bus-outline",
  stockage: "archive-outline",
  transformation: "construct-outline",
} as const;

export function MerchantBourseScreen() {
  const router = useRouter();
  const scrollPadding = useTabScrollPadding();
  const { data: bourseOpportunities = [] } = useBourseOpportunities();
  const [reserveOpp, setReserveOpp] = useState<BourseOpportunity | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);

  return (
    <TabScreen>
      <ScrollView contentContainerStyle={[styles.content, scrollPadding]} testID="bourse-screen">
        <BourseTickerBar />

        <Pressable onPress={() => setPublishOpen(true)} style={styles.publishBtn}>
          <Ionicons name="bag-add-outline" size={18} color={colors.white} />
          <Text style={styles.publishText}>Publier un lot à vendre</Text>
        </Pressable>

        <View style={[styles.hero, { backgroundColor: colors.purple[700] }]}>
          <Text style={styles.heroLabel}>LOGISTIQUE & TRANSPORT</Text>
          <Text style={styles.heroTitle}>Réservez du fret</Text>
          <Text style={styles.heroSub}>
            Transport groupé pour réduire vos coûts d'approvisionnement
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Lots disponibles</Text>
        <View style={styles.list}>
          {bourseOpportunities.map((o) => (
            <View key={o.id} style={styles.card}>
              <Pressable
                onPress={() => router.push(`/bourse/${o.id}` as never)}
                style={styles.cardTop}
              >
                <View style={[styles.icon, { backgroundColor: colors.purple[100] }]}>
                  <Ionicons name={TYPE_ICON[o.type]} size={20} color={colors.purple[700]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={2}>
                    {o.title}
                  </Text>
                  {o.destination ? (
                    <Text style={styles.meta}>
                      {o.origin} → {o.destination}
                    </Text>
                  ) : (
                    <Text style={styles.meta}>{o.origin}</Text>
                  )}
                  <Text style={styles.volume}>
                    {o.volume} · {o.duration}
                  </Text>
                </View>
                <View style={styles.priceCol}>
                  <Text style={styles.price}>{o.price}</Text>
                  <Text style={styles.comm}>+{o.commission}%</Text>
                </View>
              </Pressable>
              <Pressable onPress={() => setReserveOpp(o)} style={styles.reserveBtn}>
                <Ionicons name="cube-outline" size={14} color={colors.white} />
                <Text style={styles.reserveText}>Réserver ce lot</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <ReserverLotModal
        visible={!!reserveOpp}
        onClose={() => setReserveOpp(null)}
        opportunity={reserveOpp}
      />
      <PublierLotModal visible={publishOpen} onClose={() => setPublishOpen(false)} />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingTop: spacing.md, gap: spacing.md },
  publishBtn: {
    height: 40,
    backgroundColor: colors.purple[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  publishText: { fontSize: 13, fontWeight: "700", color: colors.white },
  hero: { borderRadius: radii.xl, padding: spacing.xl },
  heroLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.6)", letterSpacing: 1 },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
    marginTop: 4,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  heroSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  list: { gap: spacing.sm },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  meta: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  volume: { fontSize: 11, color: colors.gray[400], marginTop: 2 },
  priceCol: { alignItems: "flex-end" },
  price: { fontSize: 12, fontWeight: "800", color: colors.purple[700] },
  comm: { fontSize: 10, fontWeight: "800", color: colors.amber[700], marginTop: 2 },
  reserveBtn: {
    height: 36,
    backgroundColor: colors.purple[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  reserveText: { fontSize: 12, fontWeight: "700", color: colors.white },
});
