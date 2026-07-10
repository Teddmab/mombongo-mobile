import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { CourseModule } from "@/hooks/useLocalData";
import { colors, radii, spacing } from "@/theme";

function typeBadgeStyle(type: CourseModule["type"]) {
  if (type === "video") return { bg: "#EFF6FF", text: "#1D4ED8" };
  if (type === "reading") return { bg: "#F5F3FF", text: "#6D28D9" };
  return { bg: colors.amber[50], text: colors.amber[700] };
}

function UpgradeContent({ onUpgrade, onClose }: { onUpgrade: () => void; onClose: () => void }) {
  return (
    <View style={styles.upgrade}>
      <Ionicons name="lock-closed" size={40} color={colors.amber[500]} />
      <Text style={styles.upgradeTitle}>Contenu Premium</Text>
      <Text style={styles.upgradeSub}>
        Débloquez ce module et tout le catalogue avec un abonnement Premium ou Coopérative.
      </Text>
      <Pressable onPress={onUpgrade} style={styles.upgradeBtn}>
        <Ionicons name="sparkles" size={16} color={colors.amber[900]} />
        <Text style={styles.upgradeBtnText}>Mettre à niveau</Text>
      </Pressable>
      <Pressable onPress={onClose}>
        <Text style={styles.upgradeLater}>Plus tard</Text>
      </Pressable>
    </View>
  );
}

function VideoContent({ mod, onComplete }: { mod: CourseModule; onComplete: () => void }) {
  const [played, setPlayed] = useState(false);
  const [pct, setPct] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const play = () => {
    setPlayed(true);
    let current = 0;
    timer.current = setInterval(() => {
      current += Math.random() * 3 + 1;
      if (current >= 100) {
        current = 100;
        if (timer.current) clearInterval(timer.current);
      }
      setPct(Math.min(current, 100));
    }, 200);
  };

  return (
    <View>
      <Pressable onPress={!played ? play : undefined} style={styles.videoBox}>
        <View style={styles.videoGradient} />
        {!played ? (
          <View style={styles.playBtn}>
            <Ionicons name="play" size={28} color={colors.amber[900]} />
          </View>
        ) : (
          <Text style={styles.playingText}>Lecture en cours…</Text>
        )}
        <View style={styles.videoBar}>
          <View style={styles.videoTrack}>
            <View style={[styles.videoFill, { width: `${pct}%` }]} />
          </View>
          <View style={styles.videoMeta}>
            <Text style={styles.videoMetaText}>{mod.duration}</Text>
            <Text style={styles.videoMetaText}>{Math.round(pct)}%</Text>
          </View>
        </View>
      </Pressable>
      <Text style={styles.hint}>
        {played
          ? "Visionnez le module en entier, puis marquez-le comme terminé."
          : "Appuyez sur lecture pour démarrer ce module vidéo."}
      </Text>
      <Pressable
        disabled={!played}
        onPress={onComplete}
        style={[styles.completeBtn, !played && styles.completeBtnDisabled]}
      >
        <Ionicons name="checkmark-circle-outline" size={18} color={played ? colors.white : colors.gray[400]} />
        <Text style={[styles.completeBtnText, !played && styles.completeBtnTextDisabled]}>
          Marquer comme terminé
        </Text>
      </Pressable>
    </View>
  );
}

function ReadingContent({ mod, onComplete }: { mod: CourseModule; onComplete: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const paragraphs = (mod.content || "Contenu de la leçon.").split("\n\n");

  return (
    <View>
      <View style={styles.readingHeader}>
        <View style={styles.readingIcon}>
          <Ionicons name="document-text-outline" size={20} color="#6D28D9" />
        </View>
        <View>
          <Text style={styles.readingTitle}>Lecture · {mod.duration}</Text>
          <Text style={styles.readingSub}>Faites défiler pour lire l'intégralité</Text>
        </View>
      </View>
      <ScrollView
        style={styles.readingScroll}
        onScroll={(e) => {
          if (e.nativeEvent.contentOffset.y > 50) setScrolled(true);
        }}
        scrollEventThrottle={16}
      >
        {paragraphs.map((p, i) => (
          <Text key={i} style={styles.readingPara}>
            {p}
          </Text>
        ))}
      </ScrollView>
      <Pressable
        disabled={!scrolled}
        onPress={onComplete}
        style={[styles.completeBtn, !scrolled && styles.completeBtnDisabled]}
      >
        <Ionicons name="checkmark-circle-outline" size={18} color={scrolled ? colors.white : colors.gray[400]} />
        <Text style={[styles.completeBtnText, !scrolled && styles.completeBtnTextDisabled]}>
          J'ai lu ce module
        </Text>
      </Pressable>
    </View>
  );
}

function QuizContent({ mod, onComplete }: { mod: CourseModule; onComplete: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const questions = mod.quiz ?? [];
  const allAnswered = questions.every((_, i) => answers[i] !== undefined);
  const score = submitted ? questions.filter((q, i) => answers[i] === q.correct).length : 0;
  const passed = score >= Math.ceil(questions.length / 2);

  if (questions.length === 0) {
    return (
      <View style={styles.quizEmpty}>
        <Ionicons name="help-circle-outline" size={32} color={colors.green[700]} />
        <Text style={styles.quizEmptyText}>Quiz interactif — répondez aux questions pour valider le module.</Text>
        <Pressable onPress={onComplete} style={styles.completeBtn}>
          <Text style={styles.completeBtnText}>Marquer comme terminé</Text>
        </Pressable>
      </View>
    );
  }

  if (submitted) {
    return (
      <View>
        <View style={styles.quizResult}>
          <View style={[styles.quizResultIcon, passed ? styles.quizPass : styles.quizFail]}>
            <Ionicons
              name={passed ? "trophy" : "close-circle"}
              size={36}
              color={passed ? colors.green[700] : colors.danger}
            />
          </View>
          <Text style={styles.quizScore}>
            {score}/{questions.length}
          </Text>
          <Text style={[styles.quizResultText, passed ? styles.quizPassText : styles.quizFailText]}>
            {passed ? "Bravo, vous avez réussi !" : "Essayez à nouveau"}
          </Text>
        </View>
        {questions.map((q, qi) => (
          <View
            key={qi}
            style={[
              styles.quizReview,
              answers[qi] === q.correct ? styles.quizReviewOk : styles.quizReviewKo,
            ]}
          >
            <Text style={styles.quizQ}>
              {qi + 1}. {q.question}
            </Text>
            <Text
              style={[
                styles.quizA,
                answers[qi] === q.correct ? styles.quizAOk : styles.quizAKo,
              ]}
            >
              {answers[qi] === q.correct ? "✓" : "✗"} {q.options[answers[qi] ?? 0]}
              {answers[qi] !== q.correct ? ` → ${q.options[q.correct]}` : ""}
            </Text>
          </View>
        ))}
        <Pressable
          onPress={passed ? onComplete : () => { setAnswers({}); setSubmitted(false); }}
          style={styles.completeBtn}
        >
          <Text style={styles.completeBtnText}>{passed ? "Continuer" : "Réessayer"}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.readingHeader}>
        <View style={[styles.readingIcon, { backgroundColor: colors.amber[50] }]}>
          <Ionicons name="school-outline" size={20} color={colors.amber[700]} />
        </View>
        <View>
          <Text style={styles.readingTitle}>
            Quiz · {questions.length} question{questions.length > 1 ? "s" : ""}
          </Text>
          <Text style={styles.readingSub}>{mod.duration}</Text>
        </View>
      </View>
      {questions.map((q, qi) => (
        <View key={qi} style={styles.quizBlock}>
          <Text style={styles.quizQ}>
            {qi + 1}. {q.question}
          </Text>
          {q.options.map((opt, oi) => (
            <Pressable
              key={oi}
              onPress={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
              style={[styles.quizOpt, answers[qi] === oi && styles.quizOptSelected]}
            >
              <Text style={[styles.quizOptText, answers[qi] === oi && styles.quizOptTextSelected]}>
                {opt}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
      <Pressable
        disabled={!allAnswered}
        onPress={() => setSubmitted(true)}
        style={[styles.completeBtn, !allAnswered && styles.completeBtnDisabled]}
      >
        <Text style={[styles.completeBtnText, !allAnswered && styles.completeBtnTextDisabled]}>
          Soumettre le quiz
        </Text>
      </Pressable>
    </View>
  );
}

export function ModulePlayerModal({
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
  const badge = typeBadgeStyle(mod.type);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerBody}>
              <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.typeBadgeText, { color: badge.text }]}>{mod.type}</Text>
              </View>
              <Text style={styles.modTitle}>{mod.title}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={colors.gray[600]} />
            </Pressable>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
          >
            {locked ? (
              <UpgradeContent onUpgrade={onUpgrade} onClose={onClose} />
            ) : mod.type === "video" ? (
              <VideoContent mod={mod} onComplete={onComplete} />
            ) : mod.type === "reading" ? (
              <ReadingContent mod={mod} onComplete={onComplete} />
            ) : (
              <QuizContent mod={mod} onComplete={onComplete} />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheetWrap: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii["3xl"],
    borderTopRightRadius: radii["3xl"],
    maxHeight: "92%",
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[200],
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerBody: { flex: 1, paddingRight: spacing.md },
  typeBadge: {
    alignSelf: "flex-start",
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  typeBadgeText: { fontSize: 9, fontWeight: "800", textTransform: "uppercase" },
  modTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.gray[900],
    marginTop: 6,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing["2xl"] },
  upgrade: { alignItems: "center", paddingVertical: spacing.xl, gap: spacing.md },
  upgradeTitle: { fontSize: 18, fontWeight: "800", color: colors.gray[900] },
  upgradeSub: { fontSize: 13, color: colors.gray[500], textAlign: "center", lineHeight: 20 },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.amber[400],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    marginTop: spacing.sm,
  },
  upgradeBtnText: { fontSize: 14, fontWeight: "800", color: colors.amber[900] },
  upgradeLater: { fontSize: 12, color: colors.gray[400], marginTop: spacing.sm },
  videoBox: {
    aspectRatio: 16 / 9,
    borderRadius: radii.xl,
    backgroundColor: colors.green[900],
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  videoGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.green[800],
    opacity: 0.6,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.amber[400],
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  playingText: { color: colors.white, fontWeight: "700", fontSize: 14, zIndex: 1 },
  videoBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xl,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  videoTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  videoFill: { height: "100%", backgroundColor: colors.amber[400] },
  videoMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  videoMetaText: { fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: "600" },
  hint: { fontSize: 13, color: colors.gray[500], marginTop: spacing.md, lineHeight: 20 },
  completeBtn: {
    marginTop: spacing.lg,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.green[700],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  completeBtnDisabled: { backgroundColor: colors.gray[100] },
  completeBtnText: { fontSize: 14, fontWeight: "800", color: colors.white },
  completeBtnTextDisabled: { color: colors.gray[400] },
  readingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    marginBottom: spacing.md,
  },
  readingIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  readingTitle: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  readingSub: { fontSize: 11, color: colors.gray[400], marginTop: 2 },
  readingScroll: { maxHeight: 220 },
  readingPara: { fontSize: 13, color: colors.gray[700], lineHeight: 22, marginBottom: spacing.md },
  quizEmpty: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.lg },
  quizEmptyText: { fontSize: 13, color: colors.gray[600], textAlign: "center" },
  quizBlock: { marginBottom: spacing.lg },
  quizQ: { fontSize: 13, fontWeight: "700", color: colors.gray[900], marginBottom: spacing.sm },
  quizOpt: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: 8,
  },
  quizOptSelected: { borderColor: colors.green[700], backgroundColor: colors.green[50] },
  quizOptText: { fontSize: 12, color: colors.gray[700] },
  quizOptTextSelected: { color: colors.green[800], fontWeight: "700" },
  quizResult: { alignItems: "center", paddingVertical: spacing.md },
  quizResultIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  quizPass: { backgroundColor: colors.green[50] },
  quizFail: { backgroundColor: "#FEE2E2" },
  quizScore: { fontSize: 28, fontWeight: "800", marginTop: spacing.md, color: colors.gray[900] },
  quizResultText: { fontSize: 14, fontWeight: "700", marginTop: 4 },
  quizPassText: { color: colors.green[700] },
  quizFailText: { color: colors.danger },
  quizReview: { borderRadius: radii.lg, padding: spacing.md, marginBottom: 8, borderWidth: 1 },
  quizReviewOk: { backgroundColor: colors.green[50], borderColor: colors.green[200] },
  quizReviewKo: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  quizA: { fontSize: 11, marginTop: 4, fontWeight: "600" },
  quizAOk: { color: colors.green[700] },
  quizAKo: { color: colors.danger },
});
