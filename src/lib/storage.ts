import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  lang: "mb_lang",
  role: "mb_role",
} as const;

export async function getStoredLang(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.lang);
}

export async function setStoredLang(lang: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.lang, lang);
}

export async function getStoredRole(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.role);
}

export async function setStoredRole(role: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.role, role);
}
