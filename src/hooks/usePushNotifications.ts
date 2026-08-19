import { useCallback, useEffect, useRef, useState } from "react";
import Constants from "expo-constants";
import { useAuth } from "@/hooks/useAuth";
import { registerFcmToken } from "@/services/actions.service";

type NotificationsModule = typeof import("expo-notifications");
export type PushPermissionStatus = "unknown" | "granted" | "denied" | "unavailable";

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

async function registerTokenIfNeeded(
  Notifications: NotificationsModule,
  registeredRef: { current: string | null },
): Promise<{ status: PushPermissionStatus; token: string | null }> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "denied") return { status: "denied", token: null };

    const token = await resolvePushToken(Notifications);
    if (!token) {
      const after = await Notifications.getPermissionsAsync();
      return {
        status:
          after.status === "granted"
            ? "granted"
            : after.status === "denied"
              ? "denied"
              : "unavailable",
        token: null,
      };
    }
    if (registeredRef.current !== token) {
      await registerFcmToken(token);
      registeredRef.current = token;
    }
    return { status: "granted", token };
  } catch {
    return { status: "unavailable", token: null };
  }
}

/**
 * Enregistre le token push FCM/Expo pour l'utilisateur authentifié (hors sessions mock).
 * Échec silencieux si permissions refusées, Expo Go, ou module natif absent.
 */
export function usePushNotifications() {
  const { user, isAuthenticated } = useAuth();
  const registeredRef = useRef<string | null>(null);
  const [permission, setPermission] = useState<PushPermissionStatus>("unknown");

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.uid.startsWith("dev-")) return;

    const Notifications = loadNotifications();
    if (!Notifications) {
      setPermission("unavailable");
      return;
    }

    let cancelled = false;

    (async () => {
      const result = await registerTokenIfNeeded(Notifications, registeredRef);
      if (!cancelled) setPermission(result.status);
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  const enablePush = useCallback(async (): Promise<PushPermissionStatus> => {
    const Notifications = loadNotifications();
    if (!Notifications) {
      setPermission("unavailable");
      return "unavailable";
    }

    // Sessions mock : permission locale seulement (pas d'appel CF)
    if (!isAuthenticated || !user || user.uid.startsWith("dev-")) {
      try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        if (existing === "granted") {
          setPermission("granted");
          return "granted";
        }
        const { status } = await Notifications.requestPermissionsAsync();
        const next: PushPermissionStatus =
          status === "granted" ? "granted" : status === "denied" ? "denied" : "unavailable";
        setPermission(next);
        return next;
      } catch {
        setPermission("unavailable");
        return "unavailable";
      }
    }

    const result = await registerTokenIfNeeded(Notifications, registeredRef);
    setPermission(result.status);
    return result.status;
  }, [isAuthenticated, user]);

  return { permission, enablePush };
}
