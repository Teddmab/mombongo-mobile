import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { type Category, type Product, useProducts } from "@/hooks/useProducts";
import { colors, radii, spacing } from "@/theme";

type Filter = "all" | Category | "bio" | "café" | "pêche";

const CATS: { id: Filter; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "all", labelKey: "market.all", icon: "sparkles-outline" },
  { id: "agriculture", labelKey: "market.agriculture", icon: "leaf-outline" },
  { id: "logistique", labelKey: "market.logistics", icon: "bus-outline" },
  { id: "export", labelKey: "market.export", icon: "bag-outline" },
  { id: "bio", labelKey: "market.bio", icon: "leaf-outline" },
  { id: "café", labelKey: "market.coffee", icon: "cafe-outline" },
  { id: "pêche", labelKey: "market.fish", icon: "fish-outline" },
];

function categoryVisual(category: Product["category"]) {
  if (category === "logistique") {
    return { bg: colors.amber[50], color: colors.amber[500], icon: "bus-outline" as const };
  }
  if (category === "export") {
    return { bg: "#DBEAFE", color: "#2563EB", icon: "bag-outline" as const };
  }
  return { bg: colors.green[50], color: colors.green[700], icon: "leaf-outline" as const };
}

function filterProducts(list: Product[], q: string, cat: Filter) {
  return list.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (cat === "all") return true;
    if (cat === "bio") return /bio/i.test(p.name);
    if (cat === "café") return /café/i.test(p.name);
    if (cat === "pêche") return /poisson|pêche/i.test(p.name);
    return p.category === cat;
  });
}

export function InvestorMarketScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scrollPadding = useTabScrollPadding();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Filter>("all");
  const [shown, setShown] = useState(6);
  const { data: products = [], isLoading } = useProducts();

  const filtered = useMemo(() => filterProducts(products, q, cat), [products, q, cat]);

  return (
    <TabScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, scrollPadding]}
        testID="market-screen"
      >
        <View style={styles.searchWrap}>
          <Ionicons
            name="search-outline"
            size={16}
            color={colors.gray[400]}
            style={styles.searchIcon}
          />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={t("market.search")}
            placeholderTextColor={colors.gray[400]}
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {CATS.map((c) => {
            const active = cat === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCat(c.id)}
                style={[styles.catChip, active && styles.catChipActive]}
              >
                <Ionicons
                  name={c.icon}
                  size={12}
                  color={active ? colors.white : colors.gray[700]}
                />
                <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                  {t(c.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.count}>
          {t("market.opportunities", { count: filtered.length })}
        </Text>

        {isLoading ? (
          <ActivityIndicator color={colors.green[700]} style={styles.loader} />
        ) : null}

        {!isLoading && filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={40} color={colors.gray[400]} style={{ opacity: 0.4 }} />
            <Text style={styles.emptyTitle}>Aucun produit disponible</Text>
            <Text style={styles.emptySub}>Revenez bientôt.</Text>
          </View>
        ) : null}

        <View style={styles.grid}>
          {!isLoading &&
            filtered.slice(0, shown).map((p) => {
              const vis = categoryVisual(p.category);
              return (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/market/${p.id}` as never)}
                  style={styles.card}
                >
                  <View style={[styles.cardImage, { backgroundColor: vis.bg }]}>
                    {p.image ? (
                      <Image source={{ uri: p.image }} style={styles.cardPhoto} resizeMode="cover" />
                    ) : (
                      <Ionicons name={vis.icon} size={36} color={vis.color} />
                    )}
                  </View>
                  <Text style={styles.cardName}>{p.name}</Text>
                  <Text style={styles.cardMeta}>Min : ${p.minInvest}</Text>
                  <Text style={styles.cardMeta}>Durée : {p.duration} j</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardRoi}>↑ {p.roi}% ROI</Text>
                    <View style={styles.locBadge}>
                      <Text style={styles.locText}>{p.location}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
        </View>

        {shown < filtered.length ? (
          <Pressable onPress={() => setShown((s) => s + 6)} style={styles.moreBtn}>
            <Text style={styles.moreBtnText}>Voir plus</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: spacing.md,
  },
  searchWrap: { position: "relative" },
  searchIcon: { position: "absolute", left: 14, top: 13, zIndex: 1 },
  searchInput: {
    height: 44,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    paddingLeft: 40,
    paddingRight: spacing.lg,
    fontSize: 13,
    color: colors.gray[900],
    fontFamily: "NotoSans_400Regular",
  },
  catRow: { gap: spacing.sm, paddingRight: spacing.md },
  catChip: {
    height: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  catChipActive: {
    backgroundColor: colors.green[700],
    borderColor: colors.green[700],
  },
  catChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[700],
    fontFamily: "PlusJakartaSans_700Bold",
  },
  catChipTextActive: { color: colors.white },
  count: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.gray[500],
    fontFamily: "NotoSans_500Medium",
  },
  loader: { marginVertical: spacing["2xl"] },
  empty: { alignItems: "center", paddingVertical: spacing["3xl"] },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.gray[400],
    marginTop: spacing.sm,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  emptySub: { fontSize: 12, color: colors.gray[400], marginTop: spacing.xs },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  card: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.md,
  },
  cardImage: {
    height: 80,
    borderRadius: radii.lg,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardPhoto: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  cardName: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  cardMeta: { fontSize: 11, color: colors.gray[400], marginTop: 2 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  cardRoi: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.success,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  locBadge: {
    backgroundColor: colors.green[50],
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  locText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.green[700],
  },
  moreBtn: {
    height: 44,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.green[700],
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  moreBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.green[700],
    fontFamily: "PlusJakartaSans_700Bold",
  },
});
