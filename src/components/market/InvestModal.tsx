import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { isDevMode } from "@/lib/dev";
import { colors, radii, spacing } from "@/theme";

interface ProductSummary {
  id: string;
  name: string;
  icon: string;
  roi: number;
  minInvest: number;
  duration: number;
}

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function harvestDateStr(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function InvestModal({
  visible,
  onClose,
  product,
  walletBalance,
}: {
  visible: boolean;
  onClose: () => void;
  product: ProductSummary;
  walletBalance: number;
}) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<"amount" | "summary" | "success" | "error">("amount");
  const [amount, setAmount] = useState(product.minInvest);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [investmentId, setInvestmentId] = useState("");

  const estimatedReturn = (amount * product.roi) / 100;
  const insufficient = amount > walletBalance;

  useEffect(() => {
    if (visible) {
      setStep("amount");
      setAmount(product.minInvest);
      setLoading(false);
      setErrorMsg("");
      setInvestmentId("");
    }
  }, [visible, product.minInvest]);

  const close = () => onClose();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (isDevMode()) {
        await new Promise((r) => setTimeout(r, 800));
        setInvestmentId("mock-inv-" + Date.now());
      } else {
        Alert.alert("Mombongo", "Connexion Firebase requise pour investir.");
        setLoading(false);
        return;
      }
      setStep("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors de l'investissement.");
      setStep("error");
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.heroIcon}>{product.icon}</Text>
            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={colors.white} />
            </Pressable>
          </View>
          <Text style={styles.heroLabel}>INVESTISSEMENT</Text>
          <Text style={styles.heroTitle}>{product.name}</Text>
          <Text style={styles.heroMeta}>
            ROI {product.roi}% · {product.duration}j · Min {fmt(product.minInvest)}
          </Text>
        </View>

        <View style={styles.body}>
          {step === "amount" ? (
            <>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Ionicons name="wallet-outline" size={14} color={colors.gray[500]} />
                  <Text style={styles.rowLabel}>Solde wallet</Text>
                </View>
                <Text style={[styles.rowValue, insufficient && { color: colors.danger }]}>
                  {fmt(walletBalance)}
                </Text>
              </View>

              <Text style={styles.fieldLabel}>Montant à investir</Text>
              <View style={styles.amountWrap}>
                <Text style={styles.amountPrefix}>$</Text>
                <TextInput
                  value={String(amount)}
                  onChangeText={(v) => setAmount(Number(v.replace(/[^0-9]/g, "")) || 0)}
                  keyboardType="number-pad"
                  style={styles.amountInput}
                />
              </View>
              <View style={styles.amountBounds}>
                <Text style={styles.boundText}>Min {fmt(product.minInvest)}</Text>
                <Text style={styles.boundText}>Max {fmt(walletBalance)}</Text>
              </View>

              <View style={styles.preview}>
                <View style={styles.row}>
                  <View style={styles.rowLeft}>
                    <Ionicons name="trending-up" size={14} color={colors.green[700]} />
                    <Text style={styles.previewLabel}>Rendement estimé</Text>
                  </View>
                  <Text style={styles.previewValue}>+{fmt(estimatedReturn)}</Text>
                </View>
                <View style={[styles.row, { marginTop: spacing.sm }]}>
                  <View style={styles.rowLeft}>
                    <Ionicons name="calendar-outline" size={14} color={colors.gray[500]} />
                    <Text style={styles.previewLabel}>Date de récolte</Text>
                  </View>
                  <Text style={styles.previewDate}>{harvestDateStr(product.duration)}</Text>
                </View>
              </View>

              {insufficient ? (
                <Text style={styles.errorHint}>Solde insuffisant. Déposez des fonds d'abord.</Text>
              ) : null}

              <Pressable
                onPress={() => setStep("summary")}
                disabled={amount < product.minInvest || insufficient}
                style={[styles.primaryBtn, (amount < product.minInvest || insufficient) && styles.btnDisabled]}
              >
                <Text style={styles.primaryBtnText}>Continuer</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.white} />
              </Pressable>
            </>
          ) : null}

          {step === "summary" ? (
            <>
              <Text style={styles.summaryTitle}>Confirmez votre investissement</Text>
              <View style={styles.summaryCard}>
                {[
                  { label: "Produit", value: product.name },
                  { label: "Montant investi", value: fmt(amount), accent: true },
                  {
                    label: "Rendement estimé",
                    value: `+${fmt(estimatedReturn)} (${product.roi}%)`,
                    green: true,
                  },
                  { label: "Date de récolte", value: harvestDateStr(product.duration) },
                  {
                    label: "Solde après",
                    value: fmt(walletBalance - amount),
                    warn: walletBalance - amount < 50,
                  },
                ].map((r) => (
                  <View key={r.label} style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{r.label}</Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        r.accent && styles.summaryAccent,
                        r.green && styles.summaryGreen,
                        r.warn && styles.summaryWarn,
                      ]}
                    >
                      {r.value}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.disclaimer}>
                Les fonds sont débités immédiatement de votre wallet. Le rendement est versé à la date de récolte.
              </Text>
              <Pressable
                onPress={handleConfirm}
                disabled={loading}
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>Confirmer l'investissement</Text>
                )}
              </Pressable>
              <Pressable onPress={() => setStep("amount")} style={styles.linkBtn}>
                <Text style={styles.linkText}>Modifier le montant</Text>
              </Pressable>
            </>
          ) : null}

          {step === "success" ? (
            <View style={styles.centered}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={48} color={colors.green[700]} />
              </View>
              <Text style={styles.successTitle}>Investissement confirmé !</Text>
              <Text style={styles.successAmount}>{fmt(amount)}</Text>
              <Text style={styles.successSub}>investi dans {product.name}</Text>
              <View style={styles.preview}>
                <View style={styles.row}>
                  <Text style={styles.previewLabel}>Rendement attendu</Text>
                  <Text style={styles.previewValue}>+{fmt(estimatedReturn)}</Text>
                </View>
                <View style={[styles.row, { marginTop: spacing.sm }]}>
                  <Text style={styles.previewLabel}>Récolte estimée</Text>
                  <Text style={styles.previewDate}>{harvestDateStr(product.duration)}</Text>
                </View>
              </View>
              {investmentId ? (
                <Text style={styles.invId}>ID: {investmentId}</Text>
              ) : null}
              <Pressable onPress={close} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Fermer</Text>
              </Pressable>
            </View>
          ) : null}

          {step === "error" ? (
            <View style={styles.centered}>
              <View style={styles.errorIcon}>
                <Ionicons name="alert-circle" size={40} color={colors.danger} />
              </View>
              <Text style={styles.successTitle}>Investissement échoué</Text>
              <Text style={styles.successSub}>{errorMsg}</Text>
              <Pressable onPress={() => setStep("amount")} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Réessayer</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
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
  },
  hero: {
    backgroundColor: colors.green[700],
    borderTopLeftRadius: radii["3xl"],
    borderTopRightRadius: radii["3xl"],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing["2xl"],
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroIcon: { fontSize: 28 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1,
    marginTop: spacing.md,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
    marginTop: 2,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  heroMeta: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: spacing.sm },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    marginTop: -spacing.lg,
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowLabel: { fontSize: 13, color: colors.gray[500] },
  rowValue: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
  },
  amountPrefix: { fontSize: 15, fontWeight: "700", color: colors.gray[500], marginRight: 4 },
  amountInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_700Bold",
  },
  amountBounds: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 4,
  },
  boundText: { fontSize: 11, color: colors.gray[400], fontWeight: "700" },
  preview: {
    marginTop: spacing.lg,
    backgroundColor: colors.green[50],
    borderWidth: 1,
    borderColor: colors.green[100],
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  previewLabel: { fontSize: 12, color: colors.gray[500] },
  previewValue: { fontSize: 12, fontWeight: "700", color: colors.green[700] },
  previewDate: { fontSize: 12, fontWeight: "600", color: colors.gray[700] },
  errorHint: { fontSize: 12, color: colors.danger, fontWeight: "600", marginTop: spacing.sm },
  primaryBtn: {
    marginTop: spacing.lg,
    height: 48,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  btnDisabled: { opacity: 0.4 },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
    fontFamily: "PlusJakartaSans_700Bold",
  },
  summaryTitle: { fontSize: 13, fontWeight: "700", color: colors.gray[700] },
  summaryCard: {
    marginTop: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  summaryLabel: { fontSize: 13, color: colors.gray[500], flex: 1 },
  summaryValue: { fontSize: 13, fontWeight: "600", color: colors.gray[900] },
  summaryAccent: { color: colors.green[700], fontWeight: "800" },
  summaryGreen: { color: colors.green[600], fontWeight: "700" },
  summaryWarn: { color: colors.amber[500], fontWeight: "700" },
  disclaimer: { fontSize: 11, color: colors.gray[400], marginTop: spacing.md, lineHeight: 16 },
  linkBtn: { alignItems: "center", marginTop: spacing.md, paddingVertical: spacing.sm },
  linkText: { fontSize: 12, color: colors.gray[400] },
  centered: { alignItems: "center", paddingVertical: spacing.lg },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    backgroundColor: colors.green[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.xl,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_700Bold",
  },
  successAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.green[700],
    marginTop: spacing.xs,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  successSub: { fontSize: 13, color: colors.gray[500], marginTop: spacing.xs, textAlign: "center" },
  invId: { fontSize: 10, color: colors.gray[400], fontFamily: "monospace", marginTop: spacing.sm },
});
