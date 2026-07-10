import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PublierProduitModal } from "@/components/forms/ActionForms";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useBourseTicker, useMyListings } from "@/hooks/useLocalData";
import { colors, radii, spacing } from "@/theme";

const STATUS = {
  "en vente": { label: "En vente", bg: colors.green[100], text: colors.green[700] },
  vendu: { label: "Vendu", bg: "#DBEAFE", text: "#1D4ED8" },
  brouillon: { label: "Brouillon", bg: colors.gray[100], text: colors.gray[500] },
  expiré: { label: "Expiré", bg: "#FEE2E2", text: colors.danger },
} as const;

export function FarmerMarketScreen() {
  const scrollPadding = useTabScrollPadding();
  const { data: myListings = [] } = useMyListings();
  const { data: bourseTicker = [] } = useBourseTicker();
  const [tab, setTab] = useState<"annonces" | "prix">("annonces");
  const [publishOpen, setPublishOpen] = useState(false);

  return (
    <TabScreen>
      <ScrollView contentContainerStyle={[styles.content, scrollPadding]} testID="market-screen">
        <View style={styles.tabs}>
          {(["annonces", "prix"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "annonces" ? "Mes annonces" : "Prix marché"}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === "annonces" ? (
          <View style={styles.list}>
            {myListings.map((l) => {
              const s = STATUS[l.status];
              return (
                <View key={l.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={styles.icon}>{l.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{l.name}</Text>
                      <Text style={styles.meta}>
                        {l.quantity} {l.unit} · {l.region}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: s.bg }]}>
                      <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
                    </View>
                  </View>
                  {l.status === "en vente" ? (
                    <View style={styles.funding}>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${l.fundingPct}%` }]} />
                      </View>
                      <Text style={styles.fundingText}>
                        {l.fundingPct}% · {l.investorsCount} investisseurs
                      </Text>
                    </View>
                  ) : null}
                  <Pressable onPress={() => setPublishOpen(true)} style={styles.editBtn}>
                    <Text style={styles.editText}>Modifier</Text>
                  </Pressable>
                </View>
              );
            })}
            <Pressable onPress={() => setPublishOpen(true)} style={styles.addBtn}>
              <Ionicons name="add" size={20} color={colors.green[700]} />
              <Text style={styles.addText}>Publier un produit</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.tickerCard}>
            {bourseTicker.map((t) => (
              <View key={t.symbol} style={styles.tickerRow}>
                <View>
                  <Text style={styles.tickerSymbol}>{t.symbol}</Text>
                  <Text style={styles.tickerPrice}>{t.price}</Text>
                </View>
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
        )}
      </ScrollView>
      <PublierProduitModal visible={publishOpen} onClose={() => setPublishOpen(false)} />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingTop: spacing.md, gap: spacing.md },
  tabs: { flexDirection: "row", backgroundColor: colors.gray[100], borderRadius: radii.lg, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: radii.lg, alignItems: "center" },
  tabActive: { backgroundColor: colors.white, ...{ shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 } },
  tabText: { fontSize: 12, fontWeight: "700", color: colors.gray[500] },
  tabTextActive: { color: colors.gray[900] },
  list: { gap: spacing.md },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  icon: { fontSize: 28 },
  name: { fontSize: 14, fontWeight: "700", color: colors.gray[900] },
  meta: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  badge: { borderRadius: radii.full, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: "800" },
  funding: { marginTop: spacing.md },
  progressTrack: {
    height: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.green[700] },
  fundingText: { fontSize: 10, color: colors.gray[400], marginTop: 4 },
  editBtn: { marginTop: spacing.sm, alignSelf: "flex-end" },
  editText: { fontSize: 11, fontWeight: "700", color: colors.green[700] },
  addBtn: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  addText: { fontSize: 13, fontWeight: "700", color: colors.green[700] },
  tickerCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  tickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  tickerSymbol: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  tickerPrice: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  tickerChange: { fontSize: 12, fontWeight: "800" },
});
