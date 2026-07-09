import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { farmers, type Farmer } from "@/data/mock";
import { colors, radii, shadows, spacing } from "@/theme";

export function MerchantFinancementContent({ bottomInset }: { bottomInset: number }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [preAchat, setPreAchat] = useState<Farmer | null>(null);

  const filtered = useMemo(
    () =>
      farmers.filter(
        (f) =>
          !q ||
          f.name.toLowerCase().includes(q.toLowerCase()) ||
          f.crops.some((c) => c.toLowerCase().includes(q.toLowerCase()))
      ),
    [q]
  );

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(bottomInset, 16) + spacing.lg }}
      >
        <View style={[styles.hero, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          <Text style={styles.heroLabel}>PRÉ-ACHATS EN COURS</Text>
          <Text style={styles.heroValue}>$24,820</Text>
          <Text style={styles.heroSub}>18 agriculteurs · 96% livraison ponctuelle</Text>
        </View>

        <View style={[styles.searchWrap, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          <Ionicons name="search-outline" size={16} color={colors.gray[400]} style={styles.searchIcon} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Rechercher agriculteur ou culture..."
            placeholderTextColor={colors.gray[400]}
            style={styles.searchInput}
          />
        </View>

        <Text style={styles.sectionLabel}>Agriculteurs disponibles</Text>
        <View style={[styles.list, { marginHorizontal: SCREEN_HORIZONTAL_PADDING }]}>
          {filtered.map((f) => (
            <View key={f.id} style={styles.card}>
              <Pressable onPress={() => router.push(`/financement/${f.id}` as never)} style={styles.cardTop}>
                <View style={styles.avatar}>
                  {f.image ? (
                    <Image source={{ uri: f.image }} style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.avatarEmoji}>{f.avatar}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{f.name}</Text>
                  <Text style={styles.meta}>{f.location}</Text>
                  <Text style={styles.crops}>{f.crops.join(", ")}</Text>
                </View>
                <View style={styles.surfaceCol}>
                  <Text style={styles.surfaceValue}>{f.surface} ha</Text>
                  <Text style={styles.surfaceLabel}>Surface</Text>
                </View>
              </Pressable>
              <Pressable onPress={() => setPreAchat(f)} style={styles.preBtn}>
                <Ionicons name="hand-left-outline" size={14} color={colors.white} />
                <Text style={styles.preBtnText}>Pré-acheter</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <PreAchatModal farmer={preAchat} onClose={() => setPreAchat(null)} />
    </>
  );
}

function PreAchatModal({ farmer, onClose }: { farmer: Farmer | null; onClose: () => void }) {
  if (!farmer) return null;

  return (
    <Modal visible={!!farmer} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.modalSheet}>
        <Text style={styles.modalTitle}>Pré-achat</Text>
        <Text style={styles.modalSub}>{farmer.name}</Text>
        <Text style={styles.modalCrops}>{farmer.crops.join(" · ")}</Text>
        <Text style={styles.modalHint}>
          Proposez un montant d'avance contre récolte garantie. Un agent validera la demande.
        </Text>
        <Pressable
          onPress={() => {
            Alert.alert("Mombongo", "Pré-achat enregistré (mock)");
            onClose();
          }}
          style={styles.modalConfirm}
        >
          <Text style={styles.modalConfirmText}>Confirmer le pré-achat</Text>
        </Pressable>
        <Pressable onPress={onClose}>
          <Text style={styles.modalCancel}>Annuler</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: spacing.md,
    backgroundColor: colors.purple[700],
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.elevated,
  },
  heroLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.6)", letterSpacing: 1 },
  heroValue: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.white,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  heroSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  searchWrap: { marginTop: spacing.md, position: "relative" },
  searchIcon: { position: "absolute", left: 14, top: 13, zIndex: 1 },
  searchInput: {
    height: 44,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    paddingLeft: 40,
    fontSize: 13,
    color: colors.gray[900],
  },
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
  list: { gap: spacing.sm },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  cardTop: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.purple[100],
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarEmoji: { fontSize: 22 },
  name: { fontSize: 14, fontWeight: "700", color: colors.gray[900] },
  meta: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  crops: { fontSize: 10, color: colors.gray[400], marginTop: 2 },
  surfaceCol: { alignItems: "flex-end" },
  surfaceValue: { fontSize: 14, fontWeight: "800", color: colors.gray[900] },
  surfaceLabel: { fontSize: 10, color: colors.gray[400] },
  preBtn: {
    marginTop: spacing.md,
    height: 40,
    backgroundColor: colors.purple[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  preBtnText: { fontSize: 12, fontWeight: "700", color: colors.white },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radii["3xl"],
    borderTopRightRadius: radii["3xl"],
    padding: spacing.xl,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.gray[900] },
  modalSub: { fontSize: 14, fontWeight: "600", color: colors.purple[700], marginTop: 4 },
  modalCrops: { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  modalHint: { fontSize: 12, color: colors.gray[500], marginTop: spacing.lg, lineHeight: 18 },
  modalConfirm: {
    marginTop: spacing.lg,
    height: 48,
    backgroundColor: colors.purple[700],
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: { fontSize: 14, fontWeight: "700", color: colors.white },
  modalCancel: { textAlign: "center", marginTop: spacing.md, fontSize: 12, color: colors.gray[400] },
});
