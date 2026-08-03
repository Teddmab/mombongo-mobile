import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useAcceptPrice,
  useGenerateContract,
  useProposePrice,
  type BourseMatch,
} from "@/hooks/useProductListings";
import { firebaseErrorMessage } from "@/services/actions.service";
import { colors, radii, spacing } from "@/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  match: BourseMatch | null;
  role: "buyer" | "seller";
  onContractReady?: (contractId: string) => void;
}

export function NegotiationModal({
  visible,
  onClose,
  match,
  role,
  onContractReady,
}: Props) {
  const insets = useSafeAreaInsets();
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const propose = useProposePrice();
  const accept = useAcceptPrice();
  const generate = useGenerateContract();

  if (!match) return null;

  const lastNeg = match.negotiations?.[0];
  const agreed = match.status === "agreed" || match.status === "contracted";

  const submitPropose = async () => {
    if (!price) return;
    try {
      await propose.mutateAsync({
        matchId: match.id,
        proposedPricePerKgCdf: Number(price),
        message,
      });
      setPrice("");
      setMessage("");
      Alert.alert("Mombongo", "Proposition envoyée");
    } catch (err) {
      Alert.alert("Mombongo", firebaseErrorMessage(err, "Échec de la proposition"));
    }
  };

  const submitAccept = async () => {
    try {
      await accept.mutateAsync({
        matchId: match.id,
        negotiationId: lastNeg?.id,
      });
      Alert.alert("Mombongo", "Prix accepté");
    } catch (err) {
      Alert.alert("Mombongo", firebaseErrorMessage(err, "Impossible d'accepter"));
    }
  };

  const submitContract = async () => {
    try {
      const { contractId } = await generate.mutateAsync({ matchId: match.id });
      onContractReady?.(contractId);
      onClose();
    } catch (err) {
      Alert.alert("Mombongo", firebaseErrorMessage(err, "Impossible de générer le contrat"));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Négociation — {match.commodity}</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={18} color={colors.gray[600]} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.meta}>
            {match.quantityKg} kg · Ask {match.sellerPricePerKgCdf ?? "—"} FC/kg · Max{" "}
            {match.buyerMaxPricePerKgCdf ?? "—"} FC/kg
          </Text>

          <Text style={styles.section}>Historique</Text>
          {(match.negotiations ?? []).length === 0 ? (
            <Text style={styles.empty}>Aucune proposition encore</Text>
          ) : (
            (match.negotiations ?? []).map((n) => (
              <View key={n.id} style={styles.negRow}>
                <Text style={styles.negRole}>{n.proposedBy === "seller" ? "Vendeur" : "Acheteur"}</Text>
                <Text style={styles.negPrice}>{n.proposedPricePerKgCdf} FC/kg</Text>
                {n.message ? <Text style={styles.negMsg}>{n.message}</Text> : null}
              </View>
            ))
          )}

          {agreed ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>
                Accord à {match.agreedPricePerKgCdf ?? lastNeg?.proposedPricePerKgCdf} FC/kg
              </Text>
              <Pressable
                onPress={submitContract}
                disabled={generate.isPending}
                style={styles.primaryBtn}
              >
                {generate.isPending ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.primaryText}>Générer le contrat</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <>
              {lastNeg && lastNeg.proposedBy !== role ? (
                <Pressable
                  onPress={submitAccept}
                  disabled={accept.isPending}
                  style={[styles.primaryBtn, { backgroundColor: colors.green[700] }]}
                >
                  {accept.isPending ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.primaryText}>
                      Accepter {lastNeg.proposedPricePerKgCdf} FC/kg
                    </Text>
                  )}
                </Pressable>
              ) : null}

              <Text style={styles.section}>Proposer un prix</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                keyboardType="number-pad"
                placeholder="FC / kg"
                placeholderTextColor={colors.gray[400]}
                style={styles.input}
              />
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Message (optionnel)"
                placeholderTextColor={colors.gray[400]}
                style={styles.input}
              />
              <Pressable
                onPress={submitPropose}
                disabled={propose.isPending || !price}
                style={styles.primaryBtn}
              >
                {propose.isPending ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.primaryText}>Envoyer la proposition</Text>
                )}
              </Pressable>
            </>
          )}
        </ScrollView>
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
    maxHeight: "88%",
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
  title: { fontSize: 16, fontWeight: "800", color: colors.gray[900], flex: 1 },
  body: { gap: spacing.md, paddingBottom: spacing.xl },
  meta: { fontSize: 12, color: colors.gray[500] },
  section: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.gray[400],
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  empty: { fontSize: 13, color: colors.gray[400] },
  negRow: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 4,
  },
  negRole: { fontSize: 11, fontWeight: "700", color: colors.gray[500] },
  negPrice: { fontSize: 14, fontWeight: "800", color: colors.gray[900] },
  negMsg: { fontSize: 12, color: colors.gray[600] },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.gray[900],
  },
  primaryBtn: {
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.purple[700],
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  successBox: {
    backgroundColor: colors.green[50],
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  successTitle: { fontSize: 14, fontWeight: "800", color: colors.green[700] },
});
