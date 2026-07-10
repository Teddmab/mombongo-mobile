import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useCropTasks } from "@/hooks/useLocalData";
import { colors, radii, shadows, spacing } from "@/theme";

const DISBURSE_HISTORY = [
  { id: "d1", date: "1 juin 2026", amount: 250, label: "Tranche 1 — démarrage" },
  { id: "d2", date: "15 mai 2026", amount: 250, label: "Tranche 2 — semis validés" },
  { id: "d3", date: "2 mai 2026", amount: 150, label: "Tranche 3 — rapport agent" },
];

const TASK_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  irrigation: "water-outline",
  fertilisation: "flask-outline",
  traitement: "flask-outline",
  récolte: "cut-outline",
  visite: "person-outline",
};

export function FarmerFinancementContent({ bottomInset }: { bottomInset: number }) {
  const { data: cropTasks = [] } = useCropTasks();
  const disbursed = 650;
  const target = 1000;
  const pct = Math.round((disbursed / target) * 100);
  const pending = cropTasks.filter((t) => !t.done);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Math.max(bottomInset, 16) + spacing.lg }}
    >
      <View style={[styles.hero, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
        <Text style={styles.heroLabel}>FINANCEMENT ACCORDÉ</Text>
        <Text style={styles.heroValue}>${disbursed}</Text>
        <Text style={styles.heroSub}>sur ${target} objectif</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <View style={styles.heroMeta}>
          <Text style={styles.heroMetaText}>{pct}% atteint</Text>
          <Text style={styles.heroMetaText}>${target - disbursed} restants</Text>
        </View>
        <View style={styles.heroDivider} />
        <View style={styles.heroGrid}>
          {[
            { l: "Investisseurs", v: "3" },
            { l: "Tranches", v: "3/4" },
            { l: "Récolte", v: "15 juin" },
          ].map((s) => (
            <View key={s.l} style={styles.heroCell}>
              <Text style={styles.heroCellValue}>{s.v}</Text>
              <Text style={styles.heroCellLabel}>{s.l}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.agentCard, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
        <View style={styles.agentAvatar}>
          <Text style={styles.agentInitials}>PK</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.agentName}>Patrick Kadima</Text>
          <Text style={styles.agentSub}>Agent terrain · Prochaine visite 5 juin</Text>
        </View>
        <Pressable
          onPress={() => Alert.alert("Mombongo", "Contacter Patrick — bientôt disponible")}
          style={styles.agentBtn}
        >
          <Ionicons name="call-outline" size={18} color={colors.green[700]} />
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>Historique versements</Text>
      <View style={[styles.card, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
        {DISBURSE_HISTORY.map((d) => (
          <View key={d.id} style={styles.historyRow}>
            <Ionicons name="cash-outline" size={20} color={colors.green[600]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.historyLabel}>{d.label}</Text>
              <Text style={styles.historyDate}>{d.date}</Text>
            </View>
            <Text style={styles.historyAmount}>+${d.amount}</Text>
          </View>
        ))}
        <View style={[styles.historyRow, styles.historyPending]}>
          <Ionicons name="time-outline" size={20} color={colors.gray[400]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.historyPendingLabel}>Tranche finale · à la récolte</Text>
            <Text style={styles.historyDate}>15 juin 2026</Text>
          </View>
          <Text style={styles.historyPendingAmount}>${target - disbursed}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Prochaines tâches</Text>
      <View style={[styles.card, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
        {pending.map((task) => (
          <View key={task.id} style={styles.taskRow}>
            <View style={styles.taskIcon}>
              <Ionicons name={TASK_ICONS[task.type] ?? "ellipse-outline"} size={16} color={colors.green[700]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskType}>{task.type}</Text>
            </View>
            <Text style={styles.taskDate}>{task.date}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: spacing.md,
    backgroundColor: colors.green[700],
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.elevated,
  },
  heroLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.6)", letterSpacing: 1 },
  heroValue: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.white,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  heroSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: spacing.md,
  },
  progressFill: { height: "100%", backgroundColor: colors.white },
  heroMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  heroMetaText: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  heroDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: spacing.md },
  heroGrid: { flexDirection: "row" },
  heroCell: { flex: 1, alignItems: "center" },
  heroCellValue: { fontSize: 15, fontWeight: "800", color: colors.white },
  heroCellLabel: { fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  agentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.green[700],
    alignItems: "center",
    justifyContent: "center",
  },
  agentInitials: { fontSize: 13, fontWeight: "800", color: colors.white },
  agentName: { fontSize: 14, fontWeight: "700", color: colors.gray[900] },
  agentSub: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  agentBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    backgroundColor: colors.green[50],
    alignItems: "center",
    justifyContent: "center",
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
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  historyLabel: { fontSize: 12, fontWeight: "700", color: colors.gray[900] },
  historyDate: { fontSize: 10, color: colors.gray[400], marginTop: 2 },
  historyAmount: { fontSize: 14, fontWeight: "800", color: colors.green[700] },
  historyPending: { backgroundColor: colors.gray[50] },
  historyPendingLabel: { fontSize: 12, fontWeight: "700", color: colors.gray[400] },
  historyPendingAmount: { fontSize: 14, fontWeight: "800", color: colors.gray[400] },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  taskIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.lg,
    backgroundColor: colors.green[50],
    alignItems: "center",
    justifyContent: "center",
  },
  taskTitle: { fontSize: 12, fontWeight: "700", color: colors.gray[900] },
  taskType: { fontSize: 10, color: colors.gray[400], textTransform: "capitalize" },
  taskDate: { fontSize: 11, color: colors.gray[400] },
});
