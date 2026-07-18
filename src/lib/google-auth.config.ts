import Constants from "expo-constants";
import { Platform } from "react-native";

/** IDs OAuth Google — Firebase / Google Cloud Console */
export function getGoogleOAuthConfig() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  return {
    webClientId,
    iosClientId,
    androidClientId,
  };
}

/** Scheme iOS = client ID iOS (ou web) inversé : xxx.apps.googleusercontent.com → com.googleusercontent.apps.xxx */
export function getGoogleIosUrlScheme(): string | undefined {
  const { iosClientId, webClientId } = getGoogleOAuthConfig();
  const clientId = iosClientId || webClientId;
  if (!clientId?.endsWith(".apps.googleusercontent.com")) return undefined;
  const prefix = clientId.replace(/\.apps\.googleusercontent\.com$/, "");
  return `com.googleusercontent.apps.${prefix}`;
}

export function isGoogleSignInConfigured(): boolean {
  return Boolean(getGoogleOAuthConfig().webClientId);
}

/** Expo Go n’embarque pas le module natif Google Sign-In */
export function isExpoGo(): boolean {
  return Constants.appOwnership === "expo";
}

export function isNativeGoogleSignInAvailable(): boolean {
  if (isExpoGo()) return false;
  // Web / plateformes non supportées
  if (Platform.OS !== "ios" && Platform.OS !== "android") return false;
  return isGoogleSignInConfigured();
}
