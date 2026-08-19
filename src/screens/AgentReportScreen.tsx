import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackHeader } from "@/components/shell/StackHeader";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useFarmers } from "@/hooks/useFinancing";
import { useAgentFarmers } from "@/hooks/useLocalData";
import { isDevMode } from "@/lib/dev";
import {
  firebaseErrorMessage,
  submitAgentReport,
} from "@/services/actions.service";
import { colors, radii, shadows, spacing } from "@/theme";
import { useQueryClient } from "@tanstack/react-query";

const CONDITIONS = [
  { v: 1, label: "Très mauvais", color: "#EF4444" },
  { v: 2, label: "Mauvais", color: "#FB923C" },
  { v: 3, label: "Moyen", color: colors.amber[400] },
  { v: 4, label: "Bon", color: "#84CC16" },
  { v: 5, label: "Excellent", color: colors.green[600] },
] as const;

const PROBLEM_OPTIONS = [
  { id: "ravageurs", label: "Ravageurs", icon: "bug-outline" as const },
  { id: "maladies", label: "Maladies", icon: "warning-outline" as const },
  { id: "secheresse", label: "Sécheresse", icon: "thermometer-outline" as const },
  { id: "pluies", label: "Pluies excessives", icon: "rainy-outline" as const },
  { id: "sol", label: "Problème de sol", icon: "leaf-outline" as const },
  { id: "aucun", label: "Aucun problème", icon: "close-circle-outline" as const },
];

const URGENCY_OPTIONS = [
  { id: "irrigation", label: "Irrigation urgente", icon: "water-outline" as const },
  { id: "traitement", label: "Traitement phyto", icon: "flask-outline" as const },
  { id: "visite", label: "Visite agent", icon: "person-outline" as const },
  { id: "financement", label: "Besoin financement", icon: "checkmark-circle-outline" as const },
];

const STAGES = ["Semis", "Germination", "Croissance", "Floraison", "Fructification", "Récolte"];
const CROPS = ["Pastèques", "Concombres", "Aubergines", "Tomates", "Manioc", "Oignons"];

function SectionHeader({
  n,
  label,
  icon,
}: {
  n: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionNum}>
        <Text style={styles.sectionNumText}>{n}</Text>
      </View>
      <Ionicons name={icon} size={16} color={colors.green[700]} />
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function ConditionPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.conditionRow}>
      {CONDITIONS.map((c) => (
        <Pressable
          key={c.v}
          onPress={() => onChange(c.v)}
          style={[
            styles.conditionBtn,
            value === c.v && { backgroundColor: c.color, borderColor: c.color },
          ]}
        >
          <Text style={[styles.conditionValue, value === c.v && styles.conditionValueActive]}>
            {c.v}
          </Text>
          <Text style={[styles.conditionLabel, value === c.v && styles.conditionLabelActive]}>
            {c.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function CheckGroup({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  return (
    <View style={styles.checkGrid}>
      {options.map((o) => {
        const sel = value.includes(o.id);
        return (
          <Pressable
            key={o.id}
            onPress={() => toggle(o.id)}
            style={[styles.checkItem, sel && styles.checkItemActive]}
          >
            <Ionicons name={o.icon} size={16} color={sel ? colors.green[700] : colors.gray[400]} />
            <Text style={[styles.checkLabel, sel && styles.checkLabelActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function StagePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.stageWrap}>
      {STAGES.map((s) => (
        <Pressable
          key={s}
          onPress={() => onChange(s)}
          style={[styles.stageBtn, value === s && styles.stageBtnActive]}
        >
          <Text style={[styles.stageText, value === s && styles.stageTextActive]}>{s}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function SuccessView({
  title,
  message,
  onNew,
  onHome,
}: {
  title: string;
  message: string;
  onNew: () => void;
  onHome: () => void;
}) {
  return (
    <View style={styles.success}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={48} color={colors.green[700]} />
      </View>
      <Text style={styles.successTitle}>{title}</Text>
      <Text style={styles.successMessage}>{message}</Text>
      <View style={styles.successActions}>
        <Pressable onPress={onNew} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Nouveau</Text>
        </Pressable>
        <Pressable onPress={onHome} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Tableau de bord</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AgentReportForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const { userProfile } = useAuth();
  const { data: agentFarmers = [], isLoading: agentFarmersLoading } = useAgentFarmers();
  const { data: financingFarmers = [] } = useFarmers();
  const agentName = userProfile?.displayName || "Patrick Kadima";

  const farmerOptions = useMemo(
    () =>
      agentFarmers.length > 0
        ? agentFarmers.map((f) => ({
            id: f.id,
            name: f.name,
            crop: f.crop,
            region: f.region,
            surfaceHa: f.surfaceHa,
          }))
        : financingFarmers.map((f) => ({
            id: f.id,
            name: f.name,
            crop: f.crops[0] ?? "",
            region: f.location,
            surfaceHa: f.surface,
          })),
    [agentFarmers, financingFarmers],
  );

  const [farmerId, setFarmerId] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [condition, setCondition] = useState(3);
  const [stage, setStage] = useState("Floraison");
  const [surface, setSurface] = useState("");
  const [problems, setProblems] = useState<string[]>(["aucun"]);
  const [disbursed, setDisbursed] = useState("");
  const [additionalNeeds, setAdditionalNeeds] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [nextVisit, setNextVisit] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedFarmer = farmerOptions.find((f) => f.id === farmerId);

  useEffect(() => {
    if (!farmerId && farmerOptions[0]?.id) setFarmerId(farmerOptions[0].id);
  }, [farmerOptions, farmerId]);

  const submit = async () => {
    if (!farmerId || !recommendations.trim()) return;
    setLoading(true);
    try {
      if (isDevMode()) {
        await new Promise((r) => setTimeout(r, 1000));
      } else {
        await submitAgentReport({
          farmerId,
          recommendations: recommendations.trim(),
          visitDate: visitDate || undefined,
          cropCondition: condition,
          growthStage: stage,
          surfaceHa: parseFloat(surface) || undefined,
          problems,
          disbursedUsd: disbursed ? Number(disbursed) : undefined,
          additionalNeedUsd: additionalNeeds ? Number(additionalNeeds) : undefined,
          nextVisitDate: nextVisit || undefined,
        });
        void qc.invalidateQueries({ queryKey: ["agent-farmers"] });
      }
      setSubmitted(true);
    } catch (err) {
      Alert.alert("Mombongo", firebaseErrorMessage(err, "Impossible de soumettre le rapport."));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SuccessView
        title="Rapport soumis !"
        message={`Votre rapport pour ${selectedFarmer?.name} a été transmis à l'équipe.`}
        onNew={() => {
          setSubmitted(false);
          setRecommendations("");
          setProblems(["aucun"]);
        }}
        onHome={() => router.replace("/(tabs)/home")}
      />
    );
  }

  return (
    <View style={styles.form}>
      <SectionHeader n={1} label="Identification de la visite" icon="clipboard-outline" />
      <FieldLabel>Agriculteur visité</FieldLabel>
      <View style={styles.farmerList}>
        {agentFarmersLoading && farmerOptions.length === 0 ? (
          <Text style={{ color: colors.gray[500], fontSize: 13 }}>Chargement des agriculteurs…</Text>
        ) : null}
        {!agentFarmersLoading && farmerOptions.length === 0 ? (
          <Text style={{ color: colors.gray[500], fontSize: 13 }}>
            Aucun agriculteur assigné pour le moment.
          </Text>
        ) : null}
        {farmerOptions.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setFarmerId(f.id)}
            style={[styles.farmerOption, farmerId === f.id && styles.farmerOptionActive]}
          >
            <Text style={[styles.farmerOptionText, farmerId === f.id && styles.farmerOptionTextActive]}>
              {f.name} — {f.crop}, {f.region}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <FieldLabel>Date de la visite</FieldLabel>
          <TextInput
            value={visitDate}
            onChangeText={setVisitDate}
            placeholder="AAAA-MM-JJ"
            placeholderTextColor={colors.gray[400]}
            style={styles.input}
          />
        </View>
        <View style={styles.half}>
          <FieldLabel>Agent rédacteur</FieldLabel>
          <TextInput value={agentName} editable={false} style={[styles.input, styles.inputDisabled]} />
        </View>
      </View>

      {selectedFarmer ? (
        <View style={styles.farmerBanner}>
          <Ionicons name="location-outline" size={16} color={colors.green[700]} />
          <Text style={styles.farmerBannerText}>
            {selectedFarmer.region} · {selectedFarmer.surfaceHa} ha · {selectedFarmer.crop}
          </Text>
        </View>
      ) : null}

      <SectionHeader n={2} label="Observations terrain" icon="leaf-outline" />
      <FieldLabel>État général de la culture (1–5)</FieldLabel>
      <ConditionPicker value={condition} onChange={setCondition} />
      <FieldLabel>Stade de croissance observé</FieldLabel>
      <StagePicker value={stage} onChange={setStage} />
      <FieldLabel>Surface inspectée (ha)</FieldLabel>
      <TextInput
        value={surface}
        onChangeText={setSurface}
        keyboardType="decimal-pad"
        placeholder={`max ${selectedFarmer?.surfaceHa ?? "–"} ha`}
        placeholderTextColor={colors.gray[400]}
        style={styles.input}
      />

      <SectionHeader n={3} label="Problèmes identifiés" icon="warning-outline" />
      <CheckGroup options={PROBLEM_OPTIONS} value={problems} onChange={setProblems} />

      <SectionHeader n={4} label="Suivi du financement" icon="checkmark-circle-outline" />
      <View style={styles.row}>
        <View style={styles.half}>
          <FieldLabel>Montant déjà décaissé ($)</FieldLabel>
          <TextInput
            value={disbursed}
            onChangeText={setDisbursed}
            keyboardType="number-pad"
            placeholder="650"
            placeholderTextColor={colors.gray[400]}
            style={styles.input}
          />
        </View>
        <View style={styles.half}>
          <FieldLabel>Besoins supplémentaires ($)</FieldLabel>
          <TextInput
            value={additionalNeeds}
            onChangeText={setAdditionalNeeds}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.gray[400]}
            style={styles.input}
          />
        </View>
      </View>

      <SectionHeader n={5} label="Recommandations & suites" icon="chatbubble-outline" />
      <FieldLabel>Recommandations détaillées *</FieldLabel>
      <TextInput
        value={recommendations}
        onChangeText={setRecommendations}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        placeholder="Décrivez les actions à entreprendre…"
        placeholderTextColor={colors.gray[400]}
        style={[styles.input, styles.textarea]}
      />
      <FieldLabel>Date de prochaine visite</FieldLabel>
      <TextInput
        value={nextVisit}
        onChangeText={setNextVisit}
        placeholder="AAAA-MM-JJ"
        placeholderTextColor={colors.gray[400]}
        style={styles.input}
      />

      <SectionHeader n={6} label="Photos terrain" icon="camera-outline" />
      <Pressable
        onPress={() => Alert.alert("Mombongo", "Upload photos — bientôt disponible")}
        style={styles.photoZone}
      >
        <Ionicons name="camera-outline" size={32} color={colors.gray[400]} />
        <Text style={styles.photoTitle}>Ajouter des photos de terrain</Text>
        <Text style={styles.photoSub}>Culture, sol, problèmes identifiés</Text>
      </Pressable>

      <Pressable
        onPress={submit}
        disabled={loading || !recommendations.trim()}
        style={[styles.submitBtn, (!recommendations.trim() || loading) && styles.submitBtnDisabled]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Ionicons name="send" size={16} color={colors.white} />
            <Text style={styles.submitText}>Soumettre le rapport</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

function FarmerReportForm() {
  const router = useRouter();
  const [crop, setCrop] = useState("Pastèques");
  const [stage, setStage] = useState("Floraison");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [condition, setCondition] = useState(4);
  const [urgencies, setUrgencies] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SuccessView
        title="Signalement envoyé !"
        message="Votre agent terrain Patrick Kadima a été notifié de votre mise à jour."
        onNew={() => {
          setSubmitted(false);
          setMessage("");
          setUrgencies([]);
        }}
        onHome={() => router.replace("/(tabs)/home")}
      />
    );
  }

  return (
    <View style={styles.form}>
      <SectionHeader n={1} label="Ma culture" icon="leaf-outline" />
      <FieldLabel>Culture concernée</FieldLabel>
      <View style={styles.stageWrap}>
        {CROPS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCrop(c)}
            style={[styles.stageBtn, crop === c && styles.stageBtnActive]}
          >
            <Text style={[styles.stageText, crop === c && styles.stageTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </View>
      <FieldLabel>Date du signalement</FieldLabel>
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="AAAA-MM-JJ"
        placeholderTextColor={colors.gray[400]}
        style={styles.input}
      />
      <FieldLabel>Stade actuel</FieldLabel>
      <StagePicker value={stage} onChange={setStage} />

      <SectionHeader n={2} label="État de la culture" icon="flower-outline" />
      <FieldLabel>Évaluez l'état général de votre culture</FieldLabel>
      <ConditionPicker value={condition} onChange={setCondition} />
      {condition <= 2 ? (
        <View style={styles.alertBanner}>
          <Ionicons name="warning-outline" size={16} color={colors.danger} />
          <Text style={styles.alertBannerText}>
            État critique détecté — votre agent sera alerté en priorité.
          </Text>
        </View>
      ) : null}

      <SectionHeader n={3} label="Besoins urgents" icon="time-outline" />
      <CheckGroup options={URGENCY_OPTIONS} value={urgencies} onChange={setUrgencies} />

      <SectionHeader n={4} label="Message à votre agent" icon="chatbubble-outline" />
      <TextInput
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        placeholder="Expliquez ce que vous observez sur le terrain…"
        placeholderTextColor={colors.gray[400]}
        style={[styles.input, styles.textarea]}
      />
      <View style={styles.agentBanner}>
        <Ionicons name="person-circle-outline" size={16} color={colors.green[700]} />
        <Text style={styles.agentBannerText}>
          Votre agent Patrick Kadima — prochaine visite le 5 juin
        </Text>
      </View>

      <Pressable onPress={submit} disabled={loading} style={[styles.submitBtn, loading && styles.submitBtnDisabled]}>
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Ionicons name="send" size={16} color={colors.white} />
            <Text style={styles.submitText}>Envoyer le signalement</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

function AccessDenied({ role }: { role: string }) {
  const router = useRouter();
  return (
    <View style={styles.denied}>
      <View style={styles.deniedIcon}>
        <Ionicons name="clipboard-outline" size={40} color={colors.gray[400]} />
      </View>
      <Text style={styles.deniedTitle}>Section non disponible</Text>
      <Text style={styles.deniedText}>
        Les rapports terrain sont réservés aux agents et aux agriculteurs.
        {role === "investor"
          ? " En tant qu'investisseur, consultez les rapports depuis le Market."
          : role === "merchant"
            ? " En tant que commerçant, vos échanges passent par la Bourse."
            : ""}
      </Text>
      <Pressable onPress={() => router.replace("/(tabs)/home")} style={styles.primaryBtn}>
        <Text style={styles.primaryBtnText}>Retour tableau de bord</Text>
      </Pressable>
    </View>
  );
}

const ROLE_CONFIG = {
  agent: { header: "Rapport de visite", subtitle: "Documentez votre visite chez un agriculteur" },
  farmer: { header: "Signalement culture", subtitle: "Informez votre agent de l'état de votre exploitation" },
  investor: { header: "Rapports", subtitle: "" },
  merchant: { header: "Rapports", subtitle: "" },
} as const;

export function AgentReportScreen() {
  const { role } = useApp();
  const insets = useSafeAreaInsets();
  const config = ROLE_CONFIG[role] ?? { header: "Rapport", subtitle: "" };

  return (
    <View style={styles.root} testID="agent-report-screen">
      <StackHeader title={config.header} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 16) + spacing.lg },
        ]}
      >
        {config.subtitle ? <Text style={styles.subtitle}>{config.subtitle}</Text> : null}
        {role === "agent" && <AgentReportForm />}
        {role === "farmer" && <FarmerReportForm />}
        {(role === "investor" || role === "merchant") && <AccessDenied role={role} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray[50] },
  scroll: { paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingTop: spacing.md },
  subtitle: { fontSize: 14, color: colors.gray[500], marginBottom: spacing.md },
  form: { gap: spacing.md },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    marginTop: spacing.sm,
  },
  sectionNum: {
    width: 28,
    height: 28,
    borderRadius: radii.lg,
    backgroundColor: colors.green[700],
    alignItems: "center",
    justifyContent: "center",
  },
  sectionNumText: { color: colors.white, fontSize: 12, fontWeight: "800" },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.gray[900], flex: 1 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
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
  inputDisabled: { opacity: 0.6 },
  textarea: { height: 100, paddingTop: 12, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: spacing.sm },
  half: { flex: 1 },
  conditionRow: { flexDirection: "row", gap: 4 },
  conditionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.gray[200],
    backgroundColor: colors.gray[50],
    alignItems: "center",
  },
  conditionValue: { fontSize: 12, fontWeight: "800", color: colors.gray[500] },
  conditionValueActive: { color: colors.white },
  conditionLabel: { fontSize: 8, fontWeight: "600", color: colors.gray[400], textAlign: "center", marginTop: 2 },
  conditionLabelActive: { color: colors.white },
  checkGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  checkItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  checkItemActive: { backgroundColor: colors.green[50], borderColor: colors.green[700] },
  checkLabel: { fontSize: 11, fontWeight: "600", color: colors.gray[600], flex: 1 },
  checkLabelActive: { color: colors.green[800] },
  stageWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  stageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  stageBtnActive: { backgroundColor: colors.green[700], borderColor: colors.green[700] },
  stageText: { fontSize: 11, fontWeight: "700", color: colors.gray[600] },
  stageTextActive: { color: colors.white },
  farmerList: { gap: 6, marginBottom: spacing.sm },
  farmerOption: {
    padding: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  farmerOptionActive: { borderColor: colors.green[700], backgroundColor: colors.green[50] },
  farmerOptionText: { fontSize: 12, fontWeight: "600", color: colors.gray[600] },
  farmerOptionTextActive: { color: colors.green[800] },
  farmerBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: colors.green[50],
    borderWidth: 1,
    borderColor: colors.green[200],
    borderRadius: radii.lg,
  },
  farmerBannerText: { fontSize: 12, fontWeight: "600", color: colors.green[800], flex: 1 },
  photoZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: "center",
    gap: 6,
  },
  photoTitle: { fontSize: 13, fontWeight: "700", color: colors.gray[500] },
  photoSub: { fontSize: 11, color: colors.gray[400] },
  submitBtn: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    marginTop: spacing.md,
    ...shadows.elevated,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: colors.white, fontSize: 14, fontWeight: "700" },
  success: { alignItems: "center", paddingVertical: spacing.xl * 2 },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: radii.xl,
    backgroundColor: colors.green[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  successMessage: { fontSize: 14, color: colors.gray[500], textAlign: "center", marginTop: 8, maxWidth: 280 },
  successActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  secondaryBtn: {
    height: 40,
    paddingHorizontal: 20,
    backgroundColor: colors.gray[100],
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { fontSize: 13, fontWeight: "700", color: colors.gray[700] },
  primaryBtn: {
    height: 40,
    paddingHorizontal: 20,
    backgroundColor: colors.green[700],
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontSize: 13, fontWeight: "700", color: colors.white },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: radii.lg,
  },
  alertBannerText: { flex: 1, fontSize: 12, color: colors.danger },
  agentBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: colors.green[50],
    borderWidth: 1,
    borderColor: colors.green[200],
    borderRadius: radii.lg,
  },
  agentBannerText: { flex: 1, fontSize: 12, fontWeight: "600", color: colors.green[800] },
  denied: { alignItems: "center", paddingVertical: spacing.xl * 2 },
  deniedIcon: {
    width: 80,
    height: 80,
    borderRadius: radii.xl,
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  deniedTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  deniedText: { fontSize: 14, color: colors.gray[500], textAlign: "center", marginTop: 8, maxWidth: 300 },
});
