import { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  type ListRenderItemInfo,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApp, type Role } from "@/context/AppContext";
import { colors, radii, spacing } from "@/theme";

const { width: SCREEN_W } = Dimensions.get("window");

export const ONBOARDING_STORAGE_KEY = "mb_onboarding_done";

const _listeners = new Set<() => void>();
export function addOnboardingResetListener(fn: () => void) {
  _listeners.add(fn);
  return () => { _listeners.delete(fn); };
}
export async function resetOnboarding() {
  await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
  _listeners.forEach((fn) => fn());
}

interface Slide {
  emoji: string;
  title: string;
  body: string;
}

const SLIDES: Record<Role, Slide[]> = {
  farmer: [
    { emoji: "👋", title: "Bienvenue sur Mombongo", body: "Votre assistant agricole et financier personnel." },
    { emoji: "📦", title: "Vendez vos récoltes", body: "Publiez vos produits sur le marché. Les commerçants vous contactent directement." },
    { emoji: "💰", title: "Obtenez un financement", body: "Demandez un crédit agricole et suivez votre dossier depuis l'app." },
    { emoji: "📊", title: "Suivez votre exploitation", body: "Gérez vos cultures, vos récoltes et vos revenus en un seul endroit." },
  ],
  investor: [
    { emoji: "👋", title: "Bienvenue sur Mombongo", body: "Investissez dans l'agriculture africaine. Simple, sécurisé, rentable." },
    { emoji: "🌿", title: "Choisissez un produit", body: "Parcourez les projets agricoles vérifiés. À partir de 50 USD." },
    { emoji: "💳", title: "Déposez des fonds", body: "Via Airtel Money, Orange Money, M-Pesa ou carte bancaire." },
    { emoji: "📈", title: "Suivez vos rendements", body: "Votre tableau de bord montre vos gains et l'avancement de chaque projet." },
  ],
  agent: [
    { emoji: "👋", title: "Bienvenue sur Mombongo", body: "Vous êtes le lien entre les agriculteurs et les financeurs." },
    { emoji: "🗺️", title: "Vos agriculteurs", body: "Consultez la liste des agriculteurs qui vous sont assignés." },
    { emoji: "📝", title: "Rapports de terrain", body: "Soumettez vos rapports avec photos pour valider les tranches." },
    { emoji: "✅", title: "Validez les jalons", body: "Chaque rapport approuvé débloque un versement pour l'agriculteur." },
  ],
  merchant: [
    { emoji: "👋", title: "Bienvenue sur Mombongo", body: "Achetez des produits agricoles directement auprès des producteurs." },
    { emoji: "🔍", title: "Parcourez le marché", body: "Consultez les offres de milliers d'agriculteurs en DRC." },
    { emoji: "📋", title: "Passez des commandes", body: "Proposez un prix, négociez, et signez un contrat numérique." },
    { emoji: "🚚", title: "Suivez vos livraisons", body: "Confirmez la réception et libérez le paiement via l'escrow Mombongo." },
  ],
};

interface Props {
  onDone: () => void;
}

export function OnboardingScreen({ onDone }: Props) {
  const { role } = useApp();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const slides = SLIDES[role] ?? SLIDES.investor;
  const isLast = activeIndex === slides.length - 1;

  const finish = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
    onDone();
  }, [onDone]);

  const goNext = () => {
    if (isLast) {
      void finish();
    } else {
      listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<Slide>) => (
    <View style={[styles.slide, { width: SCREEN_W }]}>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Passer */}
      <Pressable
        onPress={() => void finish()}
        style={[styles.skipBtn, { top: insets.top + 12 }]}
        hitSlop={12}
      >
        <Text style={styles.skipText}>Passer</Text>
      </Pressable>

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          setActiveIndex(idx);
        }}
        style={styles.list}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={[styles.ctaWrap, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        <Pressable
          onPress={goNext}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaText}>{isLast ? "Commencer" : "Suivant"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  skipBtn: {
    position: "absolute",
    right: spacing.lg,
    zIndex: 10,
  },
  skipText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: colors.gray[400],
  },
  list: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing["3xl"],
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing["2xl"],
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: colors.gray[900],
    textAlign: "center",
    marginBottom: spacing.md,
  },
  body: {
    fontSize: 15,
    fontFamily: "NotoSans_400Regular",
    color: colors.gray[500],
    textAlign: "center",
    lineHeight: 23,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: radii.full,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.green[700],
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.gray[200],
  },
  ctaWrap: {
    paddingHorizontal: spacing["2xl"],
  },
  cta: {
    height: 52,
    borderRadius: radii.xl,
    backgroundColor: colors.green[700],
    alignItems: "center",
    justifyContent: "center",
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
    color: colors.white,
  },
});
