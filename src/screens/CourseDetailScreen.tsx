import { useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CertificatePreviewModal } from "@/components/academia/CertificatePreviewModal";
import { ModulePlayerModal } from "@/components/academia/ModulePlayerModal";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { StackHeader } from "@/components/shell/StackHeader";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useCourses, type AcademiaListCourse } from "@/hooks/useAcademia";
import type { CourseModule } from "@/hooks/useLocalData";
import { colors, radii, shadows, spacing } from "@/theme";

const USER_HAS_PREMIUM = false;

function moduleIcon(type: CourseModule["type"]): keyof typeof Ionicons.glyphMap {
  if (type === "video") return "play-circle-outline";
  if (type === "reading") return "document-text-outline";
  return "help-circle-outline";
}

export function CourseDetailScreen({ courseId }: { courseId?: string }) {
  const insets = useSafeAreaInsets();
  const { data: courses = [], isLoading } = useCourses();
  const course: AcademiaListCourse | undefined =
    courses.find((c) => c.id === courseId) ?? courses[0];
  // Modules live — S5-03 ; placeholder vide pour la navigation liste → détail
  const mods: CourseModule[] = [];

  const moduleCount = course?.modules ?? 1;
  const initialDone = course ? Math.round((course.progress / 100) * moduleCount) : 0;
  const [completedSet, setCompletedSet] = useState<Set<number>>(
    () => new Set(Array.from({ length: initialDone }, (_, i) => i))
  );
  const [playing, setPlaying] = useState<number | null>(null);
  const [subOpen, setSubOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);

  if (isLoading || !course) {
    return (
      <View style={styles.root} testID="course-detail-screen">
        <StackHeader title="Academia" />
        <Text style={{ padding: spacing.lg, color: colors.gray[500] }}>
          {isLoading ? "Chargement…" : "Cours introuvable"}
        </Text>
      </View>
    );
  }

  const progress =
    moduleCount > 0 ? Math.round((completedSet.size / moduleCount) * 100) : 0;
  const isFullyComplete = mods.length > 0 && completedSet.size >= mods.length;
  const ctaLabel = progress === 0 ? "Commencer" : progress === 100 ? "Revoir" : "Continuer";

  const isLocked = (idx: number) =>
    course.isPremium && !USER_HAS_PREMIUM && idx >= course.previewModules;

  const canOpen = (idx: number) => {
    if (isLocked(idx)) return true;
    if (completedSet.has(idx)) return true;
    const maxDone = completedSet.size > 0 ? Math.max(...Array.from(completedSet)) : -1;
    return idx <= maxDone + 1;
  };

  const markDone = (idx: number) => {
    setCompletedSet((prev) => new Set([...prev, idx]));
    setPlaying(null);
  };

  const startCourse = () => {
    const next = mods.findIndex((_, i) => !completedSet.has(i));
    if (next >= 0) setPlaying(next);
  };

  const activeMod = playing !== null ? mods[playing] : null;
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
            <ImageBackground source={{ uri: heroImage }} style={styles.heroBg} imageStyle={styles.heroBgImg}>
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
              {!heroImage ? null : (
                <Text style={[styles.heroIcon, styles.heroIconOverlay]}>{course.icon}</Text>
              )}
            </View>
          <Text style={styles.heroTitle}>{course.title}</Text>
          {course.instructorName ? (
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginBottom: 6 }}>
              {course.instructorName}
            </Text>
          ) : null}
          <View style={styles.heroMeta}>
            <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.heroMetaText}> {course.duration}</Text>
            <Text style={styles.heroMetaText}> · </Text>
            <Ionicons name="book-outline" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.heroMetaText}> {course.modules} modules</Text>
          </View>
          {progress > 0 ? (
            <View style={styles.heroProgress}>
              <View style={styles.heroProgressTrack}>
                <View style={[styles.heroProgressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.heroProgressText}>
                {progress}% · {completedSet.size}/{course.modules} modules
              </Text>
            </View>
          ) : null}
          {course.isPremium ? (
            <View style={styles.premiumPill}>
              <Text style={styles.premiumPillText}>PREMIUM</Text>
            </View>
          ) : null}
          </View>
        </View>

        {course.isPremium && !USER_HAS_PREMIUM ? (
          <View style={[styles.premiumBanner, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
            <Ionicons name="sparkles" size={16} color={colors.amber[700]} />
            <View style={styles.premiumBannerBody}>
              <Text style={styles.premiumBannerTitle}>
                {course.previewModules} module{course.previewModules > 1 ? "s" : ""} en aperçu gratuit
              </Text>
              <Text style={styles.premiumBannerSub}>Débloquez tout avec Premium.</Text>
            </View>
            <Pressable onPress={() => setSubOpen(true)} style={styles.premiumBannerBtn}>
              <Text style={styles.premiumBannerBtnText}>Upgrade</Text>
            </Pressable>
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
              <Text style={styles.certBtnText}>Voir le certificat</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>Programme</Text>
        <View style={[styles.moduleList, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          {mods.length === 0 ? (
            <Text style={{ color: colors.gray[500], fontSize: 13, paddingVertical: spacing.md }}>
              Les modules seront disponibles bientôt.
            </Text>
          ) : null}
          {mods.map((mod, i) => {
            const done = completedSet.has(i);
            const locked = isLocked(i);
            const accessible = canOpen(i);
            const isPreview = course.isPremium && !USER_HAS_PREMIUM && i < course.previewModules;
            return (
              <Pressable
                key={i}
                onPress={() => {
                  if (!accessible) return;
                  if (locked) {
                    setSubOpen(true);
                    return;
                  }
                  setPlaying(i);
                }}
                style={[
                  styles.moduleRow,
                  done && styles.moduleRowDone,
                  !accessible && !locked && styles.moduleRowDisabled,
                ]}
              >
                <View
                  style={[
                    styles.moduleIcon,
                    done && styles.moduleIconDone,
                    locked && styles.moduleIconLocked,
                  ]}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={18} color={colors.white} />
                  ) : locked ? (
                    <Ionicons name="lock-closed" size={16} color={colors.gray[400]} />
                  ) : (
                    <Ionicons name={moduleIcon(mod.type)} size={18} color={colors.amber[700]} />
                  )}
                </View>
                <View style={styles.moduleBody}>
                  <View style={styles.moduleTitleRow}>
                    <Text style={styles.moduleTitle} numberOfLines={2}>
                      {mod.title}
                    </Text>
                    {isPreview && !done ? (
                      <View style={styles.previewBadge}>
                        <Text style={styles.previewBadgeText}>Aperçu</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.moduleMeta}>
                    <Text style={styles.moduleDuration}>{mod.duration}</Text>
                    <Text style={styles.moduleType}>{mod.type}</Text>
                    {locked ? <Text style={styles.modulePremium}>Premium</Text> : null}
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={accessible ? colors.gray[400] : colors.gray[200]}
                />
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
        {course.isPremium && !USER_HAS_PREMIUM ? (
          <Pressable onPress={() => setSubOpen(true)} style={styles.ctaPremium}>
            <Ionicons name="sparkles" size={16} color={colors.amber[900]} />
            <Text style={styles.ctaPremiumText}>Passer en Premium</Text>
          </Pressable>
        ) : (
          <Pressable onPress={startCourse} style={styles.ctaBtn}>
            <Ionicons name="play" size={16} color={colors.white} />
            <Text style={styles.ctaBtnText}>{ctaLabel}</Text>
          </Pressable>
        )}
      </View>

      {activeMod && playing !== null ? (
        <ModulePlayerModal
          visible={playing !== null}
          mod={activeMod}
          locked={isLocked(playing)}
          onClose={() => setPlaying(null)}
          onComplete={() => markDone(playing)}
          onUpgrade={() => {
            setPlaying(null);
            setSubOpen(true);
          }}
        />
      ) : null}

      <SubscriptionModal visible={subOpen} onClose={() => setSubOpen(false)} />
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
  hero: {
    backgroundColor: colors.green[800],
    overflow: "hidden",
    position: "relative",
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
  },
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
  heroIconOverlay: {
    position: "absolute",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
    marginTop: spacing.md,
    textAlign: "center",
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  heroMeta: { flexDirection: "row", alignItems: "center", marginTop: spacing.xs },
  heroMetaText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  heroProgress: { width: "100%", maxWidth: 280, marginTop: spacing.lg },
  heroProgressTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  heroProgressFill: { height: "100%", backgroundColor: colors.amber[400] },
  heroProgressText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
    textAlign: "center",
  },
  premiumPill: {
    marginTop: spacing.sm,
    backgroundColor: colors.amber[400],
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  premiumPillText: { fontSize: 9, fontWeight: "800", color: colors.amber[900], letterSpacing: 0.5 },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: colors.amber[50],
    borderWidth: 1,
    borderColor: colors.amber[100],
    borderRadius: radii.xl,
    padding: spacing.md,
  },
  premiumBannerBody: { flex: 1 },
  premiumBannerTitle: { fontSize: 12, fontWeight: "700", color: colors.amber[900] },
  premiumBannerSub: { fontSize: 11, color: colors.amber[700], marginTop: 2 },
  premiumBannerBtn: {
    backgroundColor: colors.amber[400],
    borderRadius: radii.lg,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  premiumBannerBtnText: { fontSize: 11, fontWeight: "700", color: colors.amber[900] },
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
  moduleRowDisabled: { opacity: 0.55 },
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
  moduleTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  moduleTitle: { fontSize: 13, fontWeight: "700", color: colors.gray[900], flex: 1 },
  previewBadge: {
    backgroundColor: colors.green[50],
    borderRadius: radii.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  previewBadgeText: { fontSize: 9, fontWeight: "700", color: colors.green[700] },
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
  modulePremium: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.amber[700],
    backgroundColor: colors.amber[50],
    borderRadius: radii.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
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
  aboutCellLabel: { fontSize: 10, fontWeight: "700", color: colors.gray[400], textTransform: "uppercase" },
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
  instructorPhoto: { width: 48, height: 48, borderRadius: 24 },
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
  ctaPremium: {
    height: 48,
    backgroundColor: colors.amber[400],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    ...shadows.elevated,
  },
  ctaPremiumText: { fontSize: 14, fontWeight: "700", color: colors.amber[900] },
});
