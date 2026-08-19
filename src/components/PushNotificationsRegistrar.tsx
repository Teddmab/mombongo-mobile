import { usePushNotifications } from "@/hooks/usePushNotifications";

/** Monte l'enregistrement FCM dans l'arbre AuthProvider. */
export function PushNotificationsRegistrar() {
  usePushNotifications();
  return null;
}
