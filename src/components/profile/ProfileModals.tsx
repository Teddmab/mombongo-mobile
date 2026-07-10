import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BottomSheetShell } from "@/components/ui/BottomSheetShell";
import { useApp, type Lang } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { colors, radii, spacing } from "@/theme";

const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: "fr", label: "Français", flag: "🇫🇷" },
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "ln", label: "Lingala", flag: "🌍" },
];

function SheetModal({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <BottomSheetShell visible={visible} onClose={onClose} title={title} scroll={false}>
      {children}
    </BottomSheetShell>
  );
}

export function EditProfileModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { lang, setLang } = useApp();
  const { user, userProfile } = useAuth();
  const [name, setName] = useState(user?.displayName || userProfile?.displayName || "");
  const [email, setEmail] = useState(user?.email || userProfile?.email || "");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (visible) {
      setName(user?.displayName || userProfile?.displayName || "");
      setEmail(user?.email || userProfile?.email || "");
    }
  }, [visible, user, userProfile]);

  return (
    <SheetModal visible={visible} onClose={onClose} title="Modifier le profil">
      <View style={styles.field}>
        <Text style={styles.label}>Nom complet</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Téléphone</Text>
        <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Langue</Text>
        <View style={styles.langRow}>
          {LANGS.map((l) => (
            <Pressable
              key={l.id}
              onPress={() => setLang(l.id)}
              style={[styles.langBtn, lang === l.id && styles.langBtnActive]}
            >
              <Text style={styles.langFlag}>{l.flag}</Text>
              <Text style={[styles.langLabel, lang === l.id && styles.langLabelActive]}>{l.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onClose} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>
        <Pressable onPress={onClose} style={styles.saveBtn}>
          <Text style={styles.saveText}>Enregistrer</Text>
        </Pressable>
      </View>
    </SheetModal>
  );
}

export function WalletActionModal({
  visible,
  onClose,
  mode,
  currentBalance,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  mode: "deposit" | "withdraw";
  currentBalance: number;
  onSuccess: (amount: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const title = mode === "deposit" ? "Recharger le wallet" : "Retirer des fonds";
  const QUICK = [50, 100, 250, 500];

  const confirm = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    if (mode === "withdraw" && n > currentBalance) return;
    onSuccess(n);
    setAmount("");
    onClose();
  };

  return (
    <SheetModal visible={visible} onClose={onClose} title={title}>
      <Text style={styles.balanceHint}>Solde : ${currentBalance.toFixed(2)}</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="Montant USD"
        placeholderTextColor={colors.gray[400]}
        style={styles.input}
      />
      <View style={styles.quickRow}>
        {QUICK.map((q) => (
          <Pressable key={q} onPress={() => setAmount(String(q))} style={styles.quickBtn}>
            <Text style={styles.quickText}>${q}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={confirm} style={styles.saveBtn}>
        <Text style={styles.saveText}>Confirmer</Text>
      </Pressable>
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.md },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[500],
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    height: 44,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    fontSize: 13,
    color: colors.gray[900],
  },
  langRow: { flexDirection: "row", gap: spacing.sm },
  langBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  langBtnActive: {
    borderColor: colors.green[700],
    backgroundColor: colors.green[50],
  },
  langFlag: { fontSize: 18 },
  langLabel: { fontSize: 11, fontWeight: "700", color: colors.gray[600], marginTop: 4 },
  langLabelActive: { color: colors.green[700] },
  actions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontSize: 13, fontWeight: "700", color: colors.gray[600] },
  saveBtn: {
    flex: 1,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.green[700],
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  saveText: { fontSize: 13, fontWeight: "700", color: colors.white },
  balanceHint: { fontSize: 12, color: colors.gray[500], marginBottom: spacing.sm },
  quickRow: { flexDirection: "row", gap: spacing.sm, marginVertical: spacing.md, flexWrap: "wrap" },
  quickBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.green[50],
    borderWidth: 1,
    borderColor: colors.green[200],
  },
  quickText: { fontSize: 12, fontWeight: "700", color: colors.green[700] },
});
