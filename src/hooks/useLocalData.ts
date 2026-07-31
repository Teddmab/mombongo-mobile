import { useQuery } from "@tanstack/react-query";
import {
  activity,
  agentReports,
  courseModules,
  courses,
  cropTasks,
  farmerAlerts,
  getCourseModules,
  merchantOrders,
  myListings,
  notifications,
  type ActivityItem,
  type AgentReport,
  type Course,
  type CourseModule,
  type CropTask,
  type FarmerAlert,
  type Instructor,
  type MerchantOrder,
  type MyListing,
  type Notification,
  type QuizQuestion,
} from "@/data/mock";

/** Réexport live — bourse / financement branchés Cloud Functions */
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

/** Données locales — pas encore de Cloud Functions ; mock en dev et prod. */
function useLocalQuery<T>(key: string, fetcher: () => T) {
  return useQuery({
    queryKey: ["local", key],
    queryFn: async () => fetcher(),
    staleTime: Infinity,
  });
}

export function useNotifications() {
  return useLocalQuery<Notification[]>("notifications", () => notifications);
}

export function useCourses() {
  return useLocalQuery<Course[]>("courses", () => courses);
}

export function useCourseModules(courseId?: string) {
  return useQuery({
    queryKey: ["local", "courseModules", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const course = courses.find((c) => c.id === courseId);
      return course ? getCourseModules(course) : [];
    },
    enabled: Boolean(courseId),
    staleTime: Infinity,
  });
}

export function useAllCourseModules() {
  return useLocalQuery<Record<string, CourseModule[]>>("allCourseModules", () => courseModules);
}

export function useAgentReports() {
  return useLocalQuery<AgentReport[]>("agentReports", () => agentReports);
}

export function useCropTasks() {
  return useLocalQuery<CropTask[]>("cropTasks", () => cropTasks);
}

export function useFarmerAlerts() {
  return useLocalQuery<FarmerAlert[]>("farmerAlerts", () => farmerAlerts);
}

export function useMyListings() {
  return useLocalQuery<MyListing[]>("myListings", () => myListings);
}

export function useMerchantOrders() {
  return useLocalQuery<MerchantOrder[]>("merchantOrders", () => merchantOrders);
}

export function useActivity() {
  return useLocalQuery<ActivityItem[]>("activity", () => activity);
}

export type {
  ActivityItem,
  AgentReport,
  Course,
  CourseModule,
  CropTask,
  FarmerAlert,
  Instructor,
  MerchantOrder,
  MyListing,
  Notification,
  QuizQuestion,
};
