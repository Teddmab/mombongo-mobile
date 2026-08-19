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
  TextInput,
  View,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  getDepositStatus,
  getWithdrawStatus,
  initiateDeposit,
  initiateWithdraw,
} from "@/services/wallet.service";
import { colors, radii, shadows, spacing } from "@/theme";

const OPERATORS = [
  { id: "mpesa", name: "M-Pesa", letter: "M", color: "#EF4444" },
  { id: "airtel", name: "Airtel Money", letter: "A", color: "#B91C1C" },
  { id: "orange", name: "Orange Money", letter: "O", color: "#F97316" },
];

const QUICK = [50, 100, 250, 500];

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type WalletStep = "amount" | "operator" | "confirm" | "waiting" | "success" | "error";

function WalletModalShell({
  visible,
  onClose,
  mode,
  currentBalance,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  mode: "deposit" | "withdraw";
  currentBalance: number;
  onSuccess: (amount: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const isDeposit = mode === "deposit";
  const accent = isDeposit ? colors.green[700] : colors.blue[700];
  const headerBg = isDeposit ? colors.green[700] : colors.blue[700];

  const [step, setStep] = useState<WalletStep>("amount");
  const [amount, setAmount] = useState(100);
  const [custom, setCustom] = useState("");
  const [operator, setOperator] = useState("mpesa");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [depositId, setDepositId] = useState<string | null>(null);
  const [payoutId, setPayoutId] = useState<string | null>(null);

  const finalAmount = custom ? Number(custom) : amount;
  const newBalance = isDeposit ? currentBalance + finalAmount : currentBalance - finalAmount;
  const insufficient = !isDeposit && finalAmount > currentBalance;
  const op = OPERATORS.find((o) => o.id === operator)!;

  const { data: depositStatus } = useQuery({
    queryKey: ["depositStatus", depositId],
    queryFn: () => getDepositStatus(depositId!),
    enabled: isDeposit && !!depositId && step === "waiting",
    refetchInterval: (query) =>
      query.state.data?.status === "completed" || query.state.data?.status === "failed"
        ? false
        : 3000,
  });

  const { data: withdrawStatus } = useQuery({
    queryKey: ["withdrawStatus", payoutId],
    queryFn: () => getWithdrawStatus(payoutId!),
    enabled: !isDeposit && !!payoutId && step === "waiting",
    refetchInterval: (query) =>
      query.state.data?.status === "completed" || query.state.data?.status === "failed"
        ? false
        : 3000,
  });

  useEffect(() => {
    if (!isDeposit || depositStatus?.status !== "completed") return;
    void qc.invalidateQueries({ queryKey: ["userProfile"] });
    setStep("success");
    onSuccess(finalAmount);
  }, [depositStatus?.status, isDeposit, finalAmount, onSuccess, qc]);

  useEffect(() => {
    if (isDeposit && depositStatus?.status === "failed") {
      setErrorMsg("Le dépôt a été refusé par l'opérateur. Réessayez.");
      setStep("error");
    }
  }, [depositStatus?.status, isDeposit]);

  useEffect(() => {
    if (isDeposit || withdrawStatus?.status !== "completed") return;
    void qc.invalidateQueries({ queryKey: ["userProfile"] });
    setStep("success");
    onSuccess(finalAmount);
  }, [withdrawStatus?.status, isDeposit, finalAmount, onSuccess, qc]);

  useEffect(() => {
    if (isDeposit || withdrawStatus?.status !== "failed") return;
    void qc.invalidateQueries({ queryKey: ["userProfile"] });
    setErrorMsg("Le retrait a échoué. Vos fonds ont été recrédités sur votre wallet.");
    setStep("error");
  }, [withdrawStatus?.status, isDeposit, qc]);

  useEffect(() => {
    if (!visible) return;
    setStep("amount");
    setAmount(100);
    setCustom("");
    setOperator("mpesa");
    setPhone("");
    setLoading(false);
    setErrorMsg("");
    setDepositId(null);
    setPayoutId(null);
  }, [visible, mode]);

  const close = () => {
    onClose();
    setTimeout(() => setStep("amount"), 300);
  };

  const confirm = async () => {
    setStep("waiting");
    setLoading(true);
    try {
      if (isDeposit) {
        const data = await initiateDeposit({
          amountUsd: finalAmount,
          phone,
          operator,
        });
        setDepositId(data.depositId);
      } else {
        const data = await initiateWithdraw({
          amountUsd: finalAmount,
          phone,
          operator,
        });
        setPayoutId(data.payoutId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur réseau. Réessayez.";
      setErrorMsg(msg);
      void qc.invalidateQueries({ queryKey: ["userProfile"] });
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const back = () => {
    if (step === "operator") setStep("amount");
    if (step === "confirm") setStep("operator");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <View style={[styles.hero, { backgroundColor: headerBg }]}>
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              {step === "operator" || step === "confirm" ? (
                <Pressable onPress={back} style={styles.heroIconBtn}>
                  <Ionicons name="chevron-back" size={18} color={colors.white} />
                </Pressable>
              ) : null}
              <View style={[styles.heroIcon, isDeposit && { backgroundColor: colors.amber[400] }]}>
                <Ionicons
                  name={isDeposit ? "arrow-down" : "arrow-up"}
                  size={16}
                  color={isDeposit ? colors.amber[900] : colors.white}
                />
              </View>
            </View>
            <Pressable onPress={close} style={styles.heroIconBtn}>
              <Ionicons name="close" size={18} color={colors.white} />
            </Pressable>
          </View>
          <Text style={styles.heroLabel}>{isDeposit ? "Dépôt wallet" : "Retrait wallet"}</Text>
          <Text style={styles.heroTitle}>{isDeposit ? "Ajouter des fonds" : "Retirer des fonds"}</Text>
          <View style={styles.heroBalance}>
            <Text style={styles.heroBalanceText}>
              {isDeposit ? "Solde actuel" : "Disponible"} {fmt(currentBalance)}
            </Text>
            {(step === "confirm" || step === "success") && (
              <Text style={styles.heroBalanceArrow}> → {fmt(newBalance)}</Text>
            )}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          {step === "amount" ? (
            <View style={styles.step}>
              <Text style={styles.stepTitle}>
                {isDeposit ? "Combien voulez-vous déposer ?" : "Combien souhaitez-vous retirer ?"}
              </Text>
              <View style={styles.quickGrid}>
                {QUICK.filter((q) => isDeposit || q <= currentBalance).map((q) => (
                  <Pressable
                    key={q}
                    onPress={() => {
                      setAmount(q);
                      setCustom("");
                    }}
                    style={[
                      styles.quickBtn,
                      amount === q && !custom && { backgroundColor: accent, borderColor: accent },
                    ]}
                  >
                    <Text
                      style={[
                        styles.quickText,
                        amount === q && !custom && styles.quickTextActive,
                      ]}
                    >
                      ${q}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.customWrap}>
                <Text style={styles.customPrefix}>$</Text>
                <TextInput
                  value={custom}
                  onChangeText={setCustom}
                  keyboardType="decimal-pad"
                  placeholder="Montant personnalisé"
                  placeholderTextColor={colors.gray[400]}
                  style={styles.customInput}
                />
              </View>
              {insufficient ? (
                <Text style={styles.errorHint}>Solde insuffisant — disponible : {fmt(currentBalance)}</Text>
              ) : null}
              <Pressable
                onPress={() => setStep("operator")}
                disabled={finalAmount <= 0 || insufficient}
                style={[
                  styles.primaryBtn,
                  { backgroundColor: accent },
                  (finalAmount <= 0 || insufficient) && styles.btnDisabled,
                ]}
              >
                <Text style={styles.primaryBtnText}>Continuer</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.white} />
              </Pressable>
            </View>
          ) : null}

          {step === "operator" ? (
            <View style={styles.step}>
              <Text style={styles.stepTitle}>Choisissez votre Mobile Money</Text>
              <View style={styles.operatorGrid}>
                {OPERATORS.map((o) => (
                  <Pressable
                    key={o.id}
                    onPress={() => setOperator(o.id)}
                    style={[styles.operatorBtn, operator === o.id && styles.operatorBtnActive]}
                  >
                    <View style={[styles.operatorLetter, { backgroundColor: o.color }]}>
                      <Text style={styles.operatorLetterText}>{o.letter}</Text>
                    </View>
                    <Text style={styles.operatorName}>{o.name}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.fieldLabel}>Numéro {op.name}</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+243 8X XXX XXXX"
                placeholderTextColor={colors.gray[400]}
                style={styles.input}
              />
              <Pressable
                onPress={() => setStep("confirm")}
                disabled={!phone.trim()}
                style={[styles.primaryBtn, { backgroundColor: accent }, !phone.trim() && styles.btnDisabled]}
              >
                <Text style={styles.primaryBtnText}>Continuer</Text>
              </Pressable>
            </View>
          ) : null}

          {step === "confirm" ? (
            <View style={styles.step}>
              <Text style={styles.stepTitle}>Confirmez {isDeposit ? "le dépôt" : "le retrait"}</Text>
              <View style={styles.confirmCard}>
                {[
                  { l: "Montant", v: fmt(finalAmount), accent: true },
                  { l: "Via", v: `${op.name} · ${phone}` },
                  { l: "Solde avant", v: fmt(currentBalance) },
                  { l: "Solde après", v: fmt(newBalance), accent: true },
                ].map((r) => (
                  <View key={r.l} style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>{r.l}</Text>
                    <Text style={[styles.confirmValue, r.accent && { color: accent }]}>{r.v}</Text>
                  </View>
                ))}
              </View>
              <Pressable onPress={confirm} style={[styles.primaryBtn, { backgroundColor: accent }]}>
                <Text style={styles.primaryBtnText}>
                  Confirmer {isDeposit ? "le dépôt" : "le retrait"}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {step === "waiting" ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={accent} />
              <Text style={styles.waitingTitle}>
                {loading ? "Envoi en cours…" : "Confirmez sur votre téléphone"}
              </Text>
              <Text style={styles.waitingSub}>
                {loading
                  ? `Connexion à ${op.name}…`
                  : `Notification ${op.name} pour ${fmt(finalAmount)}`}
              </Text>
            </View>
          ) : null}

          {step === "error" ? (
            <View style={styles.centered}>
              <Ionicons name="alert-circle" size={48} color={colors.danger} />
              <Text style={styles.waitingTitle}>Opération échouée</Text>
              <Text style={styles.waitingSub}>{errorMsg}</Text>
              <Pressable onPress={() => setStep("amount")} style={[styles.primaryBtn, { backgroundColor: accent }]}>
                <Text style={styles.primaryBtnText}>Réessayer</Text>
              </Pressable>
            </View>
          ) : null}

          {step === "success" ? (
            <View style={styles.centered}>
              <View style={[styles.successIcon, { backgroundColor: isDeposit ? colors.green[50] : "#EFF6FF" }]}>
                <Ionicons
                  name="checkmark-circle"
                  size={48}
                  color={isDeposit ? colors.green[700] : colors.blue[700]}
                />
              </View>
              <Text style={styles.waitingTitle}>{isDeposit ? "Dépôt réussi !" : "Retrait en cours !"}</Text>
              <Text style={[styles.successAmount, { color: accent }]}>{fmt(finalAmount)}</Text>
              <Text style={styles.waitingSub}>
                {isDeposit ? "ajoutés à votre wallet" : `envoyé vers ${op.name}`}
              </Text>
              <View style={styles.confirmCard}>
                <Text style={styles.confirmLabel}>Nouveau solde</Text>
                <Text style={[styles.successAmount, { color: colors.gray[900], fontSize: 18 }]}>
                  {fmt(newBalance)}
                </Text>
              </View>
              <Pressable onPress={close} style={[styles.primaryBtn, { backgroundColor: accent }]}>
                <Text style={styles.primaryBtnText}>Fermer</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function DepositModal(props: {
  visible: boolean;
  onClose: () => void;
  currentBalance: number;
  onSuccess: (amount: number) => void;
}) {
  return <WalletModalShell {...props} mode="deposit" />;
}

export function WithdrawModal(props: {
  visible: boolean;
  onClose: () => void;
  currentBalance: number;
  onSuccess: (amount: number) => void;
}) {
  return <WalletModalShell {...props} mode="withdraw" />;
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
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
    borderTopLeftRadius: radii["3xl"],
    borderTopRightRadius: radii["3xl"],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  heroIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  heroBalance: { flexDirection: "row", marginTop: spacing.sm },
  heroBalanceText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  heroBalanceArrow: { fontSize: 12, fontWeight: "700", color: colors.amber[400] },
  body: { padding: spacing.xl, marginTop: -spacing.md, backgroundColor: colors.white, borderTopLeftRadius: radii.xl },
  step: { gap: spacing.md },
  stepTitle: { fontSize: 13, fontWeight: "700", color: colors.gray[700] },
  quickGrid: { flexDirection: "row", gap: spacing.sm },
  quickBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.gray[200],
    alignItems: "center",
  },
  quickText: { fontSize: 13, fontWeight: "700", color: colors.gray[700] },
  quickTextActive: { color: colors.white },
  customWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
  },
  customPrefix: { fontSize: 14, fontWeight: "700", color: colors.gray[500], marginRight: 4 },
  customInput: { flex: 1, fontSize: 14, color: colors.gray[900] },
  errorHint: { fontSize: 12, color: colors.danger, fontWeight: "600" },
  primaryBtn: {
    height: 48,
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: spacing.sm,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 14, fontWeight: "700", color: colors.white },
  operatorGrid: { flexDirection: "row", gap: spacing.sm },
  operatorBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  operatorBtnActive: { borderColor: colors.green[700], backgroundColor: colors.green[50] },
  operatorLetter: {
    width: 32,
    height: 32,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  operatorLetterText: { fontSize: 13, fontWeight: "800", color: colors.white },
  operatorName: { fontSize: 9, fontWeight: "700", color: colors.gray[700], marginTop: 4 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    fontSize: 13,
    color: colors.gray[900],
  },
  confirmCard: {
    backgroundColor: colors.gray[50],
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  confirmRow: { flexDirection: "row", justifyContent: "space-between" },
  confirmLabel: { fontSize: 13, color: colors.gray[500] },
  confirmValue: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  centered: { alignItems: "center", paddingVertical: spacing.xl, gap: spacing.md },
  waitingTitle: { fontSize: 16, fontWeight: "700", color: colors.gray[900] },
  waitingSub: { fontSize: 13, color: colors.gray[500], textAlign: "center" },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  successAmount: {
    fontSize: 28,
    fontWeight: "800",
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
});
