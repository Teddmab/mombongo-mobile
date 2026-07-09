import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BourseTickerBar } from "@/components/bourse/BourseTickerBar";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { bourseOpportunities } from "@/data/mock";
import { colors, radii, spacing } from "@/theme";

const TYPE_ICON = {
  transport: "bus-outline",
  stockage: "archive-outline",
  transformation: "construct-outline",
} as const;

export function MerchantBourseScreen() {
  const router = useRouter();
  const scrollPadding = useTabScrollPadding();
  const transport = bourseOpportunities.filter((o) => o.type === "transport");

  return (
    <TabScreen>
      <ScrollView contentContainerStyle={[styles.content, scrollPadding]} testID="bourse-screen">
        <BourseTickerBar />

        <View style={[styles.hero, { backgroundColor: colors.purple[700] }]}>
          <Text style={styles.heroLabel}>LOGISTIQUE & TRANSPORT</Text>
          <Text style={styles.heroTitle}>Réservez du fret</Text>
          <Text style={styles.heroSub}>
            Transport groupé pour réduire vos coûts d'approvisionnement
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Transports disponibles</Text>
        <View style={styles.list}>
          {transport.map((o) => (
            <Pressable
              key={o.id}
              onPress={() => router.push(`/bourse/${o.id}` as never)}
              style={styles.card}
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
                <Text style={styles.price}>{o.price}</Text>
              </View>
              <Text style={styles.comm}>+{o.commission}%</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingTop: spacing.md, gap: spacing.md },
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  meta: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  price: { fontSize: 12, fontWeight: "800", color: colors.purple[700], marginTop: 4 },
  comm: { fontSize: 12, fontWeight: "800", color: colors.amber[700] },
});
