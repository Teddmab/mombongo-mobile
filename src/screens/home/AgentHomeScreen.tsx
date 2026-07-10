import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useAuth } from "@/hooks/useAuth";
import { useAgentFarmers, useAgentReports } from "@/hooks/useLocalData";
import { colors, radii, shadows, spacing } from "@/theme";

const STATUS = {
  ok: { label: "OK", bg: colors.green[100], text: colors.green[700] },
  attention: { label: "Attention", bg: colors.amber[100], text: colors.amber[700] },
  urgent: { label: "Urgent", bg: "#FEE2E2", text: colors.danger },
} as const;

const QUICK = [
  { icon: "document-text-outline" as const, label: "Nouveau rapport", href: "/report/new" },
  { icon: "people-outline" as const, label: "Agriculteurs", href: "/financement" },
  { icon: "trending-up-outline" as const, label: "Prix marché", href: "/(tabs)/bourse" },
  { icon: "school-outline" as const, label: "Formation", href: "/(tabs)/academia" },
];

export function AgentHomeScreen() {
  const router = useRouter();
  const scrollPadding = useTabScrollPadding();
  const { data: agentFarmers = [] } = useAgentFarmers();
  const { data: agentReports = [] } = useAgentReports();
  const { userProfile } = useAuth();
  const firstName = (userProfile?.displayName || "Patrick").split(" ")[0];
  const urgentCount = agentFarmers.filter((f) => f.status === "urgent").length;
  const sorted = [...agentFarmers].sort(
    (a, b) =>
      ({ urgent: 0, attention: 1, ok: 2 }[a.status] - { urgent: 0, attention: 1, ok: 2 }[b.status])
  );

  return (
    <TabScreen>
      <ScrollView
        contentContainerStyle={[styles.content, scrollPadding]}
        showsVerticalScrollIndicator={false}
        testID="home-screen"
      >
        <View style={[styles.hero, shadows.elevated]}>
          <Text style={styles.heroLabel}>AGENT TERRAIN</Text>
          <Text style={styles.heroTitle}>{firstName}</Text>
          <View style={styles.heroLoc}>
            <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.heroLocText}> Zone Kongo Central</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroGrid}>
            {[
              { l: "Assignés", v: String(agentFarmers.length) },
              { l: "Rapports", v: String(agentReports.length) },
              { l: "Urgents", v: String(urgentCount) },
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
                <Ionicons name={q.icon} size={18} color={colors.green[700]} />
              </View>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Mes agriculteurs</Text>
        <View style={styles.list}>
          {sorted.map((farmer) => {
            const st = STATUS[farmer.status];
            return (
              <Pressable
                key={farmer.id}
                onPress={() => router.push(`/financement/${farmer.id}` as never)}
                style={[
                  styles.farmerCard,
                  farmer.status === "urgent" && { borderColor: "#FECACA" },
                  farmer.status === "attention" && { borderColor: colors.amber[100] },
                ]}
              >
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
                    <View style={[styles.badge, { backgroundColor: st.bg }]}>
                      <Text style={[styles.badgeText, { color: st.text }]}>{st.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.farmerMeta}>
                    {farmer.crop} · {farmer.stage}
                  </Text>
                  <Text style={styles.farmerSub}>{farmer.region}</Text>
                </View>
                <View style={styles.harvest}>
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
            );
          })}
        </View>
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_HORIZONTAL_PADDING, gap: spacing.md, paddingTop: spacing.md },
  hero: { backgroundColor: colors.green[700], borderRadius: radii.xl, padding: spacing.xl },
  heroLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.6)", letterSpacing: 1 },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
    marginTop: 4,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  heroLoc: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  heroLocText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
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
    backgroundColor: colors.green[50],
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: { fontSize: 8, fontWeight: "600", color: colors.gray[500], textAlign: "center" },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  list: { gap: spacing.sm },
  farmerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.md,
  },
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
  badge: { borderRadius: radii.full, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 8, fontWeight: "800" },
  farmerMeta: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  farmerSub: { fontSize: 10, color: colors.gray[400], marginTop: 2 },
  harvest: { alignItems: "flex-end" },
  harvestDays: { fontSize: 13, fontWeight: "800", color: colors.gray[700] },
  harvestLabel: { fontSize: 10, color: colors.gray[400] },
});
