import { useEffect, useRef } from "react";
import Constants from "expo-constants";
import { useAuth } from "@/hooks/useAuth";
import { registerFcmToken } from "@/services/actions.service";

type NotificationsModule = typeof import("expo-notifications");

function loadNotifications(): NotificationsModule | null {
  try {
    // Dynamic require: package may be missing in some environments / Expo Go limits
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications") as NotificationsModule;
  } catch {
    return null;
  }
}

async function resolvePushToken(Notifications: NotificationsModule): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  const projectId =
    Constants.easConfig?.projectId ??
    (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId;

  try {
    if (projectId) {
      const expoPush = await Notifications.getExpoPushTokenAsync({ projectId });
      if (expoPush?.data) return expoPush.data;
    }
  } catch {
    // Expo Go / missing native module — fall through to device token
  }

  try {
    const device = await Notifications.getDevicePushTokenAsync();
    const data = device?.data;
    return typeof data === "string" ? data : data != null ? String(data) : null;
  } catch {
    return null;
  }
}

/**
 * Enregistre le token push FCM/Expo pour l'utilisateur authentifié (hors sessions mock).
 * Échec silencieux si permissions refusées, Expo Go, ou module natif absent.
 */
export function usePushNotifications() {
  const { user, isAuthenticated } = useAuth();
  const registeredRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.uid.startsWith("dev-")) return;

    const Notifications = loadNotifications();
    if (!Notifications) return;

    let cancelled = false;

    (async () => {
      try {
        const token = await resolvePushToken(Notifications);
        if (!token || cancelled) return;
        if (registeredRef.current === token) return;
        await registerFcmToken(token);
        registeredRef.current = token;
      } catch {
        // Fail silently
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);
}
