import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { Ionicons } from "@expo/vector-icons";
import {
  useConfirmDelivery,
  useConfirmShipment,
  useFundEscrow,
  useSignContract,
  type BourseContract,
} from "@/hooks/useProductListings";
import { functions } from "@/lib/firebase";
import { isDevMode } from "@/lib/dev";
import { firebaseErrorMessage } from "@/services/actions.service";
import { colors, radii, spacing } from "@/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  contractId: string | null;
  role: "buyer" | "seller";
  walletCdf?: number;
}

export function ContractModal({
  visible,
  onClose,
  contractId,
  role,
  walletCdf = 0,
}: Props) {
  const insets = useSafeAreaInsets();
  const [accepted, setAccepted] = useState(false);
  const sign = useSignContract();
  const fund = useFundEscrow();
  const ship = useConfirmShipment();
  const deliver = useConfirmDelivery();

  const { data: contract, refetch, isLoading } = useQuery({
    queryKey: ["contract", contractId],
    enabled: visible && !!contractId,
    queryFn: async (): Promise<BourseContract | null> => {
      if (!contractId) return null;
      if (isDevMode()) {
        return {
          id: contractId,
          matchId: "m1",
          sellerId: "s1",
          buyerId: "b1",
          commodity: "Maïs",
          quantityKg: 1000,
          pricePerKgCdf: 400,
          totalCdf: 400_000,
          deliveryLocation: "À confirmer",
          paymentTerms: "escrow",
          status: "pending_signatures",
          escrowStatus: null,
          sellerSignedAt: null,
          buyerSignedAt: null,
          createdAt: new Date().toISOString(),
        };
      }
      const call = httpsCallable<{ contractId: string }, { contract: BourseContract }>(
        functions,
        "getContract",
      );
      return (await call({ contractId })).data.contract;
    },
  });

  useEffect(() => {
    if (visible) setAccepted(false);
  }, [visible, contractId]);

  const run = async (fn: () => Promise<unknown>, okMsg: string) => {
    try {
      await fn();
      await refetch();
      Alert.alert("Mombongo", okMsg);
    } catch (err) {
      Alert.alert("Mombongo", firebaseErrorMessage(err, "Action impossible"));
    }
  };

  const iSigned =
    role === "seller" ? !!contract?.sellerSignedAt : !!contract?.buyerSignedAt;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Contrat de vente</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={18} color={colors.gray[600]} />
          </Pressable>
        </View>

        {isLoading || !contract ? (
          <ActivityIndicator style={{ margin: 24 }} color={colors.green[700]} />
        ) : (
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.line}>
              {contract.commodity} · {contract.quantityKg} kg
            </Text>
            <Text style={styles.line}>
              {contract.pricePerKgCdf} FC/kg · Total {contract.totalCdf.toLocaleString()} FC
            </Text>
            <Text style={styles.meta}>Paiement : séquestre · {contract.deliveryLocation}</Text>
            <Text style={styles.status}>Statut : {contract.status}</Text>

            {contract.status === "pending_signatures" && !iSigned ? (
              <>
                <Pressable
                  onPress={() => setAccepted((v) => !v)}
                  style={styles.checkRow}
                >
                  <Ionicons
                    name={accepted ? "checkbox" : "square-outline"}
                    size={22}
                    color={colors.green[700]}
                  />
                  <Text style={styles.checkText}>
                    Je certifie avoir lu et j&apos;accepte les termes du contrat
                  </Text>
                </Pressable>
                <Pressable
                  disabled={!accepted || sign.isPending}
                  onPress={() =>
                    run(() => sign.mutateAsync({ contractId: contract.id }), "Contrat signé")
                  }
                  style={[styles.btn, !accepted && styles.btnDisabled]}
                >
                  {sign.isPending ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.btnText}>Signer le contrat</Text>
                  )}
                </Pressable>
              </>
            ) : null}

            {contract.status === "pending_signatures" && iSigned ? (
              <Text style={styles.wait}>En attente de la signature de l&apos;autre partie…</Text>
            ) : null}

            {contract.status === "active" && role === "buyer" && contract.escrowStatus !== "funded" ? (
              <>
                <Text style={styles.meta}>
                  Solde wallet : {walletCdf.toLocaleString()} FC. Les fonds seront libérés à la
                  confirmation de livraison.
                </Text>
                <Pressable
                  disabled={fund.isPending}
                  onPress={() =>
                    run(
                      () => fund.mutateAsync({ contractId: contract.id, method: "wallet" }),
                      "Séquestre financé",
                    )
                  }
                  style={styles.btn}
                >
                  {fund.isPending ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.btnText}>Financer le séquestre (wallet)</Text>
                  )}
                </Pressable>
              </>
            ) : null}

            {contract.status === "active" && role === "seller" && contract.escrowStatus !== "funded" ? (
              <Text style={styles.wait}>En attente du paiement de l&apos;acheteur…</Text>
            ) : null}

            {contract.escrowStatus === "funded" &&
            contract.status === "active" &&
            role === "seller" ? (
              <Pressable
                disabled={ship.isPending}
                onPress={() =>
                  run(
                    () => ship.mutateAsync({ contractId: contract.id }),
                    "Expédition confirmée",
                  )
                }
                style={styles.btn}
              >
                {ship.isPending ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.btnText}>Confirmer l&apos;expédition</Text>
                )}
              </Pressable>
            ) : null}

            {contract.status === "shipped" && role === "buyer" ? (
              <Pressable
                disabled={deliver.isPending}
                onPress={() =>
                  run(
                    () => deliver.mutateAsync({ contractId: contract.id }),
                    "Livraison confirmée — fonds libérés",
                  )
                }
                style={styles.btn}
              >
                {deliver.isPending ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.btnText}>Confirmer la réception</Text>
                )}
              </Pressable>
            ) : null}

            {contract.status === "fulfilled" ? (
              <View style={styles.done}>
                <Ionicons name="checkmark-circle" size={40} color={colors.green[700]} />
                <Text style={styles.doneText}>
                  Fonds libérés — {contract.totalCdf.toLocaleString()} FC
                </Text>
              </View>
            ) : null}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "90%",
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[200],
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  title: { fontSize: 16, fontWeight: "800", color: colors.gray[900] },
  body: { gap: spacing.md, paddingBottom: spacing.xl },
  line: { fontSize: 14, fontWeight: "700", color: colors.gray[900] },
  meta: { fontSize: 12, color: colors.gray[500] },
  status: { fontSize: 12, fontWeight: "700", color: colors.amber[700] },
  checkRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  checkText: { flex: 1, fontSize: 13, color: colors.gray[700] },
  btn: {
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.green[700],
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  wait: { fontSize: 13, color: colors.gray[500], fontStyle: "italic" },
  done: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.lg },
  doneText: { fontSize: 14, fontWeight: "800", color: colors.green[700], textAlign: "center" },
});
