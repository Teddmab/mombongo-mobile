import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommanderModal } from "@/components/forms/ActionForms";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { products } from "@/data/mock";
import { colors, radii, spacing } from "@/theme";

export function MerchantMarketScreen() {
  const scrollPadding = useTabScrollPadding();
  const [q, setQ] = useState("");
  const [orderProduct, setOrderProduct] = useState<{ name: string; unit: string } | null>(null);

  const filtered = useMemo(
    () => products.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  return (
    <TabScreen>
      <ScrollView contentContainerStyle={[styles.content, scrollPadding]} testID="market-screen">
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={colors.gray[400]} style={styles.searchIcon} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Rechercher un produit..."
            placeholderTextColor={colors.gray[400]}
            style={styles.searchInput}
          />
        </View>

        <Text style={styles.count}>{filtered.length} produits disponibles</Text>

        <View style={styles.list}>
          {filtered.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.icon}>{p.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Text style={styles.meta}>{p.location}</Text>
                  {p.farmer ? <Text style={styles.farmer}>{p.farmer}</Text> : null}
                </View>
                <View style={styles.priceCol}>
                  <Text style={styles.price}>${p.minInvest}</Text>
                  <Text style={styles.priceLabel}>min.</Text>
                </View>
              </View>
              <Text style={styles.stock}>
                {p.stock} {p.unit} · {p.duration} jours
              </Text>
              <Pressable
                onPress={() => setOrderProduct({ name: p.name, unit: p.unit })}
                style={styles.orderBtn}
              >
                <Ionicons name="cube-outline" size={14} color={colors.white} />
                <Text style={styles.orderText}>Commander</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
      <CommanderModal
        visible={!!orderProduct}
        onClose={() => setOrderProduct(null)}
        productName={orderProduct?.name ?? ""}
        unit={orderProduct?.unit ?? "unités"}
      />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingTop: spacing.md, gap: spacing.md },
  searchWrap: { position: "relative" },
  searchIcon: { position: "absolute", left: 14, top: 13, zIndex: 1 },
  searchInput: {
    height: 44,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    paddingLeft: 40,
    fontSize: 13,
    color: colors.gray[900],
  },
  count: {
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
  },
  cardTop: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  icon: { fontSize: 28 },
  name: { fontSize: 14, fontWeight: "700", color: colors.gray[900] },
  meta: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  farmer: { fontSize: 10, color: colors.gray[400], marginTop: 2 },
  priceCol: { alignItems: "flex-end" },
  price: { fontSize: 15, fontWeight: "800", color: colors.purple[700] },
  priceLabel: { fontSize: 10, color: colors.gray[400] },
  stock: { fontSize: 11, color: colors.gray[500], marginTop: spacing.sm, marginBottom: spacing.md },
  orderBtn: {
    height: 36,
    backgroundColor: colors.purple[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  orderText: { fontSize: 12, fontWeight: "700", color: colors.white },
});
