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
import {
  EMPTY_FILTERS,
  FilterSheet,
  type FilterState,
} from "@/components/FilterSheet";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { type Product, useProducts } from "@/hooks/useProducts";
import { colors, radii, spacing } from "@/theme";

function categoryVisual(category: Product["category"]) {
  if (category === "logistique") {
    return { bg: colors.amber[50], color: colors.amber[500], icon: "bus-outline" as const };
  }
  if (category === "export") {
    return { bg: "#DBEAFE", color: "#2563EB", icon: "bag-outline" as const };
  }
  return { bg: colors.green[50], color: colors.green[700], icon: "leaf-outline" as const };
}

function applyFilters(list: Product[], search: string, filters: FilterState) {
  return list.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.category && p.category !== filters.category) return false;
    if (filters.minRoi != null && p.roi < filters.minRoi) return false;
    if (filters.maxDuration != null && p.duration > filters.maxDuration) return false;
    return true;
  });
}

export function InvestorMarketScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scrollPadding = useTabScrollPadding();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [shown, setShown] = useState(6);
  const { data: products = [], isLoading } = useProducts();

  const filtered = useMemo(
    () => applyFilters(products, search, filters),
    [products, search, filters],
  );

  const hasActiveFilters = !!(filters.category || filters.minRoi || filters.maxDuration);

  const catLabel = (id: string) => {
    if (id === "agriculture") return t("market.cat.agriculture");
    if (id === "logistique") return t("market.cat.logistique");
    if (id === "export") return t("market.cat.export");
    return id;
  };

  return (
    <TabScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, scrollPadding]}
        testID="market-screen"
      >
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Ionicons
              name="search-outline"
              size={16}
              color={colors.gray[400]}
              style={styles.searchIcon}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t("market.searchPlaceholder")}
              placeholderTextColor={colors.gray[400]}
              style={styles.searchInput}
              testID="market-search"
            />
            {search ? (
              <Pressable onPress={() => setSearch("")} style={styles.clearBtn} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={colors.gray[400]} />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            onPress={() => setFilterOpen(true)}
            style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
            testID="market-filter-btn"
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={hasActiveFilters ? colors.white : colors.gray[700]}
            />
          </Pressable>
        </View>

        {hasActiveFilters ? (
          <View style={styles.activeChips}>
            {filters.category ? (
              <Pressable
                onPress={() => setFilters((f) => ({ ...f, category: null }))}
                style={styles.activeChip}
              >
                <Text style={styles.activeChipText}>{catLabel(filters.category)}</Text>
                <Ionicons name="close" size={12} color={colors.green[700]} />
              </Pressable>
            ) : null}
            {filters.minRoi != null ? (
              <Pressable
                onPress={() => setFilters((f) => ({ ...f, minRoi: null }))}
                style={styles.activeChip}
              >
                <Text style={styles.activeChipText}>ROI ≥ {filters.minRoi}%</Text>
                <Ionicons name="close" size={12} color={colors.green[700]} />
              </Pressable>
            ) : null}
            {filters.maxDuration != null ? (
              <Pressable
                onPress={() => setFilters((f) => ({ ...f, maxDuration: null }))}
                style={styles.activeChip}
              >
                <Text style={styles.activeChipText}>≤ {filters.maxDuration}j</Text>
                <Ionicons name="close" size={12} color={colors.green[700]} />
              </Pressable>
            ) : null}
          </View>
        ) : null}

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
            <Text style={styles.emptySub}>Modifiez vos filtres ou revenez bientôt.</Text>
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

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: spacing.md,
  },
  searchRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  searchWrap: { flex: 1, position: "relative" },
  searchIcon: { position: "absolute", left: 14, top: 13, zIndex: 1 },
  searchInput: {
    height: 44,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    paddingLeft: 40,
    paddingRight: 36,
    fontSize: 13,
    color: colors.gray[900],
    fontFamily: "NotoSans_400Regular",
  },
  clearBtn: { position: "absolute", right: 12, top: 14 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActive: {
    backgroundColor: colors.green[700],
    borderColor: colors.green[700],
  },
  activeChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.green[50],
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.green[700],
  },
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
  emptySub: { fontSize: 12, color: colors.gray[400], marginTop: spacing.xs, textAlign: "center" },
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
