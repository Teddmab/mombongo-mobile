import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { CertificatePreviewModal } from "@/components/academia/CertificatePreviewModal";
import { StackHeader } from "@/components/shell/StackHeader";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import {
  useCourse,
  useCourseModules,
  useEnrollCourse,
  useMyEnrollment,
  type AcademiaModule,
} from "@/hooks/useAcademia";
import { firebaseErrorMessage } from "@/services/actions.service";
import { colors, radii, shadows, spacing } from "@/theme";

function moduleGlyph(type: AcademiaModule["type"]): keyof typeof Ionicons.glyphMap {
  if (type === "video") return "play-circle-outline";
  if (type === "pdf") return "document-text-outline";
  return "help-circle-outline";
}

export function CourseDetailScreen({ courseId }: { courseId?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: modules = [], isLoading: modulesLoading } = useCourseModules(courseId);
  const { data: enrollment } = useMyEnrollment(courseId);
  const enrollMutation = useEnrollCourse();
  const [certOpen, setCertOpen] = useState(false);

  const isEnrolled = !!enrollment;
  const progressPct = enrollment?.progressPct ?? 0;
  const completedModules = enrollment?.completedModules ?? [];
  const isFullyComplete = isEnrolled && progressPct >= 100;

  const nextModule = isEnrolled
    ? modules.find((m) => !completedModules.includes(m.id)) ?? modules[0]
    : modules.find((m) => m.isFree) ?? null;

  const handleEnroll = async () => {
    if (!courseId) return;
    try {
      await enrollMutation.mutateAsync(courseId);
      Alert.alert("Mombongo", t("academia.enrollSuccess"));
    } catch (err) {
      Alert.alert("Mombongo", firebaseErrorMessage(err, "Impossible de s'inscrire."));
    }
  };

  const openModule = (m: AcademiaModule) => {
    if (m.isFree || isEnrolled) {
      router.push(`/academia/${courseId}/module/${m.id}` as never);
      return;
    }
    Alert.alert("Mombongo", t("academia.locked"));
  };

  const handleCta = () => {
    if (isEnrolled) {
      if (nextModule) openModule(nextModule);
      return;
    }
    void handleEnroll();
  };

  if (courseLoading || modulesLoading) {
    return (
      <View style={styles.root} testID="course-detail-screen">
        <StackHeader title="Academia" />
        <ActivityIndicator color={colors.green[700]} style={{ marginTop: spacing.xl }} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.root} testID="course-detail-screen">
        <StackHeader title="Academia" />
        <Text style={styles.missing}>{t("academia.empty")}</Text>
      </View>
    );
  }

  const heroImage = course.image;

  return (
    <View style={styles.root} testID="course-detail-screen">
      <StackHeader title="Academia" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 72 }}
      >
        <View style={styles.hero}>
          {heroImage ? (
            <ImageBackground
              source={{ uri: heroImage }}
              style={styles.heroBg}
              imageStyle={styles.heroBgImg}
            >
              <View style={styles.heroOverlay} />
            </ImageBackground>
          ) : null}
          <View style={styles.heroContent}>
            <View style={styles.heroIconWrap}>
              {heroImage ? (
                <Image source={{ uri: heroImage }} style={styles.heroPhoto} resizeMode="cover" />
              ) : (
                <Text style={styles.heroIcon}>{course.icon}</Text>
              )}
            </View>
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>{course.level}</Text>
            </View>
            <Text style={styles.heroTitle}>{course.title}</Text>
            {course.instructorName ? (
              <Text style={styles.heroInstructor}>{course.instructorName}</Text>
            ) : null}
            <View style={styles.heroMeta}>
              <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroMetaText}> {course.duration}</Text>
              <Text style={styles.heroMetaText}> · </Text>
              <Ionicons name="book-outline" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroMetaText}>
                {" "}
                {t("academia.modules_count", { n: course.modules })}
              </Text>
              {course.enrollmentCount > 0 ? (
                <>
                  <Text style={styles.heroMetaText}> · </Text>
                  <Ionicons name="people-outline" size={12} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.heroMetaText}> {course.enrollmentCount}</Text>
                </>
              ) : null}
            </View>
          </View>
        </View>

        {isEnrolled ? (
          <View style={[styles.progressCard, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>{t("academia.progress")}</Text>
              <Text style={styles.progressPct}>{progressPct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </View>
        ) : null}

        {isFullyComplete ? (
          <View style={[styles.doneBanner, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
            <Ionicons name="trophy" size={20} color={colors.green[700]} />
            <View style={styles.doneBannerBody}>
              <Text style={styles.doneTitle}>Cours terminé — Félicitations !</Text>
              <Text style={styles.doneSub}>Votre certificat est disponible.</Text>
            </View>
            <Pressable onPress={() => setCertOpen(true)} style={styles.certBtn}>
              <Text style={styles.certBtnText}>Voir</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>Contenu du cours</Text>
        <View style={[styles.moduleList, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          {modules.map((m, idx) => {
            const canOpen = m.isFree || isEnrolled;
            const done = completedModules.includes(m.id);
            return (
              <Pressable
                key={m.id}
                onPress={() => openModule(m)}
                style={[styles.moduleRow, !canOpen && styles.moduleRowDisabled, done && styles.moduleRowDone]}
              >
                <View
                  style={[
                    styles.moduleIcon,
                    done && styles.moduleIconDone,
                    !canOpen && styles.moduleIconLocked,
                  ]}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={18} color={colors.white} />
                  ) : !canOpen ? (
                    <Ionicons name="lock-closed" size={16} color={colors.gray[400]} />
                  ) : (
                    <Ionicons name={moduleGlyph(m.type)} size={18} color={colors.amber[700]} />
                  )}
                </View>
                <View style={styles.moduleBody}>
                  <View style={styles.moduleTitleRow}>
                    <Text style={styles.moduleOrder}>{idx + 1}.</Text>
                    <Text style={styles.moduleTitle} numberOfLines={2}>
                      {m.title}
                    </Text>
                  </View>
                  <View style={styles.moduleMeta}>
                    <Text style={styles.moduleDuration}>{m.durationMinutes} min</Text>
                    <Text style={styles.moduleType}>{m.type}</Text>
                    {m.isFree ? <Text style={styles.moduleFree}>Gratuit</Text> : null}
                  </View>
                </View>
                {done ? (
                  <Ionicons name="checkmark-circle" size={20} color={colors.green[600]} />
                ) : !canOpen ? (
                  <Ionicons name="lock-closed" size={16} color={colors.gray[400]} />
                ) : (
                  <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
                )}
              </Pressable>
            );
          })}
        </View>

        {course.instructorName ? (
          <>
            <Text style={styles.sectionLabel}>Instructeur</Text>
            <View style={[styles.instructorCard, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
              <View style={styles.instructorBody}>
                <Text style={styles.instructorName}>{course.instructorName}</Text>
                <Text style={styles.instructorTitle}>{course.category}</Text>
              </View>
            </View>
          </>
        ) : null}

        <Text style={styles.sectionLabel}>À propos</Text>
        <View style={[styles.aboutCard, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          <Text style={styles.aboutText}>{course.description}</Text>
          <View style={styles.aboutGrid}>
            {[
              { l: "Niveau", v: course.level },
              { l: "Durée", v: course.duration },
              { l: "Certification", v: "Officielle" },
            ].map((item) => (
              <View key={item.l} style={styles.aboutCell}>
                <Text style={styles.aboutCellLabel}>{item.l}</Text>
                <Text style={styles.aboutCellValue}>{item.v}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          onPress={handleCta}
          disabled={enrollMutation.isPending}
          style={[styles.ctaBtn, enrollMutation.isPending && { opacity: 0.6 }]}
          testID="course-enroll-btn"
        >
          {enrollMutation.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons
                name={isEnrolled ? "play" : "school-outline"}
                size={16}
                color={colors.white}
              />
              <Text style={styles.ctaBtnText}>
                {isEnrolled ? t("academia.continue") : t("academia.enroll")}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      <CertificatePreviewModal
        course={course}
        visible={certOpen}
        onClose={() => setCertOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBackground },
  missing: {
    padding: spacing.lg,
    color: colors.gray[500],
    textAlign: "center",
  },
  hero: {
    backgroundColor: colors.green[800],
    overflow: "hidden",
    position: "relative",
  },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroBgImg: { opacity: 0.25 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20,83,45,0.65)",
  },
  heroContent: {
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing["2xl"],
    paddingHorizontal: spacing.xl,
  },
  heroIconWrap: {
    width: 80,
    height: 80,
    borderRadius: radii.xl,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroPhoto: { width: "100%", height: "100%" },
  heroIcon: { fontSize: 40 },
  levelPill: {
    marginTop: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  levelPillText: { fontSize: 9, fontWeight: "800", color: colors.white },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
    marginTop: spacing.sm,
    textAlign: "center",
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  heroInstructor: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 6,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  heroMetaText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  progressCard: {
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: { fontSize: 12, fontWeight: "700", color: colors.gray[700] },
  progressPct: { fontSize: 12, fontWeight: "700", color: colors.green[700] },
  progressTrack: {
    height: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.green[700] },
  doneBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.green[50],
    borderWidth: 1,
    borderColor: colors.green[100],
    borderRadius: radii.xl,
    padding: spacing.md,
  },
  doneBannerBody: { flex: 1 },
  doneTitle: { fontSize: 12, fontWeight: "700", color: colors.green[800] },
  doneSub: { fontSize: 11, color: colors.green[700], marginTop: 2 },
  certBtn: {
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  certBtnText: { fontSize: 11, fontWeight: "700", color: colors.white },
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
  moduleList: { gap: spacing.sm },
  moduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  moduleRowDone: { borderColor: colors.green[100] },
  moduleRowDisabled: { opacity: 0.6 },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.amber[50],
    alignItems: "center",
    justifyContent: "center",
  },
  moduleIconDone: { backgroundColor: colors.green[700] },
  moduleIconLocked: { backgroundColor: colors.gray[100] },
  moduleBody: { flex: 1, minWidth: 0 },
  moduleTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 4 },
  moduleOrder: { fontSize: 13, fontWeight: "700", color: colors.gray[400] },
  moduleTitle: { fontSize: 13, fontWeight: "700", color: colors.gray[900], flex: 1 },
  moduleMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" },
  moduleDuration: { fontSize: 10, color: colors.gray[400] },
  moduleType: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.gray[400],
    backgroundColor: colors.gray[50],
    borderRadius: radii.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    textTransform: "uppercase",
  },
  moduleFree: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.green[700],
  },
  aboutCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  aboutText: { fontSize: 13, color: colors.gray[700], lineHeight: 20 },
  aboutGrid: {
    flexDirection: "row",
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    gap: spacing.sm,
  },
  aboutCell: { flex: 1 },
  aboutCellLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
  },
  aboutCellValue: { fontSize: 13, fontWeight: "800", color: colors.gray[900], marginTop: 2 },
  instructorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  instructorBody: { flex: 1 },
  instructorName: { fontSize: 14, fontWeight: "800", color: colors.gray[900] },
  instructorTitle: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: spacing.md,
    backgroundColor: colors.appBackground,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  ctaBtn: {
    height: 48,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    ...shadows.elevated,
  },
  ctaBtnText: { fontSize: 14, fontWeight: "700", color: colors.white },
});
