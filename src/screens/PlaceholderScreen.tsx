import { StyleSheet, Text, View } from "react-native";
import { TabScreen, useTabScrollPadding } from "@/components/shell/TabScreen";
import { colors, spacing } from "@/theme";

export function PlaceholderScreen({
  title,
  testID,
}: {
  title: string;
  testID: string;
}) {
  const scrollPadding = useTabScrollPadding();

  return (
    <TabScreen>
      <View
        testID={testID}
        style={[styles.root, { paddingBottom: scrollPadding.paddingBottom }]}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>À implémenter — prochaine étape</Text>
      </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing["2xl"],
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  sub: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: spacing.sm,
    fontFamily: "NotoSans_400Regular",
  },
});
