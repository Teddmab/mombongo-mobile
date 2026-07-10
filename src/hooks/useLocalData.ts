import { useQuery } from "@tanstack/react-query";
import {
  activity,
  agentFarmers,
  agentReports,
  bourseOpportunities,
  bourseTicker,
  courseModules,
  courses,
  cropTasks,
  farmerAlerts,
  farmers,
  getCourseModules,
  merchantOrders,
  myListings,
  notifications,
  type ActivityItem,
  type AgentFarmerCard,
  type AgentReport,
  type BourseOpportunity,
  type BourseTicker,
  type Course,
  type CourseModule,
  type CropTask,
  type Farmer,
  type FarmerAlert,
  type Instructor,
  type MerchantOrder,
  type MyListing,
  type Notification,
  type QuizQuestion,
} from "@/data/mock";

/** Données locales — pas encore de Cloud Functions ; mock en dev et prod. */
function useLocalQuery<T>(key: string, fetcher: () => T) {
  return useQuery({
    queryKey: ["local", key],
    queryFn: async () => fetcher(),
    staleTime: Infinity,
  });
}

export function useBourseTicker() {
  return useLocalQuery<BourseTicker[]>("bourseTicker", () => bourseTicker);
}

export function useBourseOpportunities() {
  return useLocalQuery<BourseOpportunity[]>("bourseOpportunities", () => bourseOpportunities);
}

export function useNotifications() {
  return useLocalQuery<Notification[]>("notifications", () => notifications);
}

export function useFarmers() {
  return useLocalQuery<Farmer[]>("farmers", () => farmers);
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

export function useAgentFarmers() {
  return useLocalQuery<AgentFarmerCard[]>("agentFarmers", () => agentFarmers);
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
  AgentFarmerCard,
  AgentReport,
  BourseOpportunity,
  BourseTicker,
  Course,
  CourseModule,
  CropTask,
  Farmer,
  FarmerAlert,
  Instructor,
  MerchantOrder,
  MyListing,
  Notification,
  QuizQuestion,
};
