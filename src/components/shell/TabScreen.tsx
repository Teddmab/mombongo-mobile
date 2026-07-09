import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "@/theme";
import { useTabContentInsets } from "@/hooks/useSafeInsets";

export function TabScreen({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.root, style]}>
      {children}
    </View>
  );
}

/** À passer dans contentContainerStyle d'un ScrollView dans un onglet */
export function useTabScrollPadding() {
  const { bottom } = useTabContentInsets();
  return { paddingBottom: bottom };
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
});
