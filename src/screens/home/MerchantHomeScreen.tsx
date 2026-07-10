import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useAuth } from "@/hooks/useAuth";
import { useBourseTicker, useMerchantOrders } from "@/hooks/useLocalData";
import { colors, radii, shadows, spacing } from "@/theme";

const STATUS = {
  "en cours": { label: "En cours", bg: "#DBEAFE", text: "#1D4ED8" },
  livré: { label: "Livré", bg: colors.green[100], text: colors.green[700] },
  annulé: { label: "Annulé", bg: "#FEE2E2", text: colors.danger },
  "en attente": { label: "En attente", bg: colors.amber[100], text: colors.amber[700] },
} as const;

const QUICK = [
  { icon: "bag-outline" as const, label: "Sourcer", href: "/(tabs)/market" },
  { icon: "trending-up-outline" as const, label: "Bourse", href: "/(tabs)/bourse" },
  { icon: "bus-outline" as const, label: "Transport", href: "/(tabs)/bourse" },
  { icon: "school-outline" as const, label: "Formation", href: "/(tabs)/academia" },
];

export function MerchantHomeScreen() {
  const router = useRouter();
  const scrollPadding = useTabScrollPadding();
  const { data: merchantOrders = [] } = useMerchantOrders();
  const { data: bourseTicker = [] } = useBourseTicker();
  const { userProfile } = useAuth();
  const firstName = (userProfile?.displayName || "Commerçant").split(" ")[0];
  const active = merchantOrders.filter((o) => o.status === "en cours" || o.status === "en attente");
  const totalBudget = merchantOrders.reduce((s, o) => s + o.totalUsd, 0);

  return (
    <TabScreen>
      <ScrollView
        contentContainerStyle={[styles.content, scrollPadding]}
        showsVerticalScrollIndicator={false}
        testID="home-screen"
      >
        <View style={[styles.hero, shadows.elevated]}>
          <Text style={styles.heroLabel}>MON ACTIVITÉ</Text>
          <Text style={styles.heroTitle}>Bonjour, {firstName}</Text>
          <Text style={styles.heroValue}>${totalBudget.toLocaleString()}</Text>
          <Text style={styles.heroSub}>Budget engagé ce mois</Text>
          <View style={styles.heroDivider} />
          <View style={styles.heroGrid}>
            {[
              { l: "Commandes", v: String(merchantOrders.length) },
              { l: "En cours", v: String(active.length) },
              { l: "Livrés", v: String(merchantOrders.filter((o) => o.status === "livré").length) },
            ].map((s) => (
              <View key={s.l} style={styles.heroCell}>
                <Text style={styles.heroCellValue}>{s.v}</Text>
                <Text style={styles.heroCellLabel}>{s.l}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.quickGrid}>
          {QUICK.map((q) => (
            <Pressable
              key={q.label}
              onPress={() => router.push(q.href as never)}
              style={styles.quickBtn}
            >
              <View style={styles.quickIcon}>
                <Ionicons name={q.icon} size={18} color={colors.purple[700]} />
              </View>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Mes commandes</Text>
        <View style={styles.list}>
          {merchantOrders.map((order) => {
            const st = STATUS[order.status];
            return (
              <View key={order.id} style={styles.orderCard}>
                <Text style={styles.orderIcon}>{order.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderProduct}>{order.product}</Text>
                  <Text style={styles.orderMeta}>
                    {order.quantity} {order.unit} · {order.region}
                  </Text>
                  <Text style={styles.orderDate}>{order.deliveryDate}</Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderTotal}>${order.totalUsd}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Prix d'achat</Text>
        <View style={styles.tickerCard}>
          {bourseTicker.slice(0, 5).map((t) => (
            <View key={t.symbol} style={styles.tickerRow}>
              <Text style={styles.tickerSymbol}>{t.symbol}</Text>
              <Text style={styles.tickerPrice}>{t.price}</Text>
              <Text
                style={[
                  styles.tickerChange,
                  { color: t.change >= 0 ? colors.success : colors.danger },
                ]}
              >
                {t.change >= 0 ? "+" : ""}
                {t.change}%
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_HORIZONTAL_PADDING, gap: spacing.md, paddingTop: spacing.md },
  hero: { backgroundColor: colors.purple[700], borderRadius: radii.xl, padding: spacing.xl },
  heroLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.6)", letterSpacing: 1 },
  heroTitle: { fontSize: 16, fontWeight: "600", color: "rgba(255,255,255,0.9)", marginTop: 4 },
  heroValue: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.white,
    marginTop: spacing.sm,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  heroSub: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  heroDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: spacing.md },
  heroGrid: { flexDirection: "row" },
  heroCell: { flex: 1, alignItems: "center" },
  heroCellValue: { fontSize: 16, fontWeight: "800", color: colors.white },
  heroCellLabel: { fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 },
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
    backgroundColor: colors.purple[100],
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: { fontSize: 9, fontWeight: "600", color: colors.gray[500], textAlign: "center" },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  list: { gap: spacing.sm },
  orderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.md,
  },
  orderIcon: { fontSize: 24 },
  orderProduct: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  orderMeta: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  orderDate: { fontSize: 10, color: colors.gray[400], marginTop: 2 },
  orderRight: { alignItems: "flex-end" },
  orderTotal: { fontSize: 14, fontWeight: "800", color: colors.gray[900] },
  statusBadge: { borderRadius: radii.full, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  statusText: { fontSize: 9, fontWeight: "800" },
  tickerCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  tickerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  tickerSymbol: { flex: 1, fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  tickerPrice: { fontSize: 12, color: colors.gray[600], marginRight: spacing.md },
  tickerChange: { fontSize: 12, fontWeight: "800", width: 48, textAlign: "right" },
});
