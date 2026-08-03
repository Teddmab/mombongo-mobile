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
import { useAgentFarmers, type BourseOpportunity } from "@/hooks/useLocalData";
import {
  useCreateBuyerOrder,
  useCreateProductListing,
} from "@/hooks/useProductListings";
import { isDevMode } from "@/lib/dev";
import {
  firebaseErrorMessage,
  submitUserAction,
} from "@/services/actions.service";
import { colors, radii, shadows, spacing } from "@/theme";

const AGRO_COMMODITIES = [
  "Maïs",
  "Manioc",
  "Riz",
  "Haricot",
  "Cacao",
  "Café",
  "Palmier",
  "Arachide",
  "Banane",
  "Tomate",
  "Pastèque",
  "Aubergine",
  "Autre",
];
const DRC_PROVINCES = [
  "Kinshasa",
  "Kongo-Central",
  "Kwango",
  "Kwilu",
  "Mai-Ndombe",
  "Kasaï",
  "Kasaï-Central",
  "Kasaï-Oriental",
  "Lomami",
  "Sankuru",
  "Maniema",
  "Sud-Kivu",
  "Nord-Kivu",
  "Ituri",
  "Haut-Uele",
  "Tshopo",
  "Bas-Uele",
  "Nord-Ubangi",
  "Mongala",
  "Sud-Ubangi",
  "Équateur",
  "Tshuapa",
  "Tanganyika",
  "Haut-Lomami",
  "Lualaba",
  "Haut-Katanga",
];

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
    try {
      if (isDevMode()) {
        await new Promise((r) => setTimeout(r, 800));
      } else {
        await submitUserAction("publish_product", {
          name,
          category,
          qty: Number(qty) || qty,
          unit,
          price: Number(price) || price,
          region,
          harvestDate,
        });
      }
      Alert.alert("Mombongo", `Annonce "${name}" publiée avec succès`);
      onClose();
    } catch (err) {
      Alert.alert("Mombongo", firebaseErrorMessage(err, "Impossible de publier l'annonce."));
    } finally {
      setLoading(false);
    }
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
    try {
      if (isDevMode()) {
        await new Promise((r) => setTimeout(r, 800));
      } else {
        await submitUserAction("place_order", {
          productName,
          qty: Number(qty) || qty,
          unit,
          address,
          date,
          payment,
          notes,
        });
      }
      Alert.alert("Mombongo", `Commande de ${qty} ${unit} de ${productName} confirmée`);
      onClose();
    } catch (err) {
      Alert.alert("Mombongo", firebaseErrorMessage(err, "Impossible de confirmer la commande."));
    } finally {
      setLoading(false);
    }
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

/* ─── Mettre en vente — Bourse Agro Exchange (S8-01) ───────────────────────── */

export function MettreEnVenteModal({
  visible,
  onClose,
  prefill,
}: {
  visible: boolean;
  onClose: () => void;
  prefill?: { commodity?: string; province?: string };
}) {
  const [commodity, setCommodity] = useState(prefill?.commodity ?? AGRO_COMMODITIES[0]);
  const [quantityKg, setQuantityKg] = useState("");
  const [quality, setQuality] = useState<"A" | "B" | "C">("B");
  const [province, setProvince] = useState(prefill?.province ?? "Kinshasa");
  const [territory, setTerritory] = useState("");
  const [pricePerKgCdf, setPricePerKgCdf] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);
  const { mutateAsync, isPending } = useCreateProductListing();

  useEffect(() => {
    if (!visible) return;
    setCommodity(prefill?.commodity ?? AGRO_COMMODITIES[0]);
    setQuantityKg("");
    setQuality("B");
    setProvince(prefill?.province ?? "Kinshasa");
    setTerritory("");
    setPricePerKgCdf("");
    setAvailableFrom("");
    setAvailableUntil("");
    setDescription("");
    setSuccess(false);
  }, [visible, prefill?.commodity, prefill?.province]);

  const submit = async () => {
    if (!quantityKg || !pricePerKgCdf || !territory || !availableFrom || !availableUntil) {
      Alert.alert("Mombongo", "Remplissez tous les champs obligatoires");
      return;
    }
    try {
      await mutateAsync({
        commodity,
        quantityKg: Number(quantityKg),
        quality,
        province,
        territory,
        pricePerKgCdf: Number(pricePerKgCdf),
        availableFrom,
        availableUntil,
        description,
      });
      setSuccess(true);
    } catch (err) {
      Alert.alert("Mombongo", firebaseErrorMessage(err, "Impossible de publier l'offre."));
    }
  };

  if (success) {
    return (
      <FormModal
        visible={visible}
        onClose={() => {
          setSuccess(false);
          onClose();
        }}
        title="Mise en vente"
      >
        <View style={{ alignItems: "center", gap: spacing.md, paddingVertical: spacing.xl }}>
          <Ionicons name="checkmark-circle" size={48} color={colors.green[700]} />
          <Text style={{ fontSize: 16, fontWeight: "800", color: colors.gray[900] }}>
            Offre publiée !
          </Text>
          <Text style={{ fontSize: 13, color: colors.gray[500], textAlign: "center" }}>
            Votre offre de {quantityKg} kg de {commodity} est visible sur la Bourse.
          </Text>
          <SubmitBtn
            label="Fermer"
            icon="close"
            onPress={() => {
              setSuccess(false);
              onClose();
            }}
          />
        </View>
      </FormModal>
    );
  }

  return (
    <FormModal visible={visible} onClose={onClose} title="Mettre en vente sur la Bourse">
      <Field label="Produit *">
        <ChipRow
          options={AGRO_COMMODITIES.map((c) => ({ id: c, label: c }))}
          value={commodity}
          onChange={setCommodity}
        />
      </Field>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="Quantité (kg) *">
            <TextInput
              value={quantityKg}
              onChangeText={setQuantityKg}
              keyboardType="number-pad"
              placeholder="20000"
              placeholderTextColor={colors.gray[400]}
              style={styles.input}
            />
          </Field>
        </View>
        <View style={styles.flex}>
          <Field label="Qualité *">
            <ChipRow
              options={[
                { id: "A", label: "A" },
                { id: "B", label: "B" },
                { id: "C", label: "C" },
              ]}
              value={quality}
              onChange={(v) => setQuality(v as "A" | "B" | "C")}
            />
          </Field>
        </View>
      </View>
      <Field label="Province *">
        <ChipRow
          options={DRC_PROVINCES.slice(0, 8).map((p) => ({ id: p, label: p }))}
          value={province}
          onChange={setProvince}
        />
      </Field>
      <Field label="Territoire *">
        <TextInput
          value={territory}
          onChangeText={setTerritory}
          placeholder="ex: Kikwit"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <Field label="Prix demandé / kg (FC) *">
        <TextInput
          value={pricePerKgCdf}
          onChangeText={setPricePerKgCdf}
          keyboardType="number-pad"
          placeholder="400"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="Disponible dès *">
            <TextInput
              value={availableFrom}
              onChangeText={setAvailableFrom}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor={colors.gray[400]}
              style={styles.input}
            />
          </Field>
        </View>
        <View style={styles.flex}>
          <Field label="Jusqu'au *">
            <TextInput
              value={availableUntil}
              onChangeText={setAvailableUntil}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor={colors.gray[400]}
              style={styles.input}
            />
          </Field>
        </View>
      </View>
      <Field label="Description (facultatif)">
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          placeholder="Variété, stockage, livraison…"
          placeholderTextColor={colors.gray[400]}
          style={[styles.input, styles.textarea]}
        />
      </Field>
      <SubmitBtn
        label="Publier mon offre"
        icon="pricetag-outline"
        onPress={submit}
        loading={isPending}
        disabled={!quantityKg || !pricePerKgCdf || !territory || !availableFrom || !availableUntil}
      />
    </FormModal>
  );
}

/* ─── Publier une demande d'achat (S8-02) ──────────────────────────────────── */

export function PublierDemandeModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [commodity, setCommodity] = useState(AGRO_COMMODITIES[0]);
  const [quantityKg, setQuantityKg] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [province, setProvince] = useState("Kinshasa");
  const [territory, setTerritory] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [description, setDescription] = useState("");
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const { mutateAsync, isPending } = useCreateBuyerOrder();

  useEffect(() => {
    if (!visible) return;
    setCommodity(AGRO_COMMODITIES[0]);
    setQuantityKg("");
    setMaxPrice("");
    setProvince("Kinshasa");
    setTerritory("");
    setNeededBy("");
    setDescription("");
    setMatchCount(null);
  }, [visible]);

  const submit = async () => {
    if (!quantityKg || !maxPrice || !neededBy) {
      Alert.alert("Mombongo", "Remplissez les champs obligatoires");
      return;
    }
    try {
      const res = await mutateAsync({
        commodity,
        quantityKg: Number(quantityKg),
        maxPricePerKgCdf: Number(maxPrice),
        deliveryProvince: province,
        deliveryTerritory: territory,
        neededBy,
        description,
      });
      setMatchCount(res.matchCount ?? 0);
    } catch (err) {
      Alert.alert("Mombongo", firebaseErrorMessage(err, "Impossible de publier la demande."));
    }
  };

  if (matchCount !== null) {
    return (
      <FormModal
        visible={visible}
        onClose={() => {
          setMatchCount(null);
          onClose();
        }}
        title="Demande publiée"
      >
        <View style={{ alignItems: "center", gap: spacing.md, paddingVertical: spacing.xl }}>
          <Ionicons name="checkmark-circle" size={48} color={colors.purple[700]} />
          <Text style={{ fontSize: 16, fontWeight: "800", color: colors.gray[900] }}>
            Demande enregistrée
          </Text>
          <Text style={{ fontSize: 13, color: colors.gray[500], textAlign: "center" }}>
            {matchCount} offre{matchCount > 1 ? "s" : ""} correspondent à votre demande.
          </Text>
          <SubmitBtn
            label="Fermer"
            icon="close"
            color="purple"
            onPress={() => {
              setMatchCount(null);
              onClose();
            }}
          />
        </View>
      </FormModal>
    );
  }

  return (
    <FormModal visible={visible} onClose={onClose} title="Publier une demande">
      <Field label="Produit *">
        <ChipRow
          options={AGRO_COMMODITIES.map((c) => ({ id: c, label: c }))}
          value={commodity}
          onChange={setCommodity}
        />
      </Field>
      <Field label="Quantité (kg) *">
        <TextInput
          value={quantityKg}
          onChangeText={setQuantityKg}
          keyboardType="number-pad"
          placeholder="5000"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <Field label="Prix max / kg (FC) *">
        <TextInput
          value={maxPrice}
          onChangeText={setMaxPrice}
          keyboardType="number-pad"
          placeholder="450"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <Field label="Province de livraison *">
        <ChipRow
          options={DRC_PROVINCES.slice(0, 8).map((p) => ({ id: p, label: p }))}
          value={province}
          onChange={setProvince}
        />
      </Field>
      <Field label="Territoire">
        <TextInput
          value={territory}
          onChangeText={setTerritory}
          placeholder="ex: Gombe"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <Field label="Besoin avant le *">
        <TextInput
          value={neededBy}
          onChangeText={setNeededBy}
          placeholder="AAAA-MM-JJ"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <Field label="Description">
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          placeholder="Qualité, packaging…"
          placeholderTextColor={colors.gray[400]}
          style={[styles.input, styles.textarea]}
        />
      </Field>
      <SubmitBtn
        label="Publier la demande"
        icon="bag-add-outline"
        color="purple"
        onPress={submit}
        loading={isPending}
        disabled={!quantityKg || !maxPrice || !neededBy}
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
  const { data: agentFarmers = [] } = useAgentFarmers();
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
  }, [visible, defaultFarmerId, agentFarmers]);

  const submit = async () => {
    if (!farmerId || !name || !qty || !price) return;
    setLoading(true);
    try {
      if (isDevMode()) {
        await new Promise((r) => setTimeout(r, 800));
      } else {
        await submitUserAction("publish_for_farmer", {
          farmerId,
          farmerName: farmer?.name,
          name,
          category,
          qty: Number(qty) || qty,
          unit,
          price: Number(price) || price,
          region: region || farmer?.region,
          harvestDate,
        });
      }
      Alert.alert("Mombongo", `Annonce "${name}" publiée pour ${farmer?.name}`);
      onClose();
    } catch (err) {
      Alert.alert("Mombongo", firebaseErrorMessage(err, "Impossible de publier pour l'agriculteur."));
    } finally {
      setLoading(false);
    }
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

/* ─── Réserver un lot Bourse (Commerçant) ───────────────────────────────────── */

export function ReserverLotModal({
  visible,
  onClose,
  opportunity,
}: {
  visible: boolean;
  onClose: () => void;
  opportunity: BourseOpportunity | null;
}) {
  const [parts, setParts] = useState("1");
  const [payment, setPayment] = useState("mobile-money");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setParts("1");
    setPayment("mobile-money");
    setLoading(false);
  }, [visible]);

  const submit = async () => {
    if (!opportunity) return;
    setLoading(true);
    try {
      if (isDevMode()) {
        await new Promise((r) => setTimeout(r, 800));
      } else {
        await submitUserAction("reserve_lot", {
          opportunityId: opportunity.id,
          title: opportunity.title,
          parts: Number(parts) || 1,
          payment,
          price: opportunity.price,
          volume: opportunity.volume,
        });
      }
      Alert.alert("Mombongo", `Lot réservé — ${opportunity.title}`);
      onClose();
    } catch (err) {
      Alert.alert("Mombongo", firebaseErrorMessage(err, "Impossible de réserver le lot."));
    } finally {
      setLoading(false);
    }
  };

  if (!opportunity) return null;

  return (
    <FormModal visible={visible} onClose={onClose} title="Réserver ce lot">
      <View style={lotStyles.summary}>
        <Text style={lotStyles.summaryTitle}>{opportunity.title}</Text>
        <Text style={lotStyles.summaryMeta}>
          {opportunity.origin}
          {opportunity.destination ? ` → ${opportunity.destination}` : ""}
        </Text>
        <View style={lotStyles.summaryGrid}>
          {[
            { l: "Volume", v: opportunity.volume },
            { l: "Prix lot", v: opportunity.price },
            { l: "Durée", v: opportunity.duration },
            { l: "Marge", v: `${opportunity.commission}%` },
          ].map((s) => (
            <View key={s.l} style={lotStyles.summaryCell}>
              <Text style={lotStyles.summaryCellLabel}>{s.l}</Text>
              <Text style={lotStyles.summaryCellValue}>{s.v}</Text>
            </View>
          ))}
        </View>
      </View>
      <Field label={`Nombre de parts (max ${opportunity.spotsLeft})`}>
        <TextInput
          value={parts}
          onChangeText={setParts}
          keyboardType="number-pad"
          placeholder="1"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <Field label="Mode de paiement">
        <ChipRow options={PAYMENTS} value={payment} onChange={setPayment} />
      </Field>
      <SubmitBtn
        label="Confirmer la réservation"
        icon="cube-outline"
        color="purple"
        onPress={submit}
        loading={loading}
      />
    </FormModal>
  );
}

/* ─── Publier un lot Bourse (Commerçant) ───────────────────────────────────── */

const LOT_TYPES = [
  { id: "transport", label: "Transport", icon: "bus-outline" as const },
  { id: "stockage", label: "Stockage", icon: "archive-outline" as const },
  { id: "transformation", label: "Transformation", icon: "construct-outline" as const },
];

export function PublierLotModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("transport");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [volume, setVolume] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [spots, setSpots] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle("");
    setType("transport");
    setOrigin("");
    setDestination("");
    setVolume("");
    setPrice("");
    setDuration("");
    setSpots("");
    setLoading(false);
  }, [visible]);

  const submit = async () => {
    if (!title || !origin || !volume || !price) return;
    setLoading(true);
    try {
      if (isDevMode()) {
        await new Promise((r) => setTimeout(r, 800));
      } else {
        await submitUserAction("publish_lot", {
          title,
          type,
          origin,
          destination: type === "transport" ? destination : undefined,
          volume,
          price,
          duration,
          spots: Number(spots) || spots,
        });
      }
      Alert.alert("Mombongo", `Lot "${title}" publié sur la Bourse`);
      onClose();
    } catch (err) {
      Alert.alert("Mombongo", firebaseErrorMessage(err, "Impossible de publier le lot."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal visible={visible} onClose={onClose} title="Publier un lot à vendre">
      <Field label="Titre de l'offre">
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Ex : Transport Tomates Matadi → Kinshasa"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <Field label="Type de lot">
        <View style={lotStyles.typeRow}>
          {LOT_TYPES.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setType(t.id)}
              style={[lotStyles.typeBtn, type === t.id && lotStyles.typeBtnActive]}
            >
              <Ionicons
                name={t.icon}
                size={16}
                color={type === t.id ? colors.purple[700] : colors.gray[500]}
              />
              <Text style={[lotStyles.typeText, type === t.id && lotStyles.typeTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Field>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="Origine">
            <TextInput
              value={origin}
              onChangeText={setOrigin}
              placeholder="Matadi, Boma…"
              placeholderTextColor={colors.gray[400]}
              style={styles.input}
            />
          </Field>
        </View>
        <View style={styles.flex}>
          <Field label={type === "transport" ? "Destination" : "Capacité / durée"}>
            <TextInput
              value={type === "transport" ? destination : duration}
              onChangeText={type === "transport" ? setDestination : setDuration}
              placeholder={type === "transport" ? "Kinshasa…" : "30 jours"}
              placeholderTextColor={colors.gray[400]}
              style={styles.input}
            />
          </Field>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="Volume">
            <TextInput
              value={volume}
              onChangeText={setVolume}
              placeholder="120 bacs, 500 kg…"
              placeholderTextColor={colors.gray[400]}
              style={styles.input}
            />
          </Field>
        </View>
        <View style={styles.flex}>
          <Field label="Prix du lot">
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="75,000 FC ou $150"
              placeholderTextColor={colors.gray[400]}
              style={styles.input}
            />
          </Field>
        </View>
      </View>
      {type === "transport" ? (
        <Field label="Durée estimée">
          <TextInput
            value={duration}
            onChangeText={setDuration}
            placeholder="3 jours"
            placeholderTextColor={colors.gray[400]}
            style={styles.input}
          />
        </Field>
      ) : null}
      <Field label="Places disponibles">
        <TextInput
          value={spots}
          onChangeText={setSpots}
          keyboardType="number-pad"
          placeholder="8"
          placeholderTextColor={colors.gray[400]}
          style={styles.input}
        />
      </Field>
      <SubmitBtn
        label="Publier le lot"
        icon="pricetag-outline"
        color="purple"
        onPress={submit}
        loading={loading}
        disabled={!title || !origin || !volume || !price}
      />
    </FormModal>
  );
}

const lotStyles = StyleSheet.create({
  summary: {
    backgroundColor: colors.gray[50],
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryTitle: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  summaryMeta: { fontSize: 11, color: colors.gray[500] },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.xs },
  summaryCell: { width: "47%" },
  summaryCellLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
  },
  summaryCellValue: { fontSize: 12, fontWeight: "700", color: colors.gray[900], marginTop: 2 },
  typeRow: { flexDirection: "row", gap: spacing.sm },
  typeBtn: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  typeBtnActive: { borderColor: colors.purple[700], backgroundColor: colors.purple[100] },
  typeText: { fontSize: 9, fontWeight: "700", color: colors.gray[500], textAlign: "center" },
  typeTextActive: { color: colors.purple[700] },
});

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
