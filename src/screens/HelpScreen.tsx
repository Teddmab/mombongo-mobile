import { useState } from "react";
import {
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, radii, spacing } from "@/theme";

const WHATSAPP_NUMBER = "+243XXXXXXXXX"; // TODO: replace with real Mombongo support number
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour Mombongo, j'ai besoin d'aide.")}`;

interface FaqItem { q: string; a: string }
interface Category { emoji: string; label: string; items: FaqItem[] }

const FAQ: Category[] = [
  {
    emoji: "📱", label: "Mon compte",
    items: [
      { q: "Comment créer un compte ?", a: "Téléchargez l'application Mombongo et appuyez sur « S'inscrire ». Entrez votre numéro de téléphone, créez un mot de passe et choisissez votre rôle. Votre compte est actif immédiatement." },
      { q: "Comment changer mon mot de passe ?", a: "Allez dans Profil → Sécurité → Changer le mot de passe. Si vous avez oublié votre mot de passe, utilisez « Mot de passe oublié » sur l'écran de connexion." },
      { q: "Comment vérifier mon identité (KYC) ?", a: "Allez dans Profil → Vérification KYC et suivez les étapes. Vous aurez besoin d'une pièce d'identité. La vérification prend généralement 24 à 48 heures." },
      { q: "Comment modifier mon profil ?", a: "Allez dans Profil et appuyez sur votre photo ou votre nom pour ouvrir l'écran de modification." },
    ],
  },
  {
    emoji: "💰", label: "Paiements et dépôts",
    items: [
      { q: "Comment déposer des fonds ?", a: "Dans votre tableau de bord, appuyez sur « Dépôt » et choisissez votre opérateur mobile money ou carte bancaire. Le montant est crédité en quelques minutes." },
      { q: "Quels opérateurs mobile money acceptez-vous ?", a: "Nous acceptons Airtel Money, M-Pesa et Orange Money. Pour les cartes bancaires, nous acceptons Visa et Mastercard." },
      { q: "Combien de temps prend un dépôt ?", a: "Les dépôts mobile money sont traités en 1 à 5 minutes. Les dépôts par carte peuvent prendre jusqu'à 24 heures." },
      { q: "Comment retirer mes fonds ?", a: "Allez dans Profil → Retrait et entrez le montant et votre numéro mobile money. Les retraits sont traités dans les 24 heures ouvrables." },
      { q: "Quels sont les frais de la plateforme ?", a: "Mombongo applique des frais de 5 % sur les transactions. Le montant exact vous est toujours indiqué avant confirmation." },
    ],
  },
  {
    emoji: "🌿", label: "Investissements",
    items: [
      { q: "Comment choisir un produit agricole ?", a: "Consultez le Marché pour voir les produits disponibles avec leur ROI, durée et localisation. Choisissez en fonction de votre budget et de la durée souhaitée." },
      { q: "Quand vais-je recevoir mes rendements ?", a: "Les rendements sont versés à la date d'échéance indiquée sur votre investissement. Vous recevez une notification push lorsque votre investissement arrive à terme." },
      { q: "Puis-je retirer mon investissement avant terme ?", a: "Les investissements agricoles ne peuvent pas être remboursés avant la date d'échéance, car les fonds sont directement alloués à la production." },
    ],
  },
  {
    emoji: "📦", label: "Marché (Agriculteurs)",
    items: [
      { q: "Comment publier une annonce ?", a: "Dans l'onglet Marché, appuyez sur « Publier une annonce » et remplissez les informations. Votre annonce est visible par les commerçants immédiatement." },
      { q: "Comment modifier une annonce ?", a: "Dans l'onglet Marché → Mes annonces, appuyez sur « Modifier » à côté de l'annonce concernée." },
    ],
  },
  {
    emoji: "📋", label: "Financement (Agriculteurs)",
    items: [
      { q: "Comment demander un financement ?", a: "Dans l'onglet Financement, appuyez sur « Nouvelle demande » et complétez le formulaire en 4 étapes. Votre demande est examinée par un agent terrain sous 48 heures." },
      { q: "Qui est mon agent terrain ?", a: "Chaque agriculteur est assigné à un agent terrain Mombongo qui suit votre exploitation en personne. Votre agent apparaît dans l'onglet Financement." },
    ],
  },
];

function AccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.accordionItem}>
      <Pressable onPress={() => setOpen(o => !o)} style={styles.accordionHeader}>
        <Text style={[styles.questionText, open && styles.questionTextOpen]} numberOfLines={open ? undefined : 2}>
          {item.q}
        </Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color="#9CA3AF" />
      </Pressable>
      {open && (
        <View style={styles.accordionBody}>
          <Text style={styles.answerText}>{item.a}</Text>
          <Pressable onPress={() => Linking.openURL(WHATSAPP_URL)}>
            <Text style={styles.supportLink}>💬 Contacter le support</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export function HelpScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = FAQ.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item => !query || item.q.toLowerCase().includes(query.toLowerCase()) || item.a.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  const sections = filtered.flatMap(cat => [
    { type: "header" as const, label: `${cat.emoji} ${cat.label}` },
    ...cat.items.map(item => ({ type: "item" as const, item })),
  ]);

  return (
    <View style={styles.root}>
      {/* NavBar */}
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#374151" />
        </Pressable>
        <Text style={styles.navTitle}>Centre d'aide</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une question…"
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={sections}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        renderItem={({ item: s }) => {
          if (s.type === "header") {
            return <Text style={styles.categoryLabel}>{s.label}</Text>;
          }
          return (
            <View style={styles.card}>
              <AccordionItem item={s.item} />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Aucun résultat. Contactez le support.</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerHint}>Vous ne trouvez pas de réponse ?</Text>
            <Pressable style={styles.waButton} onPress={() => Linking.openURL(WHATSAPP_URL)}>
              <Text style={styles.waButtonText}>💬 Contacter le support sur WhatsApp</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F9FAFB" },
  navBar: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6", flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 12, paddingBottom: 12, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  navTitle: { fontWeight: "700", fontSize: 16, color: "#111827" },
  searchContainer: { margin: spacing.md, backgroundColor: "#fff", borderRadius: radii.lg, borderWidth: 1, borderColor: "#E5E7EB", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, height: 44 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: "#111827" },
  list: { paddingHorizontal: spacing.md, paddingBottom: 120 },
  categoryLabel: { fontSize: 10, fontWeight: "800", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1.2, marginTop: 20, marginBottom: 8 },
  card: { backgroundColor: "#fff", borderRadius: radii.lg, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 2, overflow: "hidden" },
  accordionItem: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  accordionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, gap: 12 },
  questionText: { flex: 1, fontSize: 13, color: "#374151", fontWeight: "600" },
  questionTextOpen: { fontWeight: "700", color: "#111827" },
  accordionBody: { paddingHorizontal: 16, paddingBottom: 16 },
  answerText: { fontSize: 13, color: "#6B7280", lineHeight: 20 },
  supportLink: { marginTop: 10, fontSize: 12, fontWeight: "700", color: "#15803D" },
  empty: { alignItems: "center", paddingVertical: 40 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 13, color: "#6B7280" },
  footer: { marginTop: 32, paddingBottom: 32 },
  footerHint: { textAlign: "center", fontSize: 12, color: "#9CA3AF", marginBottom: 12 },
  waButton: { backgroundColor: "#16A34A", borderRadius: radii.lg, paddingVertical: 16, alignItems: "center" },
  waButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
