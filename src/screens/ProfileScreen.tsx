import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { EditProfileModal } from "@/components/profile/ProfileModals";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { resetOnboarding } from "@/screens/OnboardingScreen";
import { DepositModal, WithdrawModal } from "@/components/wallet/WalletModals";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { SCREEN_HORIZONTAL_PADDING } from "@/constants/layout";
import { useApp, type Role } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions, type Transaction } from "@/hooks/useTransactions";
import { useQueryClient } from "@tanstack/react-query";
import { colors, radii, spacing } from "@/theme";

interface RolePlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
  ctaLabel: string;
}

const ROLE_PLANS: Record<Role, RolePlan> = {
  investor: {
    id: "investisseur",
    name: "Investisseur",
    price: 9.99,
    period: "mois",
    description: "Pour les investisseurs actifs",
    features: [
      "Investissements illimités",
      "Alertes ROI temps réel",
      "Rapports mensuels détaillés",
      "Academia complète",
      "Support prioritaire",
    ],
    icon: "flash-outline",
    badge: "Populaire",
    ctaLabel: "Changer de plan",
  },
  farmer: {
    id: "agriculteur",
    name: "Agriculteur Essentiel",
    price: 4.99,
    period: "mois",
    description: "Pour les agriculteurs en croissance",
    features: [
      "Publier jusqu'à 5 produits / mois",
      "Accès aux investisseurs",
      "Suivi de financement en temps réel",
      "Academia agricole complète",
      "Support agent terrain inclus",
    ],
    icon: "leaf-outline",
    ctaLabel: "Mettre à niveau",
  },
  agent: {
    id: "agent-pro",
    name: "Agent Pro",
    price: 7.99,
    period: "mois",
    description: "Pour les agents de terrain",
    features: [
      "Jusqu'à 15 agriculteurs",
      "Rapports terrain illimités",
      "Alertes prix en temps réel",
      "Tableau de bord agent complet",
      "Formation & certification",
    ],
    icon: "clipboard-outline",
    badge: "Pro",
    ctaLabel: "Gérer le plan",
  },
  merchant: {
    id: "premium",
    name: "Premium",
    price: 24.99,
    period: "mois",
    description: "Tout l'écosystème Mombongo",
    features: [
      "Accès Bourse complet",
      "Analyses avancées",
      "Gestionnaire dédié",
      "Accès agents terrain",
      "Financement prioritaire",
    ],
    icon: "star-outline",
    badge: "Best value",
    ctaLabel: "Gérer le plan",
  },
};

const ROLE_WALLET: Record<
  Role,
  { label: string; initialBalance: number; sub: string; showActions: boolean }
> = {
  investor: {
    label: "Wallet investisseur",
    initialBalance: 1245.8,
    sub: "Disponible · USD",
    showActions: true,
  },
  farmer: {
    label: "Mon financement",
    initialBalance: 650,
    sub: "Reçu sur $1,000 objectif · 65%",
    showActions: false,
  },
  agent: {
    label: "Compte professionnel",
    initialBalance: 320,
    sub: "Commissions ce mois",
    showActions: false,
  },
  merchant: {
    label: "Wallet",
    initialBalance: 2100,
    sub: "Disponible · USD",
    showActions: true,
  },
};

const KIND_TX: Record<Transaction["kind"], { color: string; prefix: string }> = {
  deposit: { color: colors.green[700], prefix: "+" },
  profit: { color: colors.green[700], prefix: "+" },
  investment: { color: colors.gray[900], prefix: "−" },
  withdrawal: { color: "#EA580C", prefix: "−" },
  fee: { color: colors.gray[500], prefix: "−" },
};

function fmtBal(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function roleLabelKey(role: Role): string {
  if (role === "merchant") return "role.trader";
  return `role.${role}`;
}

function TxRow({ tx }: { tx: Transaction }) {
  const meta = KIND_TX[tx.kind];
  const amt =
    tx.currency === "USD"
      ? `$${tx.amount.toLocaleString()}`
      : `${tx.amount.toLocaleString()} FC`;

  return (
    <View style={styles.txRow}>
      <View style={styles.txBody}>
        <Text style={styles.txLabel}>{tx.label}</Text>
        <Text style={styles.txDate}>{tx.date}</Text>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color: meta.color }]}>
          {meta.prefix}
          {amt}
        </Text>
        <Text style={styles.txStatus}>
          {tx.status === "pending" ? "EN ATTENTE" : "Confirmé"}
        </Text>
      </View>
    </View>
  );
}

export function ProfileScreen() {
  const { role } = useApp();
  const { t } = useTranslation();
  const { user, userProfile, signOut, refreshProfile } = useAuth();
  const { data: transactions = [] } = useTransactions();
  const qc = useQueryClient();
  const router = useRouter();
  const scrollPadding = useTabScrollPadding();

  const displayName = user?.displayName || userProfile?.displayName || t("common.unknown");
  const email = user?.email || userProfile?.email || "";
  const activeRole = (userProfile?.role as Role) || role;

  const currentPlan = ROLE_PLANS[role] ?? ROLE_PLANS.investor;
  const walletCfg = ROLE_WALLET[role] ?? ROLE_WALLET.investor;

  const [balance, setBalance] = useState(
    userProfile?.walletUsd ?? walletCfg.initialBalance,
  );
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (userProfile?.walletUsd != null) {
      setBalance(userProfile.walletUsd);
    }
  }, [userProfile?.walletUsd]);

  const handleLogout = async () => {
    await signOut();
    router.replace("/language");
  };

  const soon = (msg: string) => Alert.alert("Mombongo", msg);

  return (
    <TabScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, scrollPadding]}
        testID="profile-screen"
      >
        <View style={styles.profileCard}>
          <UserAvatar photoURL={user?.photoURL} displayName={displayName} size="sm" />
          <View style={styles.profileBody}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{t(roleLabelKey(activeRole))}</Text>
            </View>
          </View>
          <Pressable onPress={() => setEditOpen(true)} style={styles.editBtn}>
            <Ionicons name="pencil" size={16} color={colors.gray[600]} />
          </Pressable>
        </View>

        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <Ionicons name="wallet-outline" size={16} color={colors.amber[400]} />
            <Text style={styles.walletLabel}>{walletCfg.label}</Text>
          </View>
          <Text style={styles.walletBalance}>{fmtBal(balance)}</Text>
          <Text style={styles.walletSub}>{walletCfg.sub}</Text>

          {walletCfg.showActions ? (
            <View style={styles.walletActions}>
              <Pressable onPress={() => setDepositOpen(true)} style={styles.depositBtn}>
                <Ionicons name="arrow-down" size={14} color={colors.amber[900]} />
                <Text style={styles.depositText}>{t("profile.deposit")}</Text>
              </Pressable>
              <Pressable onPress={() => setWithdrawOpen(true)} style={styles.withdrawBtn}>
                <Ionicons name="arrow-up" size={14} color={colors.white} />
                <Text style={styles.withdrawText}>{t("profile.withdraw")}</Text>
              </Pressable>
            </View>
          ) : role === "farmer" ? (
            <View style={styles.farmerProgress}>
              <View style={styles.farmerTrack}>
                <View style={[styles.farmerFill, { width: "65%" }]} />
              </View>
              <Text style={styles.farmerProgressText}>65% de l'objectif atteint</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>Transactions</Text>
        <View style={styles.txCard}>
          {transactions.slice(0, 5).map((tx) => (
            <TxRow key={tx.id} tx={tx} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>{t("profile.accountSection")}</Text>
        <View style={styles.menuCard}>
          {[
            {
              icon: "notifications-outline" as const,
              label: t("profile.notifications"),
              badge: "3",
              action: () => router.push("/notifications" as never),
            },
            {
              icon: "shield-checkmark-outline" as const,
              label: t("profile.kyc"),
              action: () => soon("Vérification KYC — bientôt disponible"),
            },
            {
              icon: "document-text-outline" as const,
              label: t("profile.documents"),
              action: () => soon("Mes documents — bientôt disponible"),
            },
            {
              icon: "help-circle-outline" as const,
              label: t("profile.help"),
              action: () => router.push("/aide" as never),
            },
            {
              icon: "play-circle-outline" as const,
              label: "Revoir le tutoriel",
              action: () => void resetOnboarding(),
            },
          ].map((item, idx, arr) => (
            <Pressable
              key={item.label}
              onPress={item.action}
              style={[styles.menuRow, idx < arr.length - 1 && styles.menuBorder]}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={16} color={colors.gray[700]} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.badge ? (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{item.badge}</Text>
                </View>
              ) : null}
              <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Abonnement</Text>
        <Pressable onPress={() => setSubOpen(true)} style={styles.subCard}>
          <View style={styles.subTop}>
            <View style={styles.subIcon}>
              <Ionicons name={currentPlan.icon} size={20} color={colors.amber[400]} />
            </View>
            <View style={styles.subBody}>
              <View style={styles.subTitleRow}>
                <Text style={styles.subTitle}>
                  {currentPlan.name} · ${currentPlan.price}/{currentPlan.period}
                </Text>
                {currentPlan.badge ? (
                  <View style={styles.subBadge}>
                    <Text style={styles.subBadgeText}>{currentPlan.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.subDesc}>{currentPlan.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
          </View>
          <View style={styles.subFeatures}>
            {currentPlan.features.map((f) => (
              <Text key={f} style={styles.subFeature}>
                <Text style={styles.subCheck}>✓ </Text>
                {f}
              </Text>
            ))}
          </View>
        </Pressable>

        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={16} color={colors.danger} />
          <Text style={styles.logoutText}>{t("profile.logout")}</Text>
        </Pressable>
      </ScrollView>

      <EditProfileModal visible={editOpen} onClose={() => setEditOpen(false)} />
      <DepositModal
        visible={depositOpen}
        onClose={() => setDepositOpen(false)}
        currentBalance={balance}
        onSuccess={(a) => {
          setBalance((b) => b + a);
          void refreshProfile();
          void qc.invalidateQueries({ queryKey: ["transactions"] });
        }}
      />
      <WithdrawModal
        visible={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        currentBalance={balance}
        onSuccess={(a) => {
          setBalance((b) => b - a);
          void refreshProfile();
          void qc.invalidateQueries({ queryKey: ["transactions"] });
        }}
      />
      <SubscriptionModal
        visible={subOpen}
        onClose={() => setSubOpen(false)}
        currentPlanId={currentPlan.id}
      />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  profileBody: { flex: 1 },
  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  profileEmail: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  roleBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    backgroundColor: colors.green[50],
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.green[700],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  walletCard: {
    backgroundColor: colors.green[700],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  walletHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  walletLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  walletBalance: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.white,
    marginTop: 4,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  walletSub: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  walletActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  depositBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.amber[400],
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
  },
  depositText: { fontSize: 12, fontWeight: "700", color: colors.amber[900] },
  withdrawBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
  },
  withdrawText: { fontSize: 12, fontWeight: "700", color: colors.white },
  farmerProgress: { marginTop: spacing.md },
  farmerTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  farmerFill: { height: "100%", backgroundColor: colors.white, borderRadius: 4 },
  farmerProgressText: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  txCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
  },
  txBody: { flex: 1, minWidth: 0 },
  txLabel: { fontSize: 13, fontWeight: "600", color: colors.gray[900] },
  txDate: { fontSize: 11, color: colors.gray[400], marginTop: 2 },
  txRight: { alignItems: "flex-end" },
  txAmount: { fontSize: 13, fontWeight: "700" },
  txStatus: { fontSize: 9, color: colors.gray[400], marginTop: 2 },
  menuCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.gray[900] },
  notifBadge: {
    backgroundColor: colors.danger,
    borderRadius: radii.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  notifBadgeText: { fontSize: 9, fontWeight: "800", color: colors.white },
  subCard: {
    backgroundColor: colors.gray[900],
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  subTop: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  subIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  subBody: { flex: 1, minWidth: 0 },
  subTitleRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  subTitle: { fontSize: 13, fontWeight: "700", color: colors.white },
  subBadge: {
    backgroundColor: colors.amber[400],
    borderRadius: radii.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  subBadgeText: { fontSize: 9, fontWeight: "800", color: colors.amber[900] },
  subDesc: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  subFeatures: { marginTop: spacing.sm, gap: 4 },
  subFeature: { fontSize: 10, color: "rgba(255,255,255,0.5)" },
  subCheck: { color: colors.success },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 48,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: radii.lg,
    marginTop: spacing.xs,
  },
  logoutText: { fontSize: 13, fontWeight: "700", color: colors.danger },
});
