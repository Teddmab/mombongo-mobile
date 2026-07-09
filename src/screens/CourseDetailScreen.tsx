import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SubscriptionModal } from "@/components/profile/ProfileModals";
import { StackHeader } from "@/components/shell/StackHeader";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import {
  courses,
  getCourseModules,
  type Course,
  type CourseModule,
} from "@/data/mock";
import { colors, radii, shadows, spacing } from "@/theme";

const USER_HAS_PREMIUM = false;

function moduleIcon(type: CourseModule["type"]): keyof typeof Ionicons.glyphMap {
  if (type === "video") return "play-circle-outline";
  if (type === "reading") return "document-text-outline";
  return "help-circle-outline";
}

function ModulePlayer({
  visible,
  mod,
  locked,
  onClose,
  onComplete,
  onUpgrade,
}: {
  visible: boolean;
  mod: CourseModule;
  locked: boolean;
  onClose: () => void;
  onComplete: () => void;
  onUpgrade: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.playerRoot, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.playerHeader}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.gray[700]} />
          </Pressable>
          <Text style={styles.playerType}>{mod.type.toUpperCase()}</Text>
          <View style={{ width: 24 }} />
        </View>

        {locked ? (
          <View style={styles.playerLocked}>
            <Ionicons name="lock-closed" size={40} color={colors.amber[500]} />
            <Text style={styles.playerLockedTitle}>Contenu Premium</Text>
            <Text style={styles.playerLockedSub}>
              Débloquez ce module avec un abonnement Premium.
            </Text>
            <Pressable onPress={onUpgrade} style={styles.upgradeBtn}>
              <Text style={styles.upgradeBtnText}>Mettre à niveau</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.playerBody,
              { paddingBottom: Math.max(insets.bottom, 16) + 80 },
            ]}
          >
            <Text style={styles.playerTitle}>{mod.title}</Text>
            <Text style={styles.playerDuration}>{mod.duration}</Text>

            {mod.type === "video" ? (
              <View style={styles.videoPlaceholder}>
                <Ionicons name="play" size={36} color={colors.white} />
                <Text style={styles.videoPlaceholderText}>Lecture vidéo (mock)</Text>
              </View>
            ) : null}

            {mod.type === "reading" && mod.content ? (
              <Text style={styles.readingContent}>{mod.content}</Text>
            ) : null}

            {mod.type === "quiz" ? (
              <View style={styles.quizBox}>
                <Ionicons name="help-circle-outline" size={32} color={colors.green[700]} />
                <Text style={styles.quizText}>Quiz interactif — répondez aux questions pour valider le module.</Text>
              </View>
            ) : null}
          </ScrollView>
        )}

        {!locked ? (
          <View style={[styles.playerFooter, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <Pressable onPress={onComplete} style={styles.completeBtn}>
              <Text style={styles.completeBtnText}>Marquer comme terminé</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

export function CourseDetailScreen({ courseId }: { courseId?: string }) {
  const insets = useSafeAreaInsets();
  const course = courses.find((c) => c.id === courseId) ?? courses[0];
  const mods = getCourseModules(course);

  const initialDone = Math.round((course.progress / 100) * course.modules);
  const [completedSet, setCompletedSet] = useState<Set<number>>(
    () => new Set(Array.from({ length: initialDone }, (_, i) => i))
  );
  const [playing, setPlaying] = useState<number | null>(null);
  const [subOpen, setSubOpen] = useState(false);

  const progress = Math.round((completedSet.size / course.modules) * 100);
  const isFullyComplete = completedSet.size >= course.modules;
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

  return (
    <View style={styles.root} testID="course-detail-screen">
      <StackHeader title="Academia" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 72 }}
      >
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Text style={styles.heroIcon}>{course.icon}</Text>
          </View>
          <Text style={styles.heroTitle}>{course.title}</Text>
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
            <View>
              <Text style={styles.doneTitle}>Cours terminé — Félicitations !</Text>
              <Text style={styles.doneSub}>Certificat disponible dans votre profil.</Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>Programme</Text>
        <View style={[styles.moduleList, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          {mods.map((mod, i) => {
            const done = completedSet.has(i);
            const locked = isLocked(i);
            const accessible = canOpen(i);
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
                  <Text style={styles.moduleTitle} numberOfLines={2}>
                    {mod.title}
                  </Text>
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
        <ModulePlayer
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

      <SubscriptionModal
        visible={subOpen}
        onClose={() => setSubOpen(false)}
        planName="Premium Academia"
        price={9.99}
        period="mois"
        description="Accès complet à tous les cours premium"
        features={[
          "Tous les modules débloqués",
          "Certificats officiels",
          "Contenu hors-ligne",
          "Support prioritaire",
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBackground },
  hero: {
    backgroundColor: colors.green[800],
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
  },
  heroIcon: { fontSize: 40 },
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
  doneTitle: { fontSize: 12, fontWeight: "700", color: colors.green[800] },
  doneSub: { fontSize: 11, color: colors.green[700], marginTop: 2 },
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
  moduleTitle: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
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
  playerRoot: { flex: 1, backgroundColor: colors.white },
  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  playerType: { fontSize: 11, fontWeight: "700", color: colors.gray[400], letterSpacing: 1 },
  playerBody: { padding: SCREEN_HORIZONTAL_PADDING },
  playerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  playerDuration: { fontSize: 12, color: colors.gray[500], marginTop: 4, marginBottom: spacing.lg },
  videoPlaceholder: {
    height: 200,
    backgroundColor: colors.green[800],
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  videoPlaceholderText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  readingContent: { fontSize: 14, color: colors.gray[700], lineHeight: 22 },
  quizBox: {
    alignItems: "center",
    padding: spacing["2xl"],
    backgroundColor: colors.green[50],
    borderRadius: radii.xl,
    gap: spacing.md,
  },
  quizText: { fontSize: 13, color: colors.gray[600], textAlign: "center", lineHeight: 20 },
  playerFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  completeBtn: {
    height: 48,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  completeBtnText: { fontSize: 14, fontWeight: "700", color: colors.white },
  playerLocked: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing["2xl"],
    gap: spacing.md,
  },
  playerLockedTitle: { fontSize: 18, fontWeight: "700", color: colors.gray[900] },
  playerLockedSub: { fontSize: 13, color: colors.gray[500], textAlign: "center" },
  upgradeBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.amber[400],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
  },
  upgradeBtnText: { fontSize: 13, fontWeight: "700", color: colors.amber[900] },
});
