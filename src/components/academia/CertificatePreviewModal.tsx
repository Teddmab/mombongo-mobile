import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import type { Course } from "@/hooks/useLocalData";
import { colors, radii, spacing } from "@/theme";

const CERT_DATE: Record<string, string> = {
  c4: "12 mai 2026",
};

export function CertificatePreviewModal({
  course,
  visible,
  onClose,
}: {
  course: Course;
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { user, userProfile } = useAuth();
  const displayName = user?.displayName || userProfile?.displayName || "Étudiant Mombongo";
  const date = CERT_DATE[course.id] ?? "2026";

  const download = () => {
    Alert.alert("Mombongo", `Certificat « ${course.title} » téléchargé (mock).`);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.wrap, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.card}>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Ionicons name="close" size={16} color={colors.white} />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.header}>
              <Text style={styles.brand}>MOMBONGO</Text>
              <Text style={styles.brandSub}>Mombongo Coopérative Agricole</Text>
            </View>

            <View style={styles.doc}>
              <Ionicons name="star" size={12} color="rgba(251,191,36,0.4)" style={styles.starTL} />
              <Ionicons name="star" size={12} color="rgba(251,191,36,0.4)" style={styles.starTR} />
              <Ionicons name="star" size={12} color="rgba(251,191,36,0.4)" style={styles.starBL} />
              <Ionicons name="star" size={12} color="rgba(251,191,36,0.4)" style={styles.starBR} />

              <Text style={styles.certLabel}>Certificat de Complétion</Text>
              <View style={styles.iconWrap}>
                {course.image ? (
                  <Image source={{ uri: course.image }} style={styles.iconImg} resizeMode="cover" />
                ) : (
                  <Text style={styles.iconEmoji}>{course.icon}</Text>
                )}
              </View>
              <Text style={styles.awardedTo}>Décerné à</Text>
              <Text style={styles.name}>{displayName}</Text>
              <View style={styles.divider} />
              <Text style={styles.forText}>Pour avoir complété avec succès</Text>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseMeta}>
                {course.category} · {course.duration} · {course.modules} modules
              </Text>
              <View style={styles.dateRow}>
                <View style={styles.awardIcon}>
                  <Ionicons name="ribbon" size={20} color={colors.amber[400]} />
                </View>
                <View>
                  <Text style={styles.dateLabel}>Date d'obtention</Text>
                  <Text style={styles.dateValue}>{date}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <Text style={styles.footer}>Mombongo · Plateforme Agricole RDC</Text>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.closeAction}>
              <Text style={styles.closeActionText}>Fermer</Text>
            </Pressable>
            <Pressable onPress={download} style={styles.downloadAction}>
              <Ionicons name="download-outline" size={16} color={colors.white} />
              <Text style={styles.downloadActionText}>Télécharger PDF</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  wrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii["2xl"],
    maxHeight: "90%",
    overflow: "hidden",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { paddingBottom: spacing.md },
  header: {
    backgroundColor: colors.green[800],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
  brand: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 2,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  brandSub: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 4,
  },
  doc: {
    marginHorizontal: spacing.lg,
    marginTop: -4,
    marginBottom: spacing.lg,
    borderWidth: 6,
    borderColor: "rgba(251,191,36,0.3)",
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  starTL: { position: "absolute", top: 8, left: 8 },
  starTR: { position: "absolute", top: 8, right: 8 },
  starBL: { position: "absolute", bottom: 8, left: 8 },
  starBR: { position: "absolute", bottom: 8, right: 8 },
  certLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.amber[50],
    borderWidth: 4,
    borderColor: colors.amber[100],
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  iconImg: { width: "100%", height: "100%" },
  iconEmoji: { fontSize: 28 },
  awardedTo: { fontSize: 11, color: colors.gray[400] },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.green[800],
    textAlign: "center",
    marginTop: 4,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(251,191,36,0.4)",
    marginVertical: spacing.md,
  },
  forText: { fontSize: 11, color: colors.gray[500] },
  courseTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.gray[900],
    textAlign: "center",
    marginTop: 4,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  courseMeta: { fontSize: 11, color: colors.gray[400], marginTop: 4, textAlign: "center" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm },
  awardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.green[700],
    alignItems: "center",
    justifyContent: "center",
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dateValue: { fontSize: 12, fontWeight: "700", color: colors.gray[900] },
  footer: {
    fontSize: 9,
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  closeAction: {
    flex: 1,
    height: 40,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: "center",
    justifyContent: "center",
  },
  closeActionText: { fontSize: 12, fontWeight: "700", color: colors.gray[600] },
  downloadAction: {
    flex: 1,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.green[700],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  downloadActionText: { fontSize: 12, fontWeight: "700", color: colors.white },
});
