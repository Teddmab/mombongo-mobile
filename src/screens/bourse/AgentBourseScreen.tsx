import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BourseTickerBar } from "@/components/bourse/BourseTickerBar";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useBourseOpportunities } from "@/hooks/useLocalData";
import { colors, radii, spacing } from "@/theme";

const TYPE_ICON = {
  transport: "bus-outline",
  stockage: "archive-outline",
  transformation: "construct-outline",
} as const;

export function AgentBourseScreen() {
  const router = useRouter();
  const scrollPadding = useTabScrollPadding();
  const { data: bourseOpportunities = [] } = useBourseOpportunities();

  return (
    <TabScreen>
      <ScrollView contentContainerStyle={[styles.content, scrollPadding]} testID="bourse-screen">
        <BourseTickerBar />

        <View style={styles.info}>
          <Ionicons name="information-circle-outline" size={18} color={colors.amber[700]} />
          <Text style={styles.infoText}>
            Suivez les opportunités de transport pour vos agriculteurs assignés
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Opportunités ouvertes</Text>
        <View style={styles.list}>
          {bourseOpportunities.map((o) => (
            <Pressable
              key={o.id}
              onPress={() => router.push(`/bourse/${o.id}` as never)}
              style={styles.card}
            >
              <View style={styles.icon}>
                <Ionicons
                  name={TYPE_ICON[o.type]}
                  size={20}
                  color={colors.amber[700]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={2}>
                  {o.title}
                </Text>
                <Text style={styles.meta}>
                  {o.volume} · {o.duration}
                </Text>
                <Text style={styles.comm}>+{o.commission}% commission</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingTop: spacing.md, gap: spacing.md },
  info: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.amber[50],
    borderWidth: 1,
    borderColor: colors.amber[100],
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: "center",
  },
  infoText: { flex: 1, fontSize: 12, color: colors.amber[700] },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  list: { gap: spacing.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.amber[50],
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  meta: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  comm: { fontSize: 11, fontWeight: "700", color: colors.amber[700], marginTop: 4 },
});
