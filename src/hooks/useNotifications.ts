import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export interface Notification {
  id: string;
  kind: "profit" | "opportunity" | "report" | "course" | "system";
  title: string;
  body: string;
  time: string;
  date: string;
  read: boolean;
}

const READ_KEY_PREFIX = "mombongo.notif.readIds.";

function readKey(uid: string | undefined) {
  return `${READ_KEY_PREFIX}${uid ?? "anon"}`;
}

async function loadReadIds(uid: string | undefined): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(readKey(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

async function saveReadIds(uid: string | undefined, ids: string[]) {
  await AsyncStorage.setItem(readKey(uid), JSON.stringify([...new Set(ids)]));
}

function applyReadState(list: Notification[], readIds: string[]): Notification[] {
  if (readIds.length === 0) return list;
  return list.map((n) => (readIds.includes(n.id) ? { ...n, read: true } : n));
}

/**
 * Inbox notifications.
 * Pas de CF list encore (parity web NotificationPanel) — mocks + état lu local.
 */
export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.uid],
    queryFn: async (): Promise<Notification[]> => {
      const base: Notification[] = [];
      const readIds = await loadReadIds(user?.uid);
      return applyReadState(base, readIds);
    },
    staleTime: 60_000,
  });
}

export function useUnreadNotificationCount() {
  const { data = [] } = useNotifications();
  return data.filter((n) => !n.read).length;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const prev = await loadReadIds(user?.uid);
      const next = [...new Set([...prev, id])];
      await saveReadIds(user?.uid, next);
      return next;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications", user?.uid] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const prev = await loadReadIds(user?.uid);
      const next = [...new Set([...prev, ...ids])];
      await saveReadIds(user?.uid, next);
      return next;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications", user?.uid] });
    },
  });
}
