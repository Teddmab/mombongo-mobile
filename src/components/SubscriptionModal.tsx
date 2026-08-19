import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PaymentModal } from "@/components/PaymentModal";
import { BottomSheetShell } from "@/components/ui/BottomSheetShell";
import { useAuth } from "@/hooks/useAuth";
import { colors, radii, spacing } from "@/theme";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  badge?: string;
  features: string[];
  ctaLabel: string;
  free?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "gratuit",
    name: "Gratuit",
    price: 0,
    period: "mois",
    description: "Pour découvrir Mombongo",
    icon: "sparkles-outline",
    iconBg: colors.gray[100],
    iconColor: colors.gray[500],
    features: [
      "Consulter le marché",
      "3 investissements / mois",
      "Academia (cours de base)",
      "Tableau de bord basique",
    ],
    ctaLabel: "Plan actuel",
    free: true,
  },
  {
    id: "investisseur",
    name: "Investisseur",
    price: 9.99,
    period: "mois",
    description: "Pour les investisseurs actifs",
    icon: "flash-outline",
    iconBg: colors.green[50],
    iconColor: colors.green[700],
    badge: "Populaire",
    features: [
      "Investissements illimités",
      "Alertes ROI temps réel",
      "Rapports mensuels détaillés",
      "Academia complète",
      "Support prioritaire",
    ],
    ctaLabel: "S'abonner",
  },
  {
    id: "premium",
    name: "Premium",
    price: 24.99,
    period: "mois",
    description: "Tout l'écosystème Mombongo",
    icon: "star-outline",
    iconBg: colors.amber[50],
    iconColor: colors.amber[700],
    badge: "Best value",
    features: [
      "Tout Investisseur +",
      "Accès Bourse complet",
      "Analyses avancées & IA",
      "Gestionnaire dédié",
      "Accès agents terrain",
      "Financement prioritaire",
    ],
    ctaLabel: "S'abonner",
  },
  {
    id: "cooperative",
    name: "Coopérative",
    price: 49.99,
    period: "mois",
    description: "Pour les équipes & coopératives",
    icon: "business-outline",
    iconBg: "#EFF6FF",
    iconColor: "#2563EB",
    features: [
      "Tout Premium +",
      "5 comptes membres inclus",
      "Rapports coopérative",
      "API & intégrations",
      "Formation terrain dédiée",
      "Contrat personnalisé",
    ],
    ctaLabel: "S'abonner",
  },
];

export function SubscriptionModal({
  visible,
  onClose,
  currentPlanId = "gratuit",
  walletBalance: walletBalanceProp,
}: {
  visible: boolean;
  onClose: () => void;
  currentPlanId?: string;
  walletBalance?: number;
}) {
  const { userProfile, refreshProfile } = useAuth();
  const walletBalance = walletBalanceProp ?? userProfile?.walletUsd ?? 0;
  const [payPlan, setPayPlan] = useState<SubscriptionPlan | null>(null);

  return (
    <>
      <BottomSheetShell
        visible={visible}
        onClose={onClose}
        title="Choisir votre plan"
        subtitle="Accédez à toutes les fonctionnalités Mombongo"
        scroll={false}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.plans}>
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <View
                key={plan.id}
                style={[styles.planCard, isCurrent && styles.planCardCurrent]}
              >
                {plan.badge ? (
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{plan.badge}</Text>
                  </View>
                ) : null}
                {isCurrent ? (
                  <View style={[styles.planBadge, styles.planBadgeCurrent]}>
                    <Text style={styles.planBadgeText}>Actuel</Text>
                  </View>
                ) : null}

                <View style={styles.planTop}>
                  <View style={[styles.planIcon, { backgroundColor: plan.iconBg }]}>
                    <Ionicons name={plan.icon} size={20} color={plan.iconColor} />
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDesc}>{plan.description}</Text>
                  </View>
                  <View style={styles.planPrice}>
                    {plan.price === 0 ? (
                      <Text style={styles.planPriceValue}>Gratuit</Text>
                    ) : (
                      <>
                        <Text style={styles.planPriceValue}>${plan.price}</Text>
                        <Text style={styles.planPricePeriod}>/ {plan.period}</Text>
                      </>
                    )}
                  </View>
                </View>

                {plan.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.green[600]} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}

                <Pressable
                  disabled={plan.free || isCurrent}
                  onPress={() => setPayPlan(plan)}
                  style={[
                    styles.planCta,
                    isCurrent && styles.planCtaCurrent,
                    plan.free && styles.planCtaDisabled,
                    plan.id === "premium" && !isCurrent && !plan.free && styles.planCtaPremium,
                  ]}
                >
                  <Text
                    style={[
                      styles.planCtaText,
                      isCurrent && styles.planCtaTextCurrent,
                      plan.free && styles.planCtaTextDisabled,
                      plan.id === "premium" && !isCurrent && !plan.free && styles.planCtaTextPremium,
                    ]}
                  >
                    {isCurrent ? "✓ Plan actuel" : plan.ctaLabel}
                  </Text>
                </Pressable>
              </View>
            );
          })}
          <Text style={styles.footerNote}>
            Annulation à tout moment · Paiement sécurisé · Aucun engagement
          </Text>
        </ScrollView>
      </BottomSheetShell>

      <PaymentModal
        visible={!!payPlan}
        onClose={() => setPayPlan(null)}
        type="subscribe"
        title={`Abonnement ${payPlan?.name ?? ""}`}
        subtitle={`${payPlan?.name ?? ""} · $${payPlan?.price ?? 0}/mois`}
        amount={payPlan?.price ?? 0}
        currency="USD"
        walletBalance={walletBalance}
        referenceId={payPlan?.id}
        onSuccess={() => {
          void refreshProfile();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  plans: { gap: spacing.md, paddingBottom: spacing.lg },
  planCard: {
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  planCardCurrent: { borderColor: colors.green[700] },
  planBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.green[700],
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 4,
  },
  planBadgeCurrent: { backgroundColor: colors.green[700] },
  planBadgeText: { fontSize: 10, fontWeight: "800", color: colors.white },
  planTop: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  planIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  planInfo: { flex: 1 },
  planName: { fontSize: 15, fontWeight: "800", color: colors.gray[900] },
  planDesc: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  planPrice: { alignItems: "flex-end" },
  planPriceValue: { fontSize: 18, fontWeight: "800", color: colors.gray[900] },
  planPricePeriod: { fontSize: 10, color: colors.gray[400] },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 12, color: colors.gray[700], flex: 1 },
  planCta: {
    marginTop: spacing.sm,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.green[700],
    alignItems: "center",
    justifyContent: "center",
  },
  planCtaCurrent: {
    backgroundColor: colors.green[50],
    borderWidth: 1,
    borderColor: colors.green[200],
  },
  planCtaDisabled: { backgroundColor: colors.gray[100] },
  planCtaPremium: { backgroundColor: colors.amber[400] },
  planCtaText: { fontSize: 13, fontWeight: "800", color: colors.white },
  planCtaTextCurrent: { color: colors.green[700] },
  planCtaTextDisabled: { color: colors.gray[400] },
  planCtaTextPremium: { color: colors.amber[900] },
  footerNote: {
    textAlign: "center",
    fontSize: 11,
    color: colors.gray[400],
    marginTop: spacing.sm,
  },
});
