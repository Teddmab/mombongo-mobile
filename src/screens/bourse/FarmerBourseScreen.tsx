import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MettreEnVenteModal } from "@/components/forms/ActionForms";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { bourseTicker } from "@/data/mock";
import { colors, radii, spacing } from "@/theme";

const MY_SYMBOLS = ["PAST-SGL", "MAN-KIN", "OIG-KIN"];

export function FarmerBourseScreen() {
  const scrollPadding = useTabScrollPadding();
  const [venteOpen, setVenteOpen] = useState(false);
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

        <Text style={styles.sectionLabel}>Mes cultures</Text>
        <View style={styles.card}>
          {myCrops.map((t) => (
            <View key={t.symbol} style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="leaf-outline" size={16} color={colors.green[700]} />
                <View>
                  <Text style={styles.symbol}>{t.symbol}</Text>
                  <Text style={styles.price}>{t.price}</Text>
                </View>
              </View>
              <View style={styles.rowRight}>
                <Text
                  style={[
                    styles.change,
                    { color: t.change >= 0 ? colors.success : colors.danger },
                  ]}
                >
                  {t.change >= 0 ? "+" : ""}
                  {t.change}%
                </Text>
                <Pressable onPress={() => setVenteOpen(true)} style={styles.miniSell}>
                  <Text style={styles.miniSellText}>Vendre</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
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
  miniSell: {
    backgroundColor: colors.green[50],
    borderRadius: radii.lg,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  miniSellText: { fontSize: 11, fontWeight: "700", color: colors.green[700] },
});
