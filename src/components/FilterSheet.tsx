import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";

export interface FilterState {
  category: string | null;
  minRoi: number | null;
  maxDuration: number | null;
}

export const EMPTY_FILTERS: FilterState = {
  category: null,
  minRoi: null,
  maxDuration: null,
};

const CATEGORIES = [
  { id: "agriculture", labelKey: "market.cat.agriculture" },
  { id: "logistique", labelKey: "market.cat.logistique" },
  { id: "export", labelKey: "market.cat.export" },
] as const;

const ROI_STEPS = [0, 10, 20, 30, 40] as const;
const DURATION_STEPS = [0, 30, 60, 90, 120] as const;

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onReset: () => void;
}

export function FilterSheet({ open, onClose, filters, onChange, onReset }: FilterSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const reset = () => {
    onReset();
    onClose();
  };

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="options-outline" size={18} color={colors.gray[700]} />
            <Text style={styles.headerTitle}>{t("market.filtersTitle")}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Ionicons name="close" size={18} color={colors.gray[600]} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionLabel}>{t("market.categories")}</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((c) => {
              const active = filters.category === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() =>
                    onChange({
                      ...filters,
                      category: active ? null : c.id,
                    })
                  }
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {t(c.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>{t("market.minRoi")}</Text>
            <Text style={styles.sectionValue}>
              {filters.minRoi ? `≥ ${filters.minRoi}%` : t("market.filterAny")}
            </Text>
          </View>
          <View style={styles.chipRow}>
            {ROI_STEPS.map((v) => {
              const active = (filters.minRoi ?? 0) === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => onChange({ ...filters, minRoi: v === 0 ? null : v })}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {v === 0 ? t("market.filterAny") : `≥${v}%`}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sectionHead}>
            <Text style={styles.sectionLabel}>{t("market.maxDuration")}</Text>
            <Text style={styles.sectionValue}>
              {filters.maxDuration ? `≤ ${filters.maxDuration}j` : t("market.filterAny")}
            </Text>
          </View>
          <View style={styles.chipRow}>
            {DURATION_STEPS.map((v) => {
              const active = (filters.maxDuration ?? 0) === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => onChange({ ...filters, maxDuration: v === 0 ? null : v })}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {v === 0 ? t("market.filterAny") : `≤${v}j`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={reset} style={styles.resetBtn}>
            <Text style={styles.resetText}>{t("market.filterReset")}</Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.applyBtn}>
            <Text style={styles.applyText}>{t("market.filterApply")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    marginTop: "auto",
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[200],
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_700Bold",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  sectionValue: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.green[700],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: colors.green[700],
    borderColor: colors.green[700],
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.gray[700],
  },
  chipTextActive: { color: colors.white },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  resetBtn: {
    flex: 1,
    height: 44,
    backgroundColor: colors.gray[100],
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  resetText: { fontSize: 13, fontWeight: "700", color: colors.gray[700] },
  applyBtn: {
    flex: 1,
    height: 44,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  applyText: { fontSize: 13, fontWeight: "700", color: colors.white },
});
