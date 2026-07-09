import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useAuth } from "@/hooks/useAuth";
import { cropTasks, farmerAlerts } from "@/data/mock";
import { colors, radii, shadows, spacing } from "@/theme";

const QUICK = [
  { icon: "document-text-outline" as const, label: "Rapport", href: "/report/new", tone: "green" },
  { icon: "call-outline" as const, label: "Agent", href: "/financement", tone: "amber" },
  { icon: "trending-up-outline" as const, label: "Prix marché", href: "/(tabs)/bourse", tone: "amber" },
  { icon: "school-outline" as const, label: "Formation", href: "/(tabs)/academia", tone: "blue" },
];

const ALERT_ICONS = {
  weather: "rainy-outline",
  market: "trending-up-outline",
  agent: "person-outline",
  payment: "cash-outline",
} as const;

export function FarmerHomeScreen() {
  const router = useRouter();
  const scrollPadding = useTabScrollPadding();
  const { userProfile } = useAuth();
  const firstName = (userProfile?.displayName || "Jean-Baptiste").split(" ")[0];
  const disbursed = 650;
  const target = 1000;
  const pct = Math.round((disbursed / target) * 100);
  const pending = cropTasks.filter((t) => !t.done);

  return (
    <TabScreen>
      <ScrollView
        contentContainerStyle={[styles.content, scrollPadding]}
        showsVerticalScrollIndicator={false}
        testID="home-screen"
      >
        <View style={[styles.hero, shadows.elevated]}>
          <Text style={styles.heroEyebrow}>Bonjour, {firstName}</Text>
          <Text style={styles.heroTitle}>Pastèques</Text>
          <View style={styles.heroLoc}>
            <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.heroLocText}> Songololo, Kongo Central</Text>
          </View>
          <View style={styles.heroDivider} />
          <Text style={styles.fundLabel}>FINANCEMENT DÉBLOQUÉ</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
          <View style={styles.fundRow}>
            <Text style={styles.fundReceived}>${disbursed} reçus</Text>
            <Text style={styles.fundPct}>{pct}% · objectif ${target}</Text>
          </View>
          <View style={styles.heroGrid}>
            {[
              { l: "Stade", v: "Floraison" },
              { l: "Récolte dans", v: "14 jours" },
              { l: "Étape", v: "4 / 6" },
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
              <View
                style={[
                  styles.quickIcon,
                  q.tone === "green"
                    ? styles.toneGreen
                    : q.tone === "amber"
                      ? styles.toneAmber
                      : styles.toneBlue,
                ]}
              >
                <Ionicons
                  name={q.icon}
                  size={18}
                  color={
                    q.tone === "green"
                      ? colors.green[700]
                      : q.tone === "amber"
                        ? colors.amber[700]
                        : "#2563EB"
                  }
                />
              </View>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Alertes</Text>
        <View style={styles.card}>
          {farmerAlerts.map((a) => (
            <View key={a.id} style={[styles.alertRow, a.urgent && styles.alertUrgent]}>
              <Ionicons
                name={a.urgent ? "warning-outline" : ALERT_ICONS[a.kind]}
                size={18}
                color={a.urgent ? colors.danger : colors.green[700]}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertTitle, a.urgent && { color: colors.danger }]}>{a.title}</Text>
                <Text style={styles.alertBody}>{a.body}</Text>
                <Text style={styles.alertTime}>{a.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Prochaines tâches</Text>
        <View style={styles.card}>
          {pending.slice(0, 4).map((t) => (
            <View key={t.id} style={styles.taskRow}>
              <Text style={styles.taskTitle}>{t.title}</Text>
              <Text style={styles.taskDate}>{t.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_HORIZONTAL_PADDING, gap: spacing.md, paddingTop: spacing.md },
  hero: {
    backgroundColor: colors.green[700],
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  heroEyebrow: { fontSize: 11, color: "rgba(255,255,255,0.6)" },
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
  fundLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.6)", letterSpacing: 0.5 },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: spacing.sm,
  },
  progressFill: { height: "100%", backgroundColor: colors.white },
  fundRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  fundReceived: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.9)" },
  fundPct: { fontSize: 11, color: "rgba(255,255,255,0.6)" },
  heroGrid: { flexDirection: "row", marginTop: spacing.md },
  heroCell: { flex: 1, alignItems: "center" },
  heroCellValue: { fontSize: 15, fontWeight: "800", color: colors.white },
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
    alignItems: "center",
    justifyContent: "center",
  },
  toneGreen: { backgroundColor: colors.green[50] },
  toneAmber: { backgroundColor: colors.amber[50] },
  toneBlue: { backgroundColor: "#EFF6FF" },
  quickLabel: { fontSize: 9, fontWeight: "600", color: colors.gray[500], textAlign: "center" },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  alertRow: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  alertUrgent: { backgroundColor: "#FEF2F2" },
  alertTitle: { fontSize: 12, fontWeight: "700", color: colors.gray[900] },
  alertBody: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  alertTime: { fontSize: 10, color: colors.gray[400], marginTop: 4 },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  taskTitle: { fontSize: 12, fontWeight: "700", color: colors.gray[900], flex: 1 },
  taskDate: { fontSize: 11, color: colors.gray[400] },
});
