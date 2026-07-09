import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { courses, type Course } from "@/data/mock";
import { colors, radii, spacing } from "@/theme";

function levelStyle(level: Course["level"]) {
  if (level === "Débutant") return { bg: colors.green[50], text: colors.green[700] };
  if (level === "Intermédiaire") return { bg: colors.amber[50], text: colors.amber[700] };
  return { bg: "#FEE2E2", text: colors.danger };
}

function CourseRow({
  course: c,
  onPress,
  t,
}: {
  course: Course;
  onPress: () => void;
  t: (k: string) => string;
}) {
  const lvl = levelStyle(c.level);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, c.isPremium && styles.rowPremium]}
    >
      <View style={[styles.rowIcon, c.isPremium ? styles.rowIconPremium : styles.rowIconDefault]}>
        {c.image ? (
          <Image source={{ uri: c.image }} style={styles.rowPhoto} resizeMode="cover" />
        ) : (
          <Text style={styles.rowEmoji}>{c.icon}</Text>
        )}
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{c.title}</Text>
        <View style={styles.rowMeta}>
          <Ionicons name="time-outline" size={12} color={colors.gray[500]} />
          <Text style={styles.rowMetaText}> {c.duration}</Text>
          <Text style={styles.rowMetaText}> · </Text>
          <Ionicons name="book-outline" size={12} color={colors.gray[500]} />
          <Text style={styles.rowMetaText}>
            {" "}
            {c.modules} {t("academia.modules")}
          </Text>
        </View>
        {c.progress > 0 && c.progress < 100 ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${c.progress}%` }]} />
          </View>
        ) : null}
      </View>
      <View style={styles.rowRight}>
        {c.isPremium ? (
          <View style={styles.premiumBadge}>
            <Ionicons name="lock-closed" size={10} color={colors.amber[900]} />
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        ) : (
          <View style={[styles.levelBadge, { backgroundColor: lvl.bg }]}>
            <Text style={[styles.levelText, { color: lvl.text }]}>{c.level}</Text>
          </View>
        )}
        {c.progress === 100 ? (
          <Text style={styles.doneText}>✓ {t("academia.courseCompleted")}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function CertRow({ course: c, onPress }: { course: Course; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.certRow}>
      <View style={styles.certIcon}>
        {c.image ? (
          <Image source={{ uri: c.image }} style={styles.rowPhoto} resizeMode="cover" />
        ) : (
          <Text style={styles.certEmoji}>{c.icon}</Text>
        )}
      </View>
      <View style={styles.certBody}>
        <Text style={styles.certTitle} numberOfLines={1}>
          {c.title}
        </Text>
        <View style={styles.certSub}>
          <Ionicons name="ribbon-outline" size={12} color={colors.amber[500]} />
          <Text style={styles.certLabel}> Certifié</Text>
          <Text style={styles.certCat}> · {c.category}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
    </Pressable>
  );
}

export function AcademiaScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scrollPadding = useTabScrollPadding();

  const inProgress = courses.filter((c) => c.progress > 0 && c.progress < 100);
  const done = courses.filter((c) => c.progress === 100);
  const others = courses.filter((c) => c.progress === 0);

  return (
    <TabScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, scrollPadding]}
        testID="academia-screen"
      >
        <View style={styles.xpCard}>
          <View style={styles.xpIcon}>
            <Ionicons name="ribbon-outline" size={24} color={colors.amber[500]} />
          </View>
          <View style={styles.xpBody}>
            <Text style={styles.xpTitle}>{t("academia.levelBronze")}</Text>
            <Text style={styles.xpSub}>{t("academia.xpDisplay")}</Text>
          </View>
          <View style={styles.xpRight}>
            <Text style={styles.xpCount}>2/6</Text>
            <Text style={styles.xpCountLabel}>{t("academia.inProgressShort")}</Text>
          </View>
        </View>

        <View style={styles.premiumBanner}>
          <Ionicons name="sparkles" size={20} color={colors.amber[900]} />
          <Text style={styles.premiumTextBanner}>Cours Premium disponibles</Text>
          <Pressable style={styles.premiumBtn}>
            <Text style={styles.premiumBtnText}>Voir</Text>
          </Pressable>
        </View>

        {done.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Mes certificats</Text>
            <View style={styles.list}>
              {done.map((c) => (
                <CertRow key={c.id} course={c} onPress={() => {}} />
              ))}
            </View>
          </>
        ) : null}

        {inProgress.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>{t("academia.continueSection")}</Text>
            <View style={styles.list}>
              {inProgress.map((c) => (
                <CourseRow
                  key={c.id}
                  course={c}
                  t={t}
                  onPress={() => router.push(`/academia/${c.id}` as never)}
                />
              ))}
            </View>
          </>
        ) : null}

        <Text style={styles.sectionLabel}>{t("academia.catalogSection")}</Text>
        <View style={styles.list}>
          {others.map((c) => (
            <CourseRow
              key={c.id}
              course={c}
              t={t}
              onPress={() => router.push(`/academia/${c.id}` as never)}
            />
          ))}
        </View>
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  xpCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  xpIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.amber[50],
    alignItems: "center",
    justifyContent: "center",
  },
  xpBody: { flex: 1 },
  xpTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  xpSub: {
    fontSize: 11,
    color: colors.gray[500],
    marginTop: 2,
    fontFamily: "NotoSans_400Regular",
  },
  xpRight: { alignItems: "flex-end" },
  xpCount: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.green[700],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  xpCountLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
  },
  premiumBanner: {
    backgroundColor: colors.amber[400],
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  premiumTextBanner: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: colors.amber[900],
    fontFamily: "PlusJakartaSans_700Bold",
  },
  premiumBtn: {
    height: 32,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.amber[900],
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FEF3C7",
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  list: { gap: 10 },
  row: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  rowPremium: {
    backgroundColor: "rgba(254, 249, 238, 0.5)",
    borderColor: colors.amber[100],
  },
  rowIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconDefault: { backgroundColor: colors.green[50] },
  rowIconPremium: { backgroundColor: colors.amber[50] },
  rowPhoto: { width: "100%", height: "100%" },
  rowEmoji: { fontSize: 24 },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_700Bold",
  },
  rowMeta: { flexDirection: "row", alignItems: "center", marginTop: 4, flexWrap: "wrap" },
  rowMetaText: { fontSize: 10, color: colors.gray[500] },
  progressTrack: {
    height: 4,
    backgroundColor: colors.gray[100],
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.green[700] },
  rowRight: { alignItems: "flex-end", gap: 4 },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: colors.amber[400],
    borderRadius: radii.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  premiumText: {
    fontSize: 8,
    fontWeight: "800",
    color: colors.amber[900],
  },
  levelBadge: { borderRadius: radii.full, paddingHorizontal: 8, paddingVertical: 2 },
  levelText: { fontSize: 9, fontWeight: "800" },
  doneText: { fontSize: 9, fontWeight: "700", color: colors.green[700] },
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.amber[100],
    borderLeftWidth: 4,
    borderLeftColor: colors.amber[400],
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  certIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    backgroundColor: colors.amber[50],
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  certEmoji: { fontSize: 18 },
  certBody: { flex: 1, minWidth: 0 },
  certTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_700Bold",
  },
  certSub: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  certLabel: { fontSize: 10, fontWeight: "700", color: colors.amber[700] },
  certCat: { fontSize: 10, color: colors.gray[400] },
});
