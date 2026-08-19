import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { BourseOpportunity } from "@/hooks/useBourse";
import { useAuth } from "@/hooks/useAuth";
import { isDevMode } from "@/lib/dev";
import {
  createBourseInvestment,
  firebaseErrorMessage,
} from "@/services/actions.service";
import { colors, radii, shadows, spacing } from "@/theme";

const TYPE_ICON: Record<
  BourseOpportunity["type"],
  keyof typeof Ionicons.glyphMap
> = {
  transport: "bus-outline",
  stockage: "archive-outline",
  transformation: "construct-outline",
};

const MIN_AMOUNT = 10_000;
const MAX_AMOUNT = 500_000;
const STEP = 5_000;
const DEFAULT_AMOUNT = 50_000;

function fmtCdf(n: number) {
  return `${n.toLocaleString("fr-FR")} FC`;
}

function clampAmount(n: number) {
  return Math.min(MAX_AMOUNT, Math.max(MIN_AMOUNT, Math.round(n / STEP) * STEP));
}

export function BourseInvestModal({
  visible,
  onClose,
  opportunity,
  walletCdf,
  initialAmount,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  opportunity: BourseOpportunity;
  walletCdf: number;
  initialAmount?: number;
  onSuccess?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { refreshProfile } = useAuth();

  const [step, setStep] = useState<"amount" | "summary" | "success" | "error">("amount");
  const [amount, setAmount] = useState(clampAmount(initialAmount ?? DEFAULT_AMOUNT));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const estimatedReturn = Math.round((amount * opportunity.commission) / 100);
  const total = amount + estimatedReturn;
  const insufficient = amount > walletCdf;

  useEffect(() => {
    if (!visible) return;
    setStep("amount");
    setAmount(clampAmount(initialAmount ?? DEFAULT_AMOUNT));
    setLoading(false);
    setErrorMsg("");
  }, [visible, initialAmount, opportunity.id]);

  const close = () => {
    onClose();
  };

  const adjust = (delta: number) => {
    setAmount((prev) => clampAmount(prev + delta));
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (isDevMode()) {
        await new Promise((r) => setTimeout(r, 800));
      } else {
        await createBourseInvestment({
          opportunityId: opportunity.id,
          amountCdf: amount,
        });
      }
      void qc.invalidateQueries({ queryKey: ["bourse-opportunities"] });
      void qc.invalidateQueries({ queryKey: ["bourse-opportunity", opportunity.id] });
      void qc.invalidateQueries({ queryKey: ["userProfile"] });
      void refreshProfile();
      setStep("success");
      onSuccess?.();
    } catch (err: unknown) {
      setErrorMsg(firebaseErrorMessage(err, "Erreur lors de l'investissement."));
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("amount");
    setErrorMsg("");
    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons name={TYPE_ICON[opportunity.type]} size={20} color={colors.white} />
            </View>
            <Pressable onPress={close} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.white} />
            </Pressable>
          </View>
          <Text style={styles.heroEyebrow}>Investir · Bourse</Text>
          <Text style={styles.heroTitle}>{opportunity.title}</Text>
          <Text style={styles.heroMeta}>
            Comm. +{opportunity.commission}% · {opportunity.duration} · Min 10k FC
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.body}
          style={styles.bodyWrap}
        >
          {step === "amount" ? (
            <View style={styles.step}>
              <View style={styles.balanceRow}>
                <View style={styles.balanceLeft}>
                  <Ionicons name="wallet-outline" size={14} color={colors.gray[500]} />
                  <Text style={styles.balanceLabel}>Solde FC</Text>
                </View>
                <Text
                  style={[
                    styles.balanceValue,
                    insufficient && { color: colors.danger },
                  ]}
                >
                  {fmtCdf(walletCdf)}
                </Text>
              </View>

              <Text style={styles.fieldLabel}>Votre mise (FC)</Text>
              <Text style={styles.amountDisplay}>
                {amount.toLocaleString()}
                <Text style={styles.amountUnit}> FC</Text>
              </Text>

              <View style={styles.stepperRow}>
                <Pressable onPress={() => adjust(-STEP)} style={styles.stepperBtn}>
                  <Ionicons name="remove" size={18} color={colors.amber[700]} />
                </Pressable>
                <View style={styles.stepperTrack}>
                  <View
                    style={[
                      styles.stepperFill,
                      {
                        width: `${((amount - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT)) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Pressable onPress={() => adjust(STEP)} style={styles.stepperBtn}>
                  <Ionicons name="add" size={18} color={colors.amber[700]} />
                </Pressable>
              </View>
              <View style={styles.boundsRow}>
                <Text style={styles.boundText}>10k FC</Text>
                <Text style={styles.boundText}>500k FC</Text>
              </View>

              <View style={styles.estimateCard}>
                <View style={styles.estimateRow}>
                  <View style={styles.balanceLeft}>
                    <Ionicons name="trending-up" size={14} color={colors.amber[700]} />
                    <Text style={styles.estimateLabel}>Commission estimée</Text>
                  </View>
                  <Text style={styles.estimateReturn}>+{fmtCdf(estimatedReturn)}</Text>
                </View>
                <View style={[styles.estimateRow, styles.estimateTotal]}>
                  <Text style={styles.estimateLabelBold}>Total retour</Text>
                  <Text style={styles.estimateTotalValue}>{fmtCdf(total)}</Text>
                </View>
              </View>

              {insufficient ? (
                <Text style={styles.warnText}>
                  Solde FC insuffisant. Rechargez votre wallet via Mobile Money.
                </Text>
              ) : null}

              <Pressable
                onPress={() => setStep("summary")}
                disabled={amount < MIN_AMOUNT || insufficient}
                style={[
                  styles.primaryBtn,
                  (amount < MIN_AMOUNT || insufficient) && styles.btnDisabled,
                ]}
              >
                <Text style={styles.primaryBtnText}>Continuer</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.white} />
              </Pressable>
            </View>
          ) : null}

          {step === "summary" ? (
            <View style={styles.step}>
              <Text style={styles.summaryTitle}>Confirmez votre investissement</Text>
              <View style={styles.summaryCard}>
                {[
                  { label: "Opportunité", value: opportunity.title },
                  { label: "Mise", value: fmtCdf(amount), accent: true },
                  {
                    label: `Commission (+${opportunity.commission}%)`,
                    value: `+${fmtCdf(estimatedReturn)}`,
                    green: true,
                  },
                  { label: "Total retour", value: fmtCdf(total), bold: true },
                  { label: "Durée", value: opportunity.duration },
                ].map((row) => (
                  <View key={row.label} style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{row.label}</Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        row.accent && styles.summaryAccent,
                        row.green && styles.summaryGreen,
                        row.bold && styles.summaryBold,
                      ]}
                    >
                      {row.value}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.hint}>
                Les fonds sont débités de votre wallet FC. La commission est versée à la
                livraison.
              </Text>
              <Pressable
                onPress={() => void handleConfirm()}
                disabled={loading}
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>Confirmer l'investissement</Text>
                )}
              </Pressable>
              <Pressable onPress={() => setStep("amount")}>
                <Text style={styles.linkText}>Modifier le montant</Text>
              </Pressable>
            </View>
          ) : null}

          {step === "success" ? (
            <View style={styles.centered}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={40} color={colors.amber[400]} />
              </View>
              <Text style={styles.successTitle}>Investissement confirmé !</Text>
              <Text style={styles.successAmount}>{fmtCdf(amount)}</Text>
              <Text style={styles.successSub}>investi dans {opportunity.title}</Text>
              <View style={styles.successMeta}>
                <View style={styles.summaryRow}>
                  <Text style={styles.successMetaLabel}>Commission attendue</Text>
                  <Text style={styles.successMetaValue}>+{fmtCdf(estimatedReturn)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.successMetaLabel}>Délai estimé</Text>
                  <Text style={styles.successMetaValue}>{opportunity.duration}</Text>
                </View>
              </View>
              <Pressable onPress={close} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Retour à la Bourse</Text>
              </Pressable>
            </View>
          ) : null}

          {step === "error" ? (
            <View style={styles.centered}>
              <View style={styles.errorIcon}>
                <Ionicons name="alert-circle" size={32} color={colors.danger} />
              </View>
              <Text style={styles.successTitle}>Investissement échoué</Text>
              <Text style={styles.successSub}>{errorMsg}</Text>
              <Pressable onPress={reset} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Réessayer</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radii["3xl"],
    borderTopRightRadius: radii["3xl"],
    maxHeight: "92%",
    ...shadows.elevated,
  },
  hero: {
    backgroundColor: colors.amber[400],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing["2xl"],
    borderTopLeftRadius: radii["3xl"],
    borderTopRightRadius: radii["3xl"],
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(92,70,0,0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.amber[900],
    marginTop: 2,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  heroMeta: {
    fontSize: 11,
    color: "rgba(92,70,0,0.75)",
    marginTop: 6,
    fontWeight: "600",
  },
  bodyWrap: {
    marginTop: -spacing.lg,
    backgroundColor: colors.white,
    borderTopLeftRadius: radii["2xl"],
    borderTopRightRadius: radii["2xl"],
  },
  body: { padding: spacing.xl, gap: spacing.md },
  step: { gap: spacing.md },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  balanceLabel: { fontSize: 13, color: colors.gray[500] },
  balanceValue: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  amountDisplay: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.amber[400],
    textAlign: "center",
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  amountUnit: { fontSize: 13, fontWeight: "600", color: colors.gray[400] },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.amber[50],
    alignItems: "center",
    justifyContent: "center",
  },
  stepperTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[100],
    borderRadius: 3,
    overflow: "hidden",
  },
  stepperFill: { height: "100%", backgroundColor: colors.amber[400] },
  boundsRow: { flexDirection: "row", justifyContent: "space-between" },
  boundText: { fontSize: 10, fontWeight: "700", color: colors.gray[400] },
  estimateCard: {
    backgroundColor: colors.amber[50],
    borderWidth: 1,
    borderColor: colors.amber[100],
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  estimateRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  estimateTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.amber[100],
    paddingTop: spacing.sm,
  },
  estimateLabel: { fontSize: 12, color: colors.gray[500] },
  estimateLabelBold: { fontSize: 12, fontWeight: "600", color: colors.gray[500] },
  estimateReturn: { fontSize: 12, fontWeight: "700", color: colors.amber[700] },
  estimateTotalValue: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  warnText: { fontSize: 12, fontWeight: "600", color: colors.danger },
  primaryBtn: {
    height: 48,
    backgroundColor: colors.amber[400],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: spacing.xs,
  },
  btnDisabled: { opacity: 0.4 },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.amber[900],
    fontFamily: "PlusJakartaSans_700Bold",
  },
  summaryTitle: { fontSize: 13, fontWeight: "700", color: colors.gray[700] },
  summaryCard: {
    backgroundColor: colors.gray[50],
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  summaryLabel: { fontSize: 13, color: colors.gray[500], flexShrink: 0 },
  summaryValue: { fontSize: 13, fontWeight: "600", color: colors.gray[900], textAlign: "right", flex: 1 },
  summaryAccent: { color: colors.amber[700], fontWeight: "800" },
  summaryGreen: { color: colors.green[700], fontWeight: "700" },
  summaryBold: {
    fontWeight: "800",
    fontSize: 15,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  hint: { fontSize: 11, color: colors.gray[400], lineHeight: 16 },
  linkText: {
    textAlign: "center",
    fontSize: 12,
    color: colors.gray[400],
    paddingVertical: spacing.sm,
  },
  centered: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    backgroundColor: colors.amber[50],
    alignItems: "center",
    justifyContent: "center",
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.xl,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.gray[900],
    textAlign: "center",
    fontFamily: "PlusJakartaSans_700Bold",
  },
  successAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.amber[400],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  successSub: { fontSize: 13, color: colors.gray[500], textAlign: "center" },
  successMeta: {
    width: "100%",
    backgroundColor: colors.amber[50],
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  successMetaLabel: { fontSize: 12, color: colors.amber[900] },
  successMetaValue: { fontSize: 12, fontWeight: "700", color: colors.amber[900] },
});
