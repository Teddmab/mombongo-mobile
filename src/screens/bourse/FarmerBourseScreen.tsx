import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ContractModal } from "@/components/bourse/ContractModal";
import { NegotiationModal } from "@/components/bourse/NegotiationModal";
import { MettreEnVenteModal } from "@/components/forms/ActionForms";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useBourseTicker } from "@/hooks/useLocalData";
import {
  useMyMatches,
  useMyProductListings,
  type BourseMatch,
} from "@/hooks/useProductListings";
import { colors, radii, spacing } from "@/theme";

const MY_SYMBOLS = ["PAST-SGL", "MAN-KIN", "OIG-KIN"];
const STATUS_LABEL: Record<string, string> = {
  active: "En vente",
  matched: "Match",
  sold: "Vendu",
  expired: "Expiré",
  cancelled: "Annulé",
};

export function FarmerBourseScreen() {
  const scrollPadding = useTabScrollPadding();
  const { data: bourseTicker = [] } = useBourseTicker();
  const { data: myListings = [], isLoading } = useMyProductListings();
  const { data: matches = [] } = useMyMatches("seller");
  const [venteOpen, setVenteOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState<BourseMatch | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);

  const myCrops = bourseTicker.filter((t) => MY_SYMBOLS.includes(t.symbol));
  const bestPrice = myCrops.reduce((b, t) => (t.change > b.change ? t : b), myCrops[0]);

  return (
    <TabScreen>
      <ScrollView contentContainerStyle={[styles.content, scrollPadding]} testID="bourse-screen">
        {bestPrice && bestPrice.change > 0 ? (
          <View style={styles.alert}>
            <Ionicons name="trending-up" size={20} color={colors.amber[700]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>
                {bestPrice.symbol} en hausse +{bestPrice.change}%
              </Text>
              <Text style={styles.alertSub}>Bon moment pour mettre en vente</Text>
            </View>
            <Pressable onPress={() => setVenteOpen(true)} style={styles.sellBtn}>
              <Text style={styles.sellBtnText}>Vendre</Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable onPress={() => setVenteOpen(true)} style={styles.publishBtn}>
          <Ionicons name="pricetag-outline" size={16} color={colors.white} />
          <Text style={styles.publishText}>Mettre en vente</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>Mes produits publiés</Text>
        <View style={styles.card}>
          {isLoading ? (
            <Text style={styles.empty}>Chargement…</Text>
          ) : myListings.length === 0 ? (
            <Text style={styles.empty}>Aucune offre publiée</Text>
          ) : (
            myListings.map((l) => (
              <View key={l.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.symbol}>
                    {l.commodity} · {l.quality}
                  </Text>
                  <Text style={styles.price}>
                    {l.quantityKg} kg · {l.pricePerKgCdf} FC/kg · {l.province}
                    {l.territory ? ` / ${l.territory}` : ""}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{STATUS_LABEL[l.status] ?? l.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {matches.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Mes négociations</Text>
            <View style={styles.card}>
              {matches.map((m) => (
                <Pressable key={m.id} onPress={() => setActiveMatch(m)} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.symbol}>
                      {m.commodity} · {m.quantityKg} kg
                    </Text>
                    <Text style={styles.price}>{m.status}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        <Text style={styles.sectionLabel}>Tous les cours</Text>
        <View style={styles.card}>
          {bourseTicker.map((t) => (
            <View key={t.symbol} style={styles.rowSimple}>
              <View>
                <Text style={styles.symbol}>{t.symbol}</Text>
                <Text style={styles.price}>{t.price}</Text>
              </View>
              <Text
                style={[
                  styles.change,
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

      <MettreEnVenteModal visible={venteOpen} onClose={() => setVenteOpen(false)} />
      <NegotiationModal
        visible={!!activeMatch}
        onClose={() => setActiveMatch(null)}
        match={activeMatch}
        role="seller"
        onContractReady={(id) => setContractId(id)}
      />
      <ContractModal
        visible={!!contractId}
        onClose={() => setContractId(null)}
        contractId={contractId}
        role="seller"
      />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingTop: spacing.md, gap: spacing.md },
  alert: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.amber[50],
    borderWidth: 1,
    borderColor: colors.amber[100],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  alertTitle: { fontSize: 12, fontWeight: "700", color: colors.amber[900] ?? colors.amber[700] },
  alertSub: { fontSize: 11, color: colors.amber[700], marginTop: 2 },
  sellBtn: {
    backgroundColor: colors.amber[400],
    borderRadius: radii.lg,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sellBtnText: { fontSize: 11, fontWeight: "700", color: colors.amber[900] },
  publishBtn: {
    height: 40,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  publishText: { fontSize: 13, fontWeight: "700", color: colors.white },
  sectionLabel: {
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
    overflow: "hidden",
  },
  empty: { padding: spacing.lg, fontSize: 13, color: colors.gray[400] },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    gap: spacing.sm,
  },
  rowSimple: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  symbol: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  price: { fontSize: 12, color: colors.gray[600], marginTop: 2 },
  change: { fontSize: 12, fontWeight: "800" },
  badge: {
    backgroundColor: colors.green[50],
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: colors.green[700] },
});
