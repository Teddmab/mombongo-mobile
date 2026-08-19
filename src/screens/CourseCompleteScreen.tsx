import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCourse } from "@/hooks/useAcademia";
import { StackHeader } from "@/components/shell/StackHeader";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { colors, radii, shadows, spacing } from "@/theme";

export function CourseCompleteScreen({ courseId }: { courseId?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { data: course } = useCourse(courseId);

  return (
    <View
      style={[styles.root, { paddingBottom: Math.max(insets.bottom, 24) }]}
      testID="course-complete-screen"
    >
      <StackHeader title="Academia" />
      <View style={styles.body}>
        <Text style={styles.emoji}>🎓</Text>
        <Text style={styles.title}>{t("academia.congratulations")}</Text>
        <Text style={styles.sub}>
          {t("academia.courseComplete", { title: course?.title ?? "" })}
        </Text>
        <Pressable
          onPress={() => router.replace("/(tabs)/academia" as never)}
          style={styles.btn}
        >
          <Text style={styles.btnText}>{t("academia.backToCourses")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBackground },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: spacing.md,
  },
  emoji: { fontSize: 64, marginBottom: spacing.sm },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  btn: {
    marginTop: spacing.lg,
    height: 48,
    paddingHorizontal: spacing["2xl"],
    backgroundColor: colors.green[700],
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.elevated,
  },
  btnText: { color: colors.white, fontWeight: "700", fontSize: 14 },
});
