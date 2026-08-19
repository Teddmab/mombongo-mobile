import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useCreateFinancingApplication } from "@/hooks/useFinancing";
import type { Farmer } from "@/hooks/useFinancing";
import { isDevMode } from "@/lib/dev";
import { formatUsd } from "@/lib/utils";
import { firebaseErrorMessage } from "@/services/actions.service";
import { colors, radii, shadows, spacing } from "@/theme";

type Step = "amount" | "confirm" | "success" | "error";

interface FundModalProps {
  visible: boolean;
  onClose: () => void;
  farmer: Farmer;
  onSuccess?: () => void;
}

export function FundModal({ visible, onClose, farmer, onSuccess }: FundModalProps) {
  const insets = useSafeAreaInsets();
  const { userProfile, refreshProfile } = useAuth();
  const { mutateAsync, isPending } = useCreateFinancingApplication();

  const remaining = Math.max(0, farmer.needed - farmer.raised);
  const walletUsd = userProfile?.walletUsd ?? 0;
  const maxAmount = Math.max(50, Math.min(remaining || 50, walletUsd || 50));

  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState(50);
  const [amountText, setAmountText] = useState("50");
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    const initial = Math.min(50, remaining || 50);
    setStep("amount");
    setAmount(initial);
    setAmountText(String(initial));
    setErrorMsg("");
  };

  useEffect(() => {
    if (!visible) return;
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on open only
  }, [visible, farmer.id]);

  const canContinue = useMemo(
    () => amount >= 50 && amount <= walletUsd && amount <= remaining,
    [amount, walletUsd, remaining],
  );

  const handleClose = () => {
    if (step === "success") onSuccess?.();
    reset();
    onClose();
  };

  const applyAmount = (n: number) => {
    const clamped = Math.max(50, Math.min(n, maxAmount));
    setAmount(clamped);
    setAmountText(String(clamped));
  };

  const submit = async () => {
    try {
      if (isDevMode()) {
        await new Promise((r) => setTimeout(r, 800));
      } else {
        await mutateAsync({ farmerId: farmer.id, amountUsd: amount });
        await refreshProfile();
      }
      setStep("success");
      onSuccess?.();
    } catch (err: unknown) {
      setErrorMsg(firebaseErrorMessage(err, "Impossible de finaliser le financement."));
      setStep("error");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={step === "confirm" && isPending ? undefined : handleClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerEyebrow}>Financer</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {farmer.name}
            </Text>
          </View>
          <Pressable onPress={handleClose} hitSlop={8} style={styles.closeBtn}>
            <Ionicons name="close" size={18} color={colors.gray[600]} />
          </Pressable>
        </View>

        <View style={styles.body}>
          {step === "amount" ? (
            <>
              <View style={styles.rowBetween}>
                <Text style={styles.muted}>Solde wallet</Text>
                <Text style={styles.walletValue}>{formatUsd(walletUsd)}</Text>
              </View>

              <Text style={styles.fieldLabel}>Montant (USD)</Text>
              <TextInput
                testID="farmer-fund-amount-input"
                value={amountText}
                onChangeText={(v) => {
                  const digits = v.replace(/[^\d]/g, "");
                  setAmountText(digits);
                  const n = Number(digits) || 0;
                  if (n > 0) setAmount(n);
                }}
                onBlur={() => applyAmount(amount)}
                keyboardType="number-pad"
                style={styles.amountInput}
              />
              <Text style={styles.hint}>
                Minimum $50 · Restant : {formatUsd(remaining)}
              </Text>

              <View style={styles.quickRow}>
                {[50, 100, 250, 500]
                  .filter((v) => v <= Math.max(remaining, 50))
                  .map((v) => (
                    <Pressable
                      key={v}
                      onPress={() => applyAmount(v)}
                      style={[styles.quickChip, amount === v && styles.quickChipActive]}
                    >
                      <Text style={[styles.quickChipText, amount === v && styles.quickChipTextActive]}>
                        ${v}
                      </Text>
                    </Pressable>
                  ))}
              </View>

              <View style={styles.previewCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.muted}>{formatUsd(farmer.raised)}</Text>
                  <Text style={styles.previewPlus}>+{formatUsd(amount)}</Text>
                  <Text style={styles.muted}>/ {formatUsd(farmer.needed)}</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBase,
                      {
                        width: `${farmer.needed > 0 ? Math.min(100, (farmer.raised / farmer.needed) * 100) : 0}%`,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.progressAdd,
                      {
                        left: `${farmer.needed > 0 ? Math.min(100, (farmer.raised / farmer.needed) * 100) : 0}%`,
                        width: `${
                          farmer.needed > 0
                            ? Math.min(
                                100 - (farmer.raised / farmer.needed) * 100,
                                (amount / farmer.needed) * 100,
                              )
                            : 0
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {!canContinue && amount > walletUsd ? (
                <Text style={styles.errorInline}>Solde insuffisant. Rechargez votre wallet.</Text>
              ) : null}
              {!canContinue && amount > remaining ? (
                <Text style={styles.errorInline}>
                  Montant supérieur au restant ({formatUsd(remaining)}).
                </Text>
              ) : null}

              <Pressable
                onPress={() => setStep("confirm")}
                disabled={!canContinue}
                style={[styles.primaryBtn, !canContinue && styles.btnDisabled]}
              >
                <Text style={styles.primaryBtnText}>Financer {formatUsd(amount)}</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.white} />
              </Pressable>
            </>
          ) : null}

          {step === "confirm" ? (
            <>
              <View style={styles.confirmCard}>
                <Text style={styles.confirmCopy}>
                  Confirmer le financement de {farmer.name} ?
                </Text>
                <Text style={styles.confirmAmount}>{formatUsd(amount)}</Text>
                <Text style={styles.muted}>
                  Solde après : {formatUsd(Math.max(0, walletUsd - amount))}
                </Text>
              </View>
              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => setStep("amount")}
                  disabled={isPending}
                  style={styles.secondaryBtn}
                >
                  <Text style={styles.secondaryBtnText}>Modifier</Text>
                </Pressable>
                <Pressable
                  testID="farmer-fund-confirm-btn"
                  onPress={() => void submit()}
                  disabled={isPending}
                  style={[styles.primaryBtn, styles.flex, isPending && styles.btnDisabled]}
                >
                  {isPending ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.primaryBtnText}>Confirmer</Text>
                  )}
                </Pressable>
              </View>
            </>
          ) : null}

          {step === "success" ? (
            <View style={styles.centered} testID="farmer-fund-success">
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={40} color={colors.green[700]} />
              </View>
              <Text style={styles.successTitle}>Financement réussi</Text>
              <Text style={styles.successSub}>
                {formatUsd(amount)} financé pour {farmer.name}
              </Text>
              <Pressable onPress={handleClose} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Fermer</Text>
              </Pressable>
            </View>
          ) : null}

          {step === "error" ? (
            <View style={styles.centered}>
              <View style={[styles.successIcon, { backgroundColor: "#FEF2F2" }]}>
                <Ionicons name="alert-circle" size={40} color={colors.danger} />
              </View>
              <Text style={styles.successTitle}>Erreur</Text>
              <Text style={[styles.successSub, { color: colors.danger }]}>{errorMsg}</Text>
              <View style={styles.actionsRow}>
                <Pressable onPress={reset} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Réessayer</Text>
                </Pressable>
                <Pressable onPress={handleClose} style={[styles.primaryBtn, styles.flex]}>
                  <Text style={styles.primaryBtnText}>Fermer</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radii["3xl"],
    borderTopRightRadius: radii["3xl"],
    ...shadows.elevated,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.green[700],
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.gray[900],
    marginTop: 2,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: spacing.xl, gap: spacing.md },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  muted: { fontSize: 13, color: colors.gray[500] },
  walletValue: { fontSize: 14, fontWeight: "700", color: colors.gray[900] },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  amountInput: {
    height: 56,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.gray[50],
    textAlign: "center",
    fontSize: 28,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  hint: { fontSize: 11, color: colors.gray[400], textAlign: "center" },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  quickChipActive: { borderColor: colors.green[700], backgroundColor: colors.green[50] },
  quickChipText: { fontSize: 13, fontWeight: "700", color: colors.gray[700] },
  quickChipTextActive: { color: colors.green[700] },
  previewCard: {
    backgroundColor: colors.gray[50],
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  previewPlus: { fontSize: 12, fontWeight: "700", color: colors.green[700] },
  progressTrack: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 999,
    overflow: "hidden",
    position: "relative",
  },
  progressBase: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.green[700],
  },
  progressAdd: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: colors.green[200],
  },
  errorInline: { fontSize: 12, fontWeight: "600", color: colors.danger },
  primaryBtn: {
    height: 48,
    borderRadius: radii.xl,
    backgroundColor: colors.green[700],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: { fontSize: 14, fontWeight: "700", color: colors.white },
  btnDisabled: { opacity: 0.4 },
  secondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: radii.xl,
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { fontSize: 13, fontWeight: "700", color: colors.gray[700] },
  actionsRow: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
  confirmCard: {
    backgroundColor: colors.green[50],
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  confirmCopy: { fontSize: 13, color: colors.gray[600], textAlign: "center" },
  confirmAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.green[700],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  centered: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    backgroundColor: colors.green[50],
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  successSub: { fontSize: 13, color: colors.gray[500], textAlign: "center" },
});
