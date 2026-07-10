import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useAgentFarmers, useAgentReports, type AgentFarmerCard } from "@/hooks/useLocalData";
import { colors, radii, spacing } from "@/theme";

const STATUS_CFG = {
  ok: { label: "OK", bg: colors.green[100], text: colors.green[700] },
  attention: { label: "Attention", bg: colors.amber[100], text: colors.amber[700] },
  urgent: { label: "Urgent", bg: "#FEE2E2", text: colors.danger },
} as const;

export function AgentFinancementContent({ bottomInset }: { bottomInset: number }) {
  const router = useRouter();
  const { data: agentFarmers = [] } = useAgentFarmers();
  const { data: agentReports = [] } = useAgentReports();
  const [q, setQ] = useState("");
  const urgentCount = agentFarmers.filter((f) => f.status === "urgent").length;

  const sorted = useMemo(() => {
    return [...agentFarmers]
      .filter((f) => !q || f.name.toLowerCase().includes(q.toLowerCase()))
      .sort(
        (a, b) =>
          ({ urgent: 0, attention: 1, ok: 2 }[a.status] - { urgent: 0, attention: 1, ok: 2 }[b.status])
      );
  }, [q, agentFarmers]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Math.max(bottomInset, 16) + spacing.lg }}
    >
      <View style={[styles.kpiStrip, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
        {[
          { l: "Assignés", v: String(agentFarmers.length) },
          { l: "Rapports", v: String(agentReports.length) },
          { l: "Urgents", v: String(urgentCount) },
        ].map((k) => (
          <View key={k.l} style={styles.kpiCell}>
            <Text style={styles.kpiValue}>{k.v}</Text>
            <Text style={styles.kpiLabel}>{k.l}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.searchWrap, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
        <Ionicons name="search-outline" size={16} color={colors.gray[400]} style={styles.searchIcon} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Rechercher un agriculteur..."
          placeholderTextColor={colors.gray[400]}
          style={styles.searchInput}
        />
      </View>

      <Text style={styles.sectionLabel}>Mes agriculteurs</Text>
      <View style={[styles.list, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
        {sorted.map((farmer) => (
          <FarmerRow
            key={farmer.id}
            farmer={farmer}
            onOpen={() => router.push(`/financement/${farmer.id}` as never)}
            onReport={() => router.push("/report/new" as never)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function FarmerRow({
  farmer,
  onOpen,
  onReport,
}: {
  farmer: AgentFarmerCard;
  onOpen: () => void;
  onReport: () => void;
}) {
  const status = STATUS_CFG[farmer.status];
  const borderColor =
    farmer.status === "urgent"
      ? "#FECACA"
      : farmer.status === "attention"
        ? colors.amber[100]
        : colors.gray[200];

  return (
    <View style={[styles.farmerCard, { borderColor }]}>
      <Pressable onPress={onOpen} style={styles.farmerTop}>
        <View style={styles.initials}>
          <Text style={styles.initialsText}>
            {farmer.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.farmerName}>{farmer.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
            </View>
          </View>
          <Text style={styles.farmerMeta}>
            {farmer.crop} · {farmer.stage}
          </Text>
          <Text style={styles.farmerSub}>
            {farmer.region} · {farmer.lastVisit}
          </Text>
        </View>
        <View style={styles.harvestCol}>
          <Text
            style={[
              styles.harvestDays,
              farmer.daysToHarvest <= 14 && { color: colors.amber[700] },
            ]}
          >
            {farmer.daysToHarvest}j
          </Text>
          <Text style={styles.harvestLabel}>Récolte</Text>
        </View>
      </Pressable>
      <View style={styles.actions}>
        <Pressable onPress={onReport} style={styles.reportBtn}>
          <Ionicons name="document-text-outline" size={14} color={colors.white} />
          <Text style={styles.reportBtnText}>Rapport</Text>
        </Pressable>
        <Pressable onPress={onOpen} style={styles.detailBtn}>
          <Ionicons name="chevron-forward" size={18} color={colors.gray[600]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kpiStrip: {
    flexDirection: "row",
    marginTop: spacing.md,
    backgroundColor: colors.green[700],
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  kpiCell: { flex: 1, alignItems: "center" },
  kpiValue: { fontSize: 18, fontWeight: "800", color: colors.white },
  kpiLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  searchWrap: { marginTop: spacing.md, position: "relative" },
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
  },
  sectionLabel: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    marginHorizontal: SCREEN_HORIZONTAL_PADDING,
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  list: { gap: spacing.sm },
  farmerCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  farmerTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  initials: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.green[50],
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: { fontSize: 12, fontWeight: "800", color: colors.green[700] },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  farmerName: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  statusBadge: { borderRadius: radii.full, paddingHorizontal: 6, paddingVertical: 2 },
  statusText: { fontSize: 8, fontWeight: "800" },
  farmerMeta: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  farmerSub: { fontSize: 10, color: colors.gray[400], marginTop: 2 },
  harvestCol: { alignItems: "flex-end" },
  harvestDays: { fontSize: 13, fontWeight: "800", color: colors.gray[700] },
  harvestLabel: { fontSize: 10, color: colors.gray[400] },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  reportBtn: {
    flex: 1,
    height: 36,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  reportBtnText: { fontSize: 12, fontWeight: "700", color: colors.white },
  detailBtn: {
    width: 36,
    height: 36,
    backgroundColor: colors.gray[100],
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
