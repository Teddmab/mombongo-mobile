import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PublierPourAgriculteurModal } from "@/components/forms/ActionForms";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useAgentFarmers } from "@/hooks/useLocalData";
import { colors, radii, spacing } from "@/theme";

const STATUS = {
  ok: { label: "OK", bg: colors.green[100], text: colors.green[700] },
  attention: { label: "Attention", bg: colors.amber[100], text: colors.amber[700] },
  urgent: { label: "Urgent", bg: "#FEE2E2", text: colors.danger },
} as const;

export function AgentMarketScreen() {
  const router = useRouter();
  const scrollPadding = useTabScrollPadding();
  const { data: agentFarmers = [] } = useAgentFarmers();
  const [publishFarmerId, setPublishFarmerId] = useState<string | null>(null);
  const sorted = [...agentFarmers].sort(
    (a, b) =>
      ({ urgent: 0, attention: 1, ok: 2 }[a.status] - { urgent: 0, attention: 1, ok: 2 }[b.status])
  );
  const toManage = agentFarmers.filter((f) => f.status !== "ok").length;

  return (
    <TabScreen>
      <ScrollView contentContainerStyle={[styles.content, scrollPadding]} testID="market-screen">
        <View style={styles.banner}>
          <Ionicons name="time-outline" size={20} color={colors.amber[700]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{toManage} agriculteurs à gérer</Text>
            <Text style={styles.bannerSub}>Publiez leurs produits pour attirer des investisseurs</Text>
          </View>
        </View>

        <View style={styles.list}>
          {sorted.map((farmer) => {
            const st = STATUS[farmer.status];
            return (
              <View key={farmer.id} style={styles.card}>
                <View style={styles.cardTop}>
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
                      <Text style={styles.name}>{farmer.name}</Text>
                      <View style={[styles.badge, { backgroundColor: st.bg }]}>
                        <Text style={[styles.badgeText, { color: st.text }]}>{st.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.meta}>
                      {farmer.crop} · {farmer.region}
                    </Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    onPress={() => setPublishFarmerId(farmer.id)}
                    style={styles.publishBtn}
                  >
                    <Ionicons name="add" size={14} color={colors.white} />
                    <Text style={styles.publishText}>Publier</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push(`/financement/${farmer.id}` as never)}
                    style={styles.detailBtn}
                  >
                    <Ionicons name="chevron-forward" size={18} color={colors.gray[600]} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <PublierPourAgriculteurModal
        visible={!!publishFarmerId}
        onClose={() => setPublishFarmerId(null)}
        defaultFarmerId={publishFarmerId ?? undefined}
      />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingTop: spacing.md, gap: spacing.md },
  banner: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.amber[50],
    borderWidth: 1,
    borderColor: colors.amber[100],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  bannerTitle: { fontSize: 12, fontWeight: "700", color: colors.amber[700] },
  bannerSub: { fontSize: 11, color: colors.amber[700], marginTop: 2 },
  list: { gap: spacing.sm },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  cardTop: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  initials: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.green[50],
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: { fontSize: 11, fontWeight: "800", color: colors.green[700] },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  name: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  badge: { borderRadius: radii.full, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 9, fontWeight: "800" },
  meta: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  publishBtn: {
    flex: 1,
    height: 36,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  publishText: { fontSize: 12, fontWeight: "700", color: colors.white },
  detailBtn: {
    width: 36,
    height: 36,
    backgroundColor: colors.gray[100],
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
