import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFullScreenInsets } from "@/hooks/useSafeInsets";
import { colors } from "@/theme";

export function LoadingScreen() {
  const { top, bottom } = useFullScreenInsets();

  return (
    <View
      style={[styles.root, { paddingTop: top, paddingBottom: bottom }]}
      testID="loading-screen"
    >
      <ActivityIndicator size="large" color={colors.white} />
      <Text style={styles.label}>Mombongo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.green[700],
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
