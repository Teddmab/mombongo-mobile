import { useQuery } from "@tanstack/react-query";

export { useNotifications, useUnreadNotificationCount, useMarkNotificationRead, useMarkAllNotificationsRead, type Notification } from "@/hooks/useNotifications";

/** Re-export live hooks — these call real Cloud Functions */
export {
  useBourseOpportunities,
  useBourseOpportunity,
  useBoursePrices,
  useBourseTicker,
  type BourseOpportunity,
  type BourseTicker,
} from "@/hooks/useBourse";

export {
  useAgentFarmers,
  useCreateFinancingApplication,
  useCulturalEvents,
  useFarmer,
  useFarmers,
  type AgentFarmerCard,
  type CulturalEvent,
  type Farmer,
  type FarmerListing,
} from "@/hooks/useFinancing";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Instructor {
  name: string;
  title: string;
  image: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  modules: number;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  progress: number;
  icon: string;
  image?: string;
  heroImage?: string;
  instructor?: Instructor;
  description: string;
  isPremium: boolean;
  previewModules: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface CourseModule {
  title: string;
  type: "video" | "reading" | "quiz";
  duration: string;
  content?: string;
  quiz?: QuizQuestion[];
}

export interface ActivityItem {
  id: string;
  kind: "profit" | "opportunity" | "report" | "course";
  title: string;
  subtitle: string;
  amount?: string;
  cta?: string;
  time: string;
  tone: "green" | "amber" | "blue";
}

export interface CropTask {
  id: string;
  title: string;
  date: string;
  done: boolean;
  type: "irrigation" | "fertilisation" | "traitement" | "récolte" | "visite";
}

export interface FarmerAlert {
  id: string;
  kind: "weather" | "market" | "agent" | "payment";
  title: string;
  body: string;
  time: string;
  urgent: boolean;
}

export interface AgentReport {
  id: string;
  farmerName: string;
  crop: string;
  region: string;
  submittedAt: string;
  status: "validé" | "en attente" | "rejeté";
}

export interface MyListing {
  id: string;
  name: string;
  category: string;
  icon: string;
  quantity: number;
  unit: string;
  pricePerUnitFC: number;
  region: string;
  harvestDate: string;
  status: "en vente" | "vendu" | "brouillon" | "expiré";
  investorsCount: number;
  fundingPct: number;
  targetUsd: number;
}

export interface MerchantOrder {
  id: string;
  product: string;
  icon: string;
  supplier: string;
  region: string;
  quantity: number;
  unit: string;
  pricePerUnitFC: number;
  totalUsd: number;
  status: "en cours" | "livré" | "annulé" | "en attente";
  deliveryDate: string;
  category: string;
}

// ─── Hooks (return empty arrays until Cloud Functions are built) ─────────────

function useLocalQuery<T>(key: string, data: T) {
  return useQuery({
    queryKey: ["local", key],
    queryFn: async () => data,
    staleTime: Infinity,
  });
}

export function useCourses() {
  return useLocalQuery<Course[]>("courses", []);
}

export function useCourseModules(_courseId?: string) {
  return useQuery({
    queryKey: ["local", "courseModules", _courseId],
    queryFn: async (): Promise<CourseModule[]> => [],
    enabled: Boolean(_courseId),
    staleTime: Infinity,
  });
}

export function useAllCourseModules() {
  return useLocalQuery<Record<string, CourseModule[]>>("allCourseModules", {});
}

export function useAgentReports() {
  return useLocalQuery<AgentReport[]>("agentReports", []);
}

export function useCropTasks() {
  return useLocalQuery<CropTask[]>("cropTasks", []);
}

export function useFarmerAlerts() {
  return useLocalQuery<FarmerAlert[]>("farmerAlerts", []);
}

export function useMyListings() {
  return useLocalQuery<MyListing[]>("myListings", []);
}

export function useMerchantOrders() {
  return useLocalQuery<MerchantOrder[]>("merchantOrders", []);
}

export function useActivity() {
  return useLocalQuery<ActivityItem[]>("activity", []);
}
