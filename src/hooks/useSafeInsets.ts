import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TAB_BAR_HEIGHT } from "@/constants/layout";

/** Padding bas pour le contenu scrollable sous header fixe + tab bar */
export function useTabContentInsets() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return {
    top: 0,
    bottom: TAB_BAR_HEIGHT + bottomInset + 8,
    bottomInset,
    tabBarHeight: TAB_BAR_HEIGHT + bottomInset,
  };
}

/** Padding safe area pour écrans plein écran (language, auth, stack) */
export function useFullScreenInsets() {
  const insets = useSafeAreaInsets();
  return {
    top: Math.max(insets.top, 12),
    bottom: Math.max(insets.bottom, 12),
    left: insets.left,
    right: insets.right,
  };
}
