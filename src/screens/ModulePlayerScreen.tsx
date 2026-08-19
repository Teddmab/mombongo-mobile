import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { StackHeader } from "@/components/shell/StackHeader";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import {
  useCourse,
  useCourseModules,
  useMarkModuleComplete,
  useMyEnrollment,
  type AcademiaModule,
} from "@/hooks/useAcademia";
import { firebaseErrorMessage } from "@/services/actions.service";
import { colors, radii, shadows, spacing } from "@/theme";

function typeLabel(type: AcademiaModule["type"], minutes: number, t: (k: string) => string) {
  if (type === "video") return `Vidéo · ${minutes} min`;
  if (type === "pdf") return `PDF · ${minutes} min`;
  return `Quiz · ${minutes} min`;
}

export function ModulePlayerScreen({
  courseId,
  moduleId,
}: {
  courseId?: string;
  moduleId?: string;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { data: course } = useCourse(courseId);
  const { data: modules = [], isLoading } = useCourseModules(courseId);
  const { data: enrollment } = useMyEnrollment(courseId);
  const markComplete = useMarkModuleComplete();

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [videoOpened, setVideoOpened] = useState(false);
  const [pdfOpened, setPdfOpened] = useState(false);

  const module = modules.find((m) => m.id === moduleId);
  const currentIndex = modules.findIndex((m) => m.id === moduleId);
  const prevModule = currentIndex > 0 ? modules[currentIndex - 1] : null;
  const nextModule = currentIndex >= 0 && currentIndex < modules.length - 1 ? modules[currentIndex + 1] : null;
  const isCompleted = enrollment?.completedModules.includes(moduleId ?? "") ?? false;
  const canAccess = !!module && (module.isFree || !!enrollment);

  const goModule = (id: string) => {
    router.replace(`/academia/${courseId}/module/${id}` as never);
  };

  const handleMarkComplete = async () => {
    if (!courseId || !moduleId) return;
    if (!enrollment) {
      Alert.alert("Mombongo", t("academia.locked"));
      return;
    }
    try {
      const result = await markComplete.mutateAsync({ courseId, moduleId });
      if (result.isCompleted) {
        router.replace(`/academia/${courseId}/complete` as never);
      } else if (nextModule) {
        goModule(nextModule.id);
      } else {
        Alert.alert("Mombongo", t("academia.completed"));
        router.back();
      }
    } catch (err) {
      Alert.alert("Mombongo", firebaseErrorMessage(err, "Impossible de marquer le module."));
    }
  };

  const openYoutube = async () => {
    if (!module?.youtubeVideoId) return;
    setVideoOpened(true);
    await WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${module.youtubeVideoId}`);
  };

  const openPdf = async () => {
    if (!module?.pdfUrl) {
      Alert.alert("Mombongo", "PDF non disponible pour l'instant");
      return;
    }
    setPdfOpened(true);
    const can = await Linking.canOpenURL(module.pdfUrl);
    if (can) await Linking.openURL(module.pdfUrl);
    else await WebBrowser.openBrowserAsync(module.pdfUrl);
  };

  if (isLoading) {
    return (
      <View style={styles.root} testID="module-player-screen">
        <StackHeader title="Academia" />
        <ActivityIndicator color={colors.green[700]} style={{ marginTop: spacing.xl }} />
      </View>
    );
  }

  if (!module || !canAccess) {
    return (
      <View style={styles.root} testID="module-player-screen">
        <StackHeader title="Academia" />
        <View style={styles.missing}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.gray[400]} />
          <Text style={styles.missingText}>
            {!module ? "Module introuvable" : t("academia.locked")}
          </Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← {t("academia.backToCourses")}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const questions = module.questions ?? [];
  const allAnswered = questions.every((_, i) => quizAnswers[i] !== undefined);
  const score = quizSubmitted
    ? questions.filter((q, i) => quizAnswers[i] === q.answer).length
    : 0;

  return (
    <View style={styles.root} testID="module-player-screen">
      <StackHeader title={course?.title ?? "Academia"} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 24 },
        ]}
      >
        <Text style={styles.typeMeta}>{typeLabel(module.type, module.durationMinutes, t)}</Text>
        <Text style={styles.title}>{module.title}</Text>
        <Text style={styles.sub}>
          Module {currentIndex + 1} / {modules.length}
        </Text>

        {module.type === "video" ? (
          <View style={styles.mediaCard}>
            <Pressable onPress={openYoutube} style={styles.videoBox} testID="youtube-player">
              <Ionicons name="logo-youtube" size={48} color="#FF0000" />
              <Text style={styles.videoHint}>
                {module.youtubeVideoId
                  ? "Ouvrir la vidéo YouTube"
                  : "Vidéo non disponible"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {module.type === "pdf" ? (
          <View style={styles.mediaCard}>
            <View style={styles.pdfBox} testID="pdf-viewer">
              <Ionicons name="document-text-outline" size={40} color="#1D4ED8" />
              <Text style={styles.pdfTitle}>{module.title}</Text>
              <Pressable onPress={openPdf} style={styles.pdfBtn}>
                <Ionicons name="download-outline" size={16} color={colors.white} />
                <Text style={styles.pdfBtnText}>{t("academia.downloadPdf")}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {module.type === "quiz" ? (
          <View style={styles.quizWrap}>
            {questions.map((q, qi) => (
              <View key={qi} style={styles.quizCard}>
                <Text style={styles.quizQ}>{q.q}</Text>
                {q.options.map((opt, oi) => {
                  const selected = quizAnswers[qi] === oi;
                  const correct = oi === q.answer;
                  let border: string = colors.gray[200];
                  let bg: string = colors.white;
                  let textColor: string = colors.gray[900];
                  if (quizSubmitted) {
                    if (correct) {
                      border = colors.green[700];
                      bg = colors.green[50];
                      textColor = colors.green[800];
                    } else if (selected) {
                      border = colors.danger;
                      bg = "#FEF2F2";
                      textColor = colors.danger;
                    } else {
                      bg = colors.gray[50];
                      textColor = colors.gray[500];
                    }
                  } else if (selected) {
                    border = colors.green[700];
                    bg = colors.green[50];
                    textColor = colors.green[800];
                  }
                  return (
                    <Pressable
                      key={oi}
                      testID={`quiz-option-${qi}-${oi}`}
                      disabled={quizSubmitted}
                      onPress={() => setQuizAnswers((prev) => ({ ...prev, [qi]: oi }))}
                      style={[styles.quizOpt, { borderColor: border, backgroundColor: bg }]}
                    >
                      <Text style={[styles.quizOptText, { color: textColor }]}>{opt}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}

            {!quizSubmitted ? (
              <Pressable
                testID="quiz-submit-btn"
                disabled={!allAnswered || markComplete.isPending}
                onPress={() => {
                  setQuizSubmitted(true);
                  void handleMarkComplete();
                }}
                style={[styles.primaryBtn, !allAnswered && styles.btnDisabled]}
              >
                <Text style={styles.primaryBtnText}>{t("academia.submitQuiz")}</Text>
              </Pressable>
            ) : (
              <View style={styles.quizResult} testID="quiz-result">
                <Text style={styles.quizResultText}>
                  {t("academia.quizScore", { score, total: questions.length })}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {!isCompleted && module.type !== "quiz" ? (
          <Pressable
            testID="mark-complete-btn"
            onPress={() => void handleMarkComplete()}
            disabled={
              markComplete.isPending ||
              (module.type === "video" && !!module.youtubeVideoId && !videoOpened) ||
              (module.type === "pdf" && !!module.pdfUrl && !pdfOpened)
            }
            style={[
              styles.primaryBtn,
              (markComplete.isPending ||
                (module.type === "video" && !!module.youtubeVideoId && !videoOpened) ||
                (module.type === "pdf" && !!module.pdfUrl && !pdfOpened)) &&
                styles.btnDisabled,
            ]}
          >
            {markComplete.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>{t("academia.markComplete")}</Text>
            )}
          </Pressable>
        ) : null}

        {isCompleted ? (
          <View style={styles.doneBadge} testID="module-complete-badge">
            <Ionicons name="checkmark-circle" size={20} color={colors.green[700]} />
            <Text style={styles.doneText}>{t("academia.completed")}</Text>
          </View>
        ) : null}

        <View style={styles.navRow}>
          {prevModule ? (
            <Pressable onPress={() => goModule(prevModule.id)} style={styles.navPrev}>
              <Ionicons name="chevron-back" size={16} color={colors.gray[700]} />
              <Text style={styles.navPrevText}>{t("academia.prev")}</Text>
            </Pressable>
          ) : (
            <View />
          )}
          {nextModule ? (
            <Pressable onPress={() => goModule(nextModule.id)} style={styles.navNext}>
              <Text style={styles.navNextText}>{t("academia.next")}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.white} />
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBackground },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  missingText: { fontSize: 14, fontWeight: "700", color: colors.gray[500], textAlign: "center" },
  backLink: { marginTop: spacing.sm },
  backLinkText: { fontSize: 13, fontWeight: "700", color: colors.green[700] },
  typeMeta: { fontSize: 11, color: colors.gray[500], fontWeight: "600" },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
    lineHeight: 28,
  },
  sub: { fontSize: 13, color: colors.gray[500], marginTop: -4 },
  mediaCard: { marginTop: spacing.sm },
  videoBox: {
    aspectRatio: 16 / 9,
    backgroundColor: "#111",
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  videoHint: { color: colors.white, fontSize: 13, fontWeight: "600" },
  pdfBox: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  pdfTitle: { fontSize: 14, fontWeight: "700", color: colors.gray[800], textAlign: "center" },
  pdfBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  pdfBtnText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  quizWrap: { gap: spacing.md },
  quizCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  quizQ: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: spacing.md,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  quizOpt: {
    borderWidth: 2,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: 8,
  },
  quizOptText: { fontSize: 13, fontWeight: "600" },
  quizResult: {
    backgroundColor: colors.green[50],
    borderWidth: 1,
    borderColor: colors.green[100],
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: "center",
  },
  quizResultText: { fontSize: 16, fontWeight: "800", color: colors.green[800] },
  primaryBtn: {
    height: 48,
    backgroundColor: colors.green[700],
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.elevated,
  },
  primaryBtnText: { color: colors.white, fontWeight: "700", fontSize: 14 },
  btnDisabled: { opacity: 0.5 },
  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: spacing.md,
  },
  doneText: { fontSize: 14, fontWeight: "700", color: colors.green[700] },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  navPrev: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.gray[100],
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  navPrevText: { fontSize: 13, fontWeight: "700", color: colors.gray[700] },
  navNext: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  navNextText: { fontSize: 13, fontWeight: "700", color: colors.white },
});
