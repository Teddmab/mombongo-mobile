import { Platform } from "react-native";

/** IDs OAuth Google — Firebase Console → Auth → Google → Web client ID */
export function getGoogleOAuthConfig() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  return {
    webClientId,
    /** Expo Go / dev : le web client ID suffit souvent comme fallback natif */
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? webClientId,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? webClientId,
  };
}

export function isGoogleSignInConfigured(): boolean {
  const { webClientId, iosClientId, androidClientId } = getGoogleOAuthConfig();
  if (!webClientId) return false;
  if (Platform.OS === "ios") return Boolean(iosClientId);
  if (Platform.OS === "android") return Boolean(androidClientId);
  return true;
}
