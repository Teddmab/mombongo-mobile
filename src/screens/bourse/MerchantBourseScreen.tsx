import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ContractModal } from "@/components/bourse/ContractModal";
import { NegotiationModal } from "@/components/bourse/NegotiationModal";
import { BourseTickerBar } from "@/components/bourse/BourseTickerBar";
import {
  MettreEnVenteModal,
  PublierDemandeModal,
  ReserverLotModal,
} from "@/components/forms/ActionForms";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useBourseOpportunities, type BourseOpportunity } from "@/hooks/useLocalData";
import {
  useBuyerOrders,
  useMyMatches,
  useProductListings,
  type BourseMatch,
  type ProductListing,
} from "@/hooks/useProductListings";
import { colors, radii, spacing } from "@/theme";

const TYPE_ICON = {
  transport: "bus-outline",
  stockage: "archive-outline",
  transformation: "construct-outline",
} as const;

export function MerchantBourseScreen() {
  const router = useRouter();
  const scrollPadding = useTabScrollPadding();
  const { data: bourseOpportunities = [] } = useBourseOpportunities();
  const { data: listings = [] } = useProductListings();
  const { data: orders = [] } = useBuyerOrders();
  const { data: matches = [] } = useMyMatches("buyer");
  const [tab, setTab] = useState<"logistique" | "offres" | "demandes">("offres");
  const [reserveOpp, setReserveOpp] = useState<BourseOpportunity | null>(null);
  const [demandeOpen, setDemandeOpen] = useState(false);
  const [ventePrefill, setVentePrefill] = useState<{ commodity?: string } | undefined>();
  const [venteOpen, setVenteOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState<BourseMatch | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);
  const [contactListing, setContactListing] = useState<ProductListing | null>(null);

  const openContact = (l: ProductListing) => {
    // Create a synthetic pending match shell for negotiation UI in live mode via matches list;
    // in practice buyer contacts via existing match after posting demand.
    setContactListing(l);
    const existing = matches.find((m) => m.listingId === l.id);
    if (existing) setActiveMatch(existing);
  };

  return (
    <TabScreen>
      <ScrollView contentContainerStyle={[styles.content, scrollPadding]} testID="bourse-screen">
        <BourseTickerBar />

        <View style={styles.tabs}>
          {(
            [
              ["offres", "Offres"],
              ["demandes", "Demandes"],
              ["logistique", "Logistique"],
            ] as const
          ).map(([id, label]) => (
            <Pressable
              key={id}
              onPress={() => setTab(id)}
              style={[styles.tab, tab === id && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === id && styles.tabTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {tab === "offres" ? (
          <>
            <Pressable onPress={() => setDemandeOpen(true)} style={styles.publishBtn}>
              <Ionicons name="bag-add-outline" size={18} color={colors.white} />
              <Text style={styles.publishText}>Publier une demande</Text>
            </Pressable>
            <View style={styles.list}>
              {listings.map((l) => (
                <View key={l.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.title}>
                        {l.commodity} · {l.quality}
                      </Text>
                      <Text style={styles.meta}>
                        {l.sellerName} · {l.province}/{l.territory}
                      </Text>
                      <Text style={styles.volume}>
                        {l.quantityKg} kg · {l.pricePerKgCdf} FC/kg
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => openContact(l)} style={styles.reserveBtn}>
                    <Text style={styles.reserveText}>Contacter le vendeur</Text>
                  </Pressable>
                </View>
              ))}
              {listings.length === 0 ? (
                <Text style={styles.empty}>Aucune offre disponible</Text>
              ) : null}
            </View>
            {matches.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>Mes négociations</Text>
                <View style={styles.list}>
                  {matches.map((m) => (
                    <Pressable
                      key={m.id}
                      onPress={() => setActiveMatch(m)}
                      style={styles.card}
                    >
                      <Text style={styles.title}>
                        {m.commodity} · {m.quantityKg} kg
                      </Text>
                      <Text style={styles.meta}>{m.status}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
          </>
        ) : null}

        {tab === "demandes" ? (
          <View style={styles.list}>
            {orders.map((o) => (
              <View key={o.id} style={styles.card}>
                <Text style={styles.title}>
                  {o.commodity} · {o.quantityKg} kg
                </Text>
                <Text style={styles.meta}>
                  Max {o.maxPricePerKgCdf} FC/kg · {o.deliveryProvince}
                </Text>
                <Pressable
                  onPress={() => {
                    setVentePrefill({ commodity: o.commodity });
                    setVenteOpen(true);
                  }}
                  style={styles.reserveBtn}
                >
                  <Text style={styles.reserveText}>Je peux fournir</Text>
                </Pressable>
              </View>
            ))}
            {orders.length === 0 ? (
              <Text style={styles.empty}>Aucune demande ouverte</Text>
            ) : null}
          </View>
        ) : null}

        {tab === "logistique" ? (
          <>
            <View style={[styles.hero, { backgroundColor: colors.purple[700] }]}>
              <Text style={styles.heroLabel}>LOGISTIQUE & TRANSPORT</Text>
              <Text style={styles.heroTitle}>Réservez du fret</Text>
              <Text style={styles.heroSub}>
                Transport groupé pour réduire vos coûts d&apos;approvisionnement
              </Text>
            </View>
            <Text style={styles.sectionLabel}>Lots disponibles</Text>
            <View style={styles.list}>
              {bourseOpportunities.map((o) => (
                <View key={o.id} style={styles.card}>
                  <Pressable
                    onPress={() => router.push(`/bourse/${o.id}` as never)}
                    style={styles.cardTop}
                  >
                    <View style={[styles.icon, { backgroundColor: colors.purple[100] }]}>
                      <Ionicons name={TYPE_ICON[o.type]} size={20} color={colors.purple[700]} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.title} numberOfLines={2}>
                        {o.title}
                      </Text>
                      {o.destination ? (
                        <Text style={styles.meta}>
                          {o.origin} → {o.destination}
                        </Text>
                      ) : (
                        <Text style={styles.meta}>{o.origin}</Text>
                      )}
                      <Text style={styles.volume}>
                        {o.volume} · {o.duration}
                      </Text>
                    </View>
                    <View style={styles.priceCol}>
                      <Text style={styles.price}>{o.price}</Text>
                      <Text style={styles.comm}>+{o.commission}%</Text>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => setReserveOpp(o)} style={styles.reserveBtn}>
                    <Ionicons name="cube-outline" size={14} color={colors.white} />
                    <Text style={styles.reserveText}>Réserver ce lot</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>

      <ReserverLotModal
        visible={!!reserveOpp}
        onClose={() => setReserveOpp(null)}
        opportunity={reserveOpp}
      />
      <PublierDemandeModal visible={demandeOpen} onClose={() => setDemandeOpen(false)} />
      <MettreEnVenteModal
        visible={venteOpen}
        onClose={() => {
          setVenteOpen(false);
          setVentePrefill(undefined);
        }}
        prefill={ventePrefill}
      />
      <NegotiationModal
        visible={!!activeMatch}
        onClose={() => setActiveMatch(null)}
        match={activeMatch}
        role="buyer"
        onContractReady={(id) => setContractId(id)}
      />
      <ContractModal
        visible={!!contractId}
        onClose={() => setContractId(null)}
        contractId={contractId}
        role="buyer"
      />
      {contactListing && !activeMatch ? (
        <View style={styles.hintToast}>
          <Text style={styles.hintText}>
            Publiez une demande pour {contactListing.commodity} afin de démarrer une négociation.
          </Text>
          <Pressable
            onPress={() => {
              setContactListing(null);
              setDemandeOpen(true);
            }}
          >
            <Text style={styles.hintAction}>Publier</Text>
          </Pressable>
        </View>
      ) : null}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingTop: spacing.md, gap: spacing.md },
  tabs: { flexDirection: "row", backgroundColor: colors.gray[100], borderRadius: radii.lg, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: radii.lg, alignItems: "center" },
  tabActive: { backgroundColor: colors.white },
  tabText: { fontSize: 11, fontWeight: "700", color: colors.gray[500] },
  tabTextActive: { color: colors.gray[900] },
  publishBtn: {
    height: 40,
    backgroundColor: colors.purple[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  publishText: { fontSize: 13, fontWeight: "700", color: colors.white },
  hero: { borderRadius: radii.xl, padding: spacing.xl },
  heroLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.6)", letterSpacing: 1 },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
    marginTop: 4,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  heroSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  list: { gap: spacing.sm },
  empty: { fontSize: 13, color: colors.gray[400], padding: spacing.md },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  meta: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  volume: { fontSize: 11, color: colors.gray[400], marginTop: 2 },
  priceCol: { alignItems: "flex-end" },
  price: { fontSize: 12, fontWeight: "800", color: colors.purple[700] },
  comm: { fontSize: 10, fontWeight: "800", color: colors.amber[700], marginTop: 2 },
  reserveBtn: {
    height: 36,
    backgroundColor: colors.purple[700],
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  reserveText: { fontSize: 12, fontWeight: "700", color: colors.white },
  hintToast: {
    position: "absolute",
    left: SCREEN_HORIZONTAL_PADDING,
    right: SCREEN_HORIZONTAL_PADDING,
    bottom: 24,
    backgroundColor: colors.gray[900],
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  hintText: { flex: 1, color: colors.white, fontSize: 12 },
  hintAction: { color: colors.amber[400], fontWeight: "800", fontSize: 12 },
});
