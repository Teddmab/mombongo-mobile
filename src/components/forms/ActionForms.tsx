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
import { agentFarmers } from "@/data/mock";
import { colors, radii, shadows, spacing } from "@/theme";

function FormModal({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
            <Ionicons name="close" size={18} color={colors.gray[600]} />
          </Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
          {children}
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

function ChipRow({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((o) => (
        <Pressable
          key={o.id}
          onPress={() => onChange(o.id)}
          style={[styles.chip, value === o.id && styles.chipActive]}
        >
          <Text style={[styles.chipText, value === o.id && styles.chipTextActive]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function SubmitBtn({
  label,
  icon,
  color = "green",
  onPress,
  loading,
  disabled,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: "green" | "purple";
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const bg = color === "purple" ? colors.purple[700] : colors.green[700];
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      style={[styles.submitBtn, { backgroundColor: bg }, (loading || disabled) && styles.submitDisabled]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={16} color={colors.white} /> : null}
          <Text style={styles.submitText}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const CATEGORIES = [
  { id: "agriculture", label: "Agriculture" },
  { id: "export", label: "Export" },
  { id: "logistique", label: "Logistique" },
];

const UNITS = ["bacs", "kg", "sacs", "unités"];

const CROPS = ["Pastèques", "Concombres", "Aubergines", "Tomates", "Manioc", "Oignons"];

const PAYMENTS = [
  { id: "mobile-money", label: "Mobile Money" },
  { id: "virement", label: "Virement" },
  { id: "cash", label: "Cash" },
];

/* ─── Publier un produit (Agriculteur) ─────────────────────────────────────── */

export function PublierProduitModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("agriculture");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("bacs");
  const [price, setPrice] = useState("");
  const [region, setRegion] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName("");
    setCategory("agriculture");
    setQty("");
    setUnit("bacs");
    setPrice("");
    setRegion("");
    setHarvestDate("");
    setLoading(false);
  }, [visible]);

  const submit = async () => {
    if (!name || !qty || !price) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    Alert.alert("Mombongo", `Annonce "${name}" publiée avec succès`);
    onClose();
  };

  return (
    <FormModal visible={visible} onClose={onClose} title="Publier un produit">
      <Field label="Nom du produit">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex : Pastèques, Tomates…"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <Field label="Catégorie">
        <ChipRow options={CATEGORIES} value={category} onChange={setCategory} />
      </Field>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="Quantité disponible">
            <TextInput
              value={qty}
              onChangeText={setQty}
              keyboardType="number-pad"
              placeholder="180"
              placeholderTextColor={colors.gray[400]}
              style={styles.input}
            />
          </Field>
        </View>
        <View style={styles.unitCol}>
          <Field label="Unité">
            <ChipRow
              options={UNITS.map((u) => ({ id: u, label: u }))}
              value={unit}
              onChange={setUnit}
            />
          </Field>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="Prix / unité (FC)">
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="number-pad"
              placeholder="850"
              placeholderTextColor={colors.gray[400]}
              style={styles.input}
            />
          </Field>
        </View>
        <View style={styles.flex}>
          <Field label="Région">
            <TextInput
              value={region}
              onChangeText={setRegion}
              placeholder="Songololo…"
              placeholderTextColor={colors.gray[400]}
              style={styles.input}
            />
          </Field>
        </View>
      </View>
      <Field label="Date de récolte prévue">
        <TextInput
          value={harvestDate}
          onChangeText={setHarvestDate}
          placeholder="AAAA-MM-JJ"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <SubmitBtn
        label="Publier l'annonce"
        icon="leaf-outline"
        onPress={submit}
        loading={loading}
        disabled={!name || !qty || !price}
      />
    </FormModal>
  );
}

/* ─── Commander (Commerçant) ───────────────────────────────────────────────── */

export function CommanderModal({
  visible,
  onClose,
  productName,
  unit,
}: {
  visible: boolean;
  onClose: () => void;
  productName: string;
  unit: string;
}) {
  const [qty, setQty] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [payment, setPayment] = useState("mobile-money");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setQty("");
    setAddress("");
    setDate("");
    setPayment("mobile-money");
    setNotes("");
    setLoading(false);
  }, [visible]);

  const submit = async () => {
    if (!qty || !address) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    Alert.alert("Mombongo", `Commande de ${qty} ${unit} de ${productName} confirmée`);
    onClose();
  };

  return (
    <FormModal visible={visible} onClose={onClose} title={`Commander — ${productName}`}>
      <Field label={`Quantité souhaitée (${unit})`}>
        <TextInput
          value={qty}
          onChangeText={setQty}
          keyboardType="number-pad"
          placeholder="50"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <Field label="Adresse de livraison">
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Kinshasa, Gombe — Av. du Commerce"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <Field label="Date de livraison souhaitée">
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="AAAA-MM-JJ"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <Field label="Mode de paiement">
        <ChipRow options={PAYMENTS} value={payment} onChange={setPayment} />
      </Field>
      <Field label="Notes (optionnel)">
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          placeholder="Instructions spéciales…"
          placeholderTextColor={colors.gray[400]}
          style={[styles.input, styles.textarea]}
        />
      </Field>
      <SubmitBtn
        label="Confirmer la commande"
        icon="cube-outline"
        color="purple"
        onPress={submit}
        loading={loading}
        disabled={!qty || !address}
      />
    </FormModal>
  );
}

/* ─── Mettre en vente — Bourse (Agriculteur) ───────────────────────────────── */

export function MettreEnVenteModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [crop, setCrop] = useState("Pastèques");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("bacs");
  const [price, setPrice] = useState("");
  const [available, setAvailable] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setCrop("Pastèques");
    setQty("");
    setUnit("bacs");
    setPrice("");
    setAvailable("");
    setLoading(false);
  }, [visible]);

  const submit = async () => {
    if (!qty || !price) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    Alert.alert("Mombongo", `${crop} mis en vente sur la Bourse`);
    onClose();
  };

  return (
    <FormModal visible={visible} onClose={onClose} title="Mettre en vente sur la Bourse">
      <Field label="Culture à vendre">
        <ChipRow
          options={CROPS.map((c) => ({ id: c, label: c }))}
          value={crop}
          onChange={setCrop}
        />
      </Field>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="Quantité disponible">
            <TextInput
              value={qty}
              onChangeText={setQty}
              keyboardType="number-pad"
              placeholder="180"
              placeholderTextColor={colors.gray[400]}
              style={styles.input}
            />
          </Field>
        </View>
        <View style={styles.flex}>
          <Field label="Unité">
            <ChipRow
              options={["bacs", "kg", "sacs"].map((u) => ({ id: u, label: u }))}
              value={unit}
              onChange={setUnit}
            />
          </Field>
        </View>
      </View>
      <Field label="Prix demandé / unité (FC)">
        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="number-pad"
          placeholder="850"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <Field label="Disponible à partir du">
        <TextInput
          value={available}
          onChangeText={setAvailable}
          placeholder="AAAA-MM-JJ"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <SubmitBtn
        label="Mettre en vente"
        icon="pricetag-outline"
        onPress={submit}
        loading={loading}
        disabled={!qty || !price}
      />
    </FormModal>
  );
}

/* ─── Publier pour un agriculteur (Agent) ──────────────────────────────────── */

export function PublierPourAgriculteurModal({
  visible,
  onClose,
  defaultFarmerId,
}: {
  visible: boolean;
  onClose: () => void;
  defaultFarmerId?: string;
}) {
  const [farmerId, setFarmerId] = useState(defaultFarmerId ?? agentFarmers[0]?.id ?? "");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("agriculture");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("bacs");
  const [price, setPrice] = useState("");
  const [region, setRegion] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [loading, setLoading] = useState(false);

  const farmer = agentFarmers.find((f) => f.id === farmerId);

  useEffect(() => {
    if (!visible) return;
    setFarmerId(defaultFarmerId ?? agentFarmers[0]?.id ?? "");
    setName("");
    setCategory("agriculture");
    setQty("");
    setUnit("bacs");
    setPrice("");
    setRegion("");
    setHarvestDate("");
    setLoading(false);
  }, [visible, defaultFarmerId]);

  const submit = async () => {
    if (!farmerId || !name || !qty || !price) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    Alert.alert("Mombongo", `Annonce "${name}" publiée pour ${farmer?.name}`);
    onClose();
  };

  return (
    <FormModal visible={visible} onClose={onClose} title="Publier pour un agriculteur">
      <Field label="Agriculteur">
        <View style={styles.farmerList}>
          {agentFarmers.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => setFarmerId(f.id)}
              style={[styles.farmerOption, farmerId === f.id && styles.farmerOptionActive]}
            >
              <Text
                style={[
                  styles.farmerOptionText,
                  farmerId === f.id && styles.farmerOptionTextActive,
                ]}
              >
                {f.name} — {f.crop}, {f.region}
              </Text>
            </Pressable>
          ))}
        </View>
      </Field>
      {farmer ? (
        <View style={styles.farmerBanner}>
          <Ionicons name="location-outline" size={14} color={colors.green[700]} />
          <Text style={styles.farmerBannerText}>
            {farmer.region} · {farmer.surfaceHa} ha · {farmer.crop}
          </Text>
        </View>
      ) : null}
      <Field label="Nom du produit à publier">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={farmer ? `Ex : ${farmer.crop}…` : "Nom du produit"}
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <Field label="Catégorie">
        <ChipRow options={CATEGORIES} value={category} onChange={setCategory} />
      </Field>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="Quantité">
            <TextInput
              value={qty}
              onChangeText={setQty}
              keyboardType="number-pad"
              placeholder="180"
              placeholderTextColor={colors.gray[400]}
              style={styles.input}
            />
          </Field>
        </View>
        <View style={styles.flex}>
          <Field label="Unité">
            <ChipRow
              options={["bacs", "kg", "sacs"].map((u) => ({ id: u, label: u }))}
              value={unit}
              onChange={setUnit}
            />
          </Field>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="Prix / unité (FC)">
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="number-pad"
              placeholder="850"
              placeholderTextColor={colors.gray[400]}
              style={styles.input}
            />
          </Field>
        </View>
        <View style={styles.flex}>
          <Field label="Région">
            <TextInput
              value={region}
              onChangeText={setRegion}
              placeholder={farmer?.region ?? "Région"}
              placeholderTextColor={colors.gray[400]}
              style={styles.input}
            />
          </Field>
        </View>
      </View>
      <Field label="Date de récolte prévue">
        <TextInput
          value={harvestDate}
          onChangeText={setHarvestDate}
          placeholder="AAAA-MM-JJ"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <SubmitBtn
        label="Publier l'annonce"
        icon="people-outline"
        onPress={submit}
        loading={loading}
        disabled={!farmerId || !name || !qty || !price}
      />
    </FormModal>
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
    maxHeight: "92%",
    ...shadows.elevated,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[200],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing["2xl"] },
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
  textarea: { height: 72, paddingTop: 12, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
  unitCol: { flex: 1.2 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  chipActive: { borderColor: colors.green[700], backgroundColor: colors.green[50] },
  chipText: { fontSize: 11, fontWeight: "700", color: colors.gray[600] },
  chipTextActive: { color: colors.green[700] },
  submitBtn: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radii.lg,
    marginTop: spacing.sm,
    ...shadows.elevated,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { fontSize: 13, fontWeight: "700", color: colors.white },
  farmerList: { gap: 6 },
  farmerOption: {
    padding: 10,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  farmerOptionActive: { borderColor: colors.green[700], backgroundColor: colors.green[50] },
  farmerOptionText: { fontSize: 11, fontWeight: "600", color: colors.gray[600] },
  farmerOptionTextActive: { color: colors.green[800] },
  farmerBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    backgroundColor: colors.green[50],
    borderWidth: 1,
    borderColor: colors.green[200],
    borderRadius: radii.lg,
  },
  farmerBannerText: { fontSize: 11, fontWeight: "600", color: colors.green[800], flex: 1 },
});
