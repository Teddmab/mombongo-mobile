import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@/theme";

export function StackHeader({ title }: { title: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, 10) }]}>
      <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
        <Ionicons name="chevron-back" size={22} color={colors.green[700]} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    paddingHorizontal: spacing.xs,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: colors.green[700],
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  spacer: { width: 40 },
});
