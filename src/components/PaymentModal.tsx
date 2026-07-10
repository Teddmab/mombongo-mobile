import { useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { isDevMode } from "@/lib/dev";
import { colors, radii, shadows, spacing } from "@/theme";

export type PaymentType = "invest" | "reserve" | "support" | "deposit" | "withdraw" | "subscribe";
type Step = "amount" | "review" | "method" | "details" | "processing" | "success";
type Method = "card" | "mobile";
type Operator = "mpesa" | "airtel" | "orange";

export interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  type: PaymentType;
  title: string;
  subtitle: string;
  amount?: number;
  currency?: "USD" | "FC";
  minAmount?: number;
  onSuccess?: () => void;
}

const TYPE_META: Record<PaymentType, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  invest: { label: "Investissement", icon: "arrow-down-circle-outline" },
  reserve: { label: "Réservation Bourse", icon: "card-outline" },
  support: { label: "Soutien agriculteur", icon: "heart-outline" },
  deposit: { label: "Dépôt", icon: "arrow-down-circle-outline" },
  withdraw: { label: "Retrait", icon: "arrow-up-circle-outline" },
  subscribe: { label: "Abonnement", icon: "shield-checkmark-outline" },
};

const OPERATORS = [
  { id: "mpesa" as const, name: "M-Pesa", letter: "M", color: "#EF4444" },
  { id: "airtel" as const, name: "Airtel Money", letter: "A", color: "#B91C1C" },
  { id: "orange" as const, name: "Orange Money", letter: "O", color: "#F97316" },
];

const QUICK_USD = [50, 100, 250, 500];
const QUICK_FC = [25000, 50000, 100000, 250000];

function fmt(n: number, cur: "USD" | "FC") {
  return cur === "USD" ? `$${n.toLocaleString()}` : `${n.toLocaleString()} FC`;
}

function fmtCard(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function fmtExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

function SummaryRow({
  label,
  value,
  bold,
  green,
}: {
  label: string;
  value: string;
  bold?: boolean;
  green?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          bold && styles.summaryBold,
          green && styles.summaryGreen,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function PaymentModal({
  visible,
  onClose,
  type,
  title,
  subtitle,
  amount: initAmount,
  currency = "USD",
  minAmount = 50,
  onSuccess,
}: PaymentModalProps) {
  const insets = useSafeAreaInsets();
  const needsAmountStep = initAmount === undefined;
  const [step, setStep] = useState<Step>(needsAmountStep ? "amount" : "review");
  const [amount, setAmount] = useState(initAmount ?? minAmount);
  const [method, setMethod] = useState<Method | null>(null);
  const [operator, setOperator] = useState<Operator>("mpesa");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [phone, setPhone] = useState("");
  const [ref] = useState(() => `MBG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);

  useEffect(() => {
    if (!visible) return;
    setStep(needsAmountStep ? "amount" : "review");
    setAmount(initAmount ?? minAmount);
    setMethod(null);
    setCardNum("");
    setExpiry("");
    setCvv("");
    setCardName("");
    setPhone("");
  }, [visible, initAmount, minAmount, needsAmountStep]);

  useEffect(() => {
    if (step !== "processing") return;
    const t = setTimeout(() => setStep("success"), 2000);
    return () => clearTimeout(t);
  }, [step]);

  const meta = TYPE_META[type];
  const cardOk = cardNum.replace(/\s/g, "").length >= 16 && expiry.length === 5 && cvv.length === 3 && cardName.length > 1;
  const phoneOk = phone.replace(/\D/g, "").length >= 9;
  const detailOk = method === "card" ? cardOk : phoneOk;

  const canBack =
    (step === "review" && needsAmountStep) || step === "method" || step === "details";

  const back = () => {
    if (step === "review" && needsAmountStep) setStep("amount");
    else if (step === "method") setStep("review");
    else if (step === "details") setStep("method");
  };

  const handleClose = () => {
    if (step === "success") onSuccess?.();
    onClose();
  };

  const pay = () => {
    if (!isDevMode()) {
      Alert.alert("Mombongo", "Connexion Firebase requise pour les paiements.");
      return;
    }
    setStep("processing");
  };

  const successMessage: Record<PaymentType, string> = {
    invest: "Votre investissement est enregistré. Suivez la progression dans votre tableau de bord.",
    reserve: "Votre place est réservée. Un agent Mombongo vous contactera pour confirmer.",
    support: "Votre soutien a été transmis. Vous recevrez des rapports hebdomadaires.",
    deposit: "Votre dépôt sera crédité sur votre wallet dans les prochaines minutes.",
    withdraw: "Votre retrait est en cours. Délai estimé : 24h.",
    subscribe: "Votre abonnement est activé. Profitez de toutes les fonctionnalités.",
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable
        style={styles.backdrop}
        onPress={step !== "processing" ? handleClose : undefined}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        {step !== "processing" && step !== "success" ? (
          <View style={styles.header}>
            {canBack ? (
              <Pressable onPress={back} hitSlop={8} style={styles.headerBtn}>
                <Ionicons name="chevron-back" size={22} color={colors.gray[600]} />
              </Pressable>
            ) : (
              <View style={styles.headerBtn} />
            )}
            <Text style={styles.headerTitle}>{meta.label}</Text>
            <Pressable onPress={handleClose} hitSlop={8} style={styles.headerBtn}>
              <Ionicons name="close" size={20} color={colors.gray[500]} />
            </Pressable>
          </View>
        ) : null}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
          {step === "amount" ? (
            <View style={styles.step}>
              <Text style={styles.stepHint}>Choisissez le montant à verser</Text>
              <Text style={styles.amountDisplay}>{fmt(amount, currency)}</Text>
              <View style={styles.quickGrid}>
                {(currency === "USD" ? QUICK_USD : QUICK_FC).map((v) => (
                  <Pressable
                    key={v}
                    onPress={() => setAmount(v)}
                    style={[styles.quickBtn, amount === v && styles.quickBtnActive]}
                  >
                    <Text style={[styles.quickText, amount === v && styles.quickTextActive]}>
                      {currency === "USD" ? `$${v}` : `${(v / 1000).toFixed(0)}k`}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.minHint}>Minimum : {fmt(minAmount, currency)}</Text>
              <Pressable
                onPress={() => setStep("review")}
                disabled={amount < minAmount}
                style={[styles.primaryBtn, amount < minAmount && styles.btnDisabled]}
              >
                <Text style={styles.primaryBtnText}>Continuer · {fmt(amount, currency)}</Text>
              </Pressable>
            </View>
          ) : null}

          {step === "review" ? (
            <View style={styles.step}>
              <View style={styles.reviewCard}>
                <Text style={styles.reviewTitle}>{title}</Text>
                <Text style={styles.reviewSub}>{subtitle}</Text>
                <View style={styles.divider} />
                <SummaryRow label="Montant" value={fmt(amount, currency)} bold />
                <SummaryRow label="Frais de service" value="Gratuit" green />
                <SummaryRow label="Total" value={fmt(amount, currency)} bold />
              </View>
              <View style={styles.secureBanner}>
                <Ionicons name="shield-checkmark" size={16} color={colors.green[700]} />
                <Text style={styles.secureText}>
                  Transaction sécurisée · Chiffrement 256-bit
                </Text>
              </View>
              <Pressable onPress={() => setStep("method")} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Choisir le mode de paiement</Text>
              </Pressable>
            </View>
          ) : null}

          {step === "method" ? (
            <View style={styles.step}>
              <Text style={styles.stepHint}>Sélectionnez votre mode de paiement</Text>
              {(["card", "mobile"] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMethod(m)}
                  style={[styles.methodCard, method === m && styles.methodCardActive]}
                >
                  <View style={[styles.methodIcon, method === m && styles.methodIconActive]}>
                    <Ionicons
                      name={m === "card" ? "card-outline" : "phone-portrait-outline"}
                      size={20}
                      color={method === m ? colors.white : colors.gray[600]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.methodTitle}>
                      {m === "card" ? "Carte bancaire" : "Mobile Money"}
                    </Text>
                    <Text style={styles.methodSub}>
                      {m === "card" ? "Visa, Mastercard" : "M-Pesa · Airtel · Orange"}
                    </Text>
                  </View>
                  <View style={[styles.radio, method === m && styles.radioActive]}>
                    {method === m ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              ))}
              {method === "mobile" ? (
                <View style={styles.operatorGrid}>
                  {OPERATORS.map((op) => (
                    <Pressable
                      key={op.id}
                      onPress={() => setOperator(op.id)}
                      style={[styles.operatorBtn, operator === op.id && styles.operatorBtnActive]}
                    >
                      <View style={[styles.operatorLetter, { backgroundColor: op.color }]}>
                        <Text style={styles.operatorLetterText}>{op.letter}</Text>
                      </View>
                      <Text style={styles.operatorName}>{op.name}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              <Pressable
                onPress={() => setStep("details")}
                disabled={!method}
                style={[styles.primaryBtn, !method && styles.btnDisabled]}
              >
                <Text style={styles.primaryBtnText}>Continuer</Text>
              </Pressable>
            </View>
          ) : null}

          {step === "details" ? (
            <View style={styles.step}>
              {method === "card" ? (
                <>
                  <Field label="Numéro de carte">
                    <TextInput
                      value={cardNum}
                      onChangeText={(v) => setCardNum(fmtCard(v))}
                      placeholder="0000 0000 0000 0000"
                      keyboardType="number-pad"
                      placeholderTextColor={colors.gray[400]}
                      style={styles.input}
                    />
                  </Field>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Field label="Expiration">
                        <TextInput
                          value={expiry}
                          onChangeText={(v) => setExpiry(fmtExpiry(v))}
                          placeholder="MM/AA"
                          keyboardType="number-pad"
                          placeholderTextColor={colors.gray[400]}
                          style={styles.input}
                        />
                      </Field>
                    </View>
                    <View style={styles.flex}>
                      <Field label="CVV">
                        <TextInput
                          value={cvv}
                          onChangeText={(v) => setCvv(v.replace(/\D/g, "").slice(0, 3))}
                          placeholder="•••"
                          keyboardType="number-pad"
                          secureTextEntry
                          placeholderTextColor={colors.gray[400]}
                          style={styles.input}
                        />
                      </Field>
                    </View>
                  </View>
                  <Field label="Nom du titulaire">
                    <TextInput
                      value={cardName}
                      onChangeText={(v) => setCardName(v.toUpperCase())}
                      placeholder="ALAIN KABASELE"
                      placeholderTextColor={colors.gray[400]}
                      style={styles.input}
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Numéro de téléphone">
                    <TextInput
                      value={phone}
                      onChangeText={(v) => setPhone(v.replace(/\D/g, "").slice(0, 12))}
                      placeholder="+243 8X XXX XXXX"
                      keyboardType="phone-pad"
                      placeholderTextColor={colors.gray[400]}
                      style={styles.input}
                    />
                  </Field>
                  <View style={styles.amberBanner}>
                    <Text style={styles.amberBannerText}>
                      Une demande de {fmt(amount, currency)} sera envoyée sur ce numéro.
                      Confirmez sur votre téléphone.
                    </Text>
                  </View>
                </>
              )}
              <Pressable
                onPress={pay}
                disabled={!detailOk}
                style={[styles.primaryBtn, !detailOk && styles.btnDisabled]}
              >
                <Ionicons name="lock-closed" size={14} color={colors.white} />
                <Text style={styles.primaryBtnText}>
                  {method === "card" ? `Payer ${fmt(amount, currency)}` : "Envoyer la demande"}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {step === "processing" ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.green[700]} />
              <Text style={styles.processingTitle}>Traitement en cours…</Text>
              <Text style={styles.processingSub}>Ne fermez pas cette fenêtre</Text>
            </View>
          ) : null}

          {step === "success" ? (
            <View style={styles.centered}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={48} color={colors.green[600]} />
              </View>
              <Text style={styles.successTitle}>Paiement réussi !</Text>
              <Text style={styles.successSub}>{subtitle}</Text>
              <View style={styles.reviewCard}>
                <SummaryRow label="Référence" value={ref} />
                <View style={styles.divider} />
                <SummaryRow label="Montant" value={fmt(amount, currency)} bold />
                <SummaryRow label="Statut" value="Confirmé" green />
              </View>
              <View style={styles.secureBanner}>
                <Text style={styles.secureText}>{successMessage[type]}</Text>
              </View>
              <Pressable onPress={handleClose} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Fermer</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
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
    ...shadows.elevated,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_700Bold",
  },
  body: { padding: spacing.xl },
  step: { gap: spacing.md },
  stepHint: { fontSize: 13, color: colors.gray[500] },
  amountDisplay: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.gray[900],
    textAlign: "center",
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  quickBtn: {
    flex: 1,
    minWidth: "22%",
    paddingVertical: 10,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: "center",
  },
  quickBtnActive: { borderColor: colors.green[700], backgroundColor: colors.green[50] },
  quickText: { fontSize: 12, fontWeight: "700", color: colors.gray[700] },
  quickTextActive: { color: colors.green[700] },
  minHint: { fontSize: 11, color: colors.gray[400], textAlign: "center" },
  primaryBtn: {
    height: 48,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: spacing.sm,
  },
  btnDisabled: { opacity: 0.4 },
  primaryBtnText: { fontSize: 14, fontWeight: "700", color: colors.white },
  reviewCard: {
    backgroundColor: colors.gray[50],
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  reviewTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reviewSub: { fontSize: 15, fontWeight: "700", color: colors.gray[900] },
  divider: { height: 1, backgroundColor: colors.gray[200], marginVertical: spacing.xs },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  summaryLabel: { fontSize: 12, color: colors.gray[500] },
  summaryValue: { fontSize: 12, color: colors.gray[700] },
  summaryBold: { fontWeight: "800", color: colors.gray[900] },
  summaryGreen: { fontWeight: "700", color: colors.green[700] },
  secureBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.green[50],
    borderWidth: 1,
    borderColor: colors.green[100],
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  secureText: { flex: 1, fontSize: 11, fontWeight: "600", color: colors.green[800] },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 2,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  methodCardActive: { borderColor: colors.green[700], backgroundColor: colors.green[50] },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  methodIconActive: { backgroundColor: colors.green[700] },
  methodTitle: { fontSize: 14, fontWeight: "700", color: colors.gray[900] },
  methodSub: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[400],
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: colors.green[700], backgroundColor: colors.green[700] },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white },
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
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  operatorLetterText: { fontSize: 14, fontWeight: "800", color: colors.white },
  operatorName: { fontSize: 9, fontWeight: "700", color: colors.gray[700], marginTop: 4 },
  field: { gap: 6 },
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
  row: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
  amberBanner: {
    backgroundColor: colors.amber[50],
    borderWidth: 1,
    borderColor: colors.amber[100],
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  amberBannerText: { fontSize: 12, fontWeight: "600", color: colors.amber[900] },
  centered: { alignItems: "center", paddingVertical: spacing.xl, gap: spacing.md },
  processingTitle: { fontSize: 16, fontWeight: "700", color: colors.gray[900] },
  processingSub: { fontSize: 12, color: colors.gray[500] },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: radii.xl,
    backgroundColor: colors.green[50],
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  successSub: { fontSize: 13, color: colors.gray[500], textAlign: "center" },
});
