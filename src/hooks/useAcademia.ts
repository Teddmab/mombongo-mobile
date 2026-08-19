import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { useAuth } from "@/hooks/useAuth";
import { functions } from "@/lib/firebase";

export interface AcademiaCourse {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  category: "agriculture" | "finance" | "commerce" | "technology" | string;
  level: "beginner" | "intermediate" | "advanced" | string;
  durationMinutes: number;
  moduleCount: number;
  thumbnail: string;
  instructor: string;
  isFeatured: boolean;
  enrollmentCount: number;
  status: "published" | "draft" | string;
}

export interface AcademiaModule {
  id: string;
  courseId: string;
  order: number;
  title: string;
  type: "video" | "pdf" | "quiz";
  youtubeVideoId?: string;
  pdfUrl?: string;
  durationMinutes: number;
  isFree: boolean;
  questions?: Array<{ q: string; options: string[]; answer: number }>;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  completedModules: string[];
  progressPct: number;
  enrolledAt: { seconds: number };
  completedAt: { seconds: number } | null;
}

/** Shape UI liste Academia (compat écrans existants) */
export interface AcademiaListCourse {
  id: string;
  title: string;
  category: string;
  duration: string;
  modules: number;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  progress: number;
  icon: string;
  image?: string;
  description: string;
  isPremium: boolean;
  previewModules: number;
  isFeatured: boolean;
  enrollmentCount: number;
  instructorName: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  agriculture: "Agriculture",
  finance: "Finance",
  commerce: "Commerce",
  technology: "Technologie",
};

const CATEGORY_ICONS: Record<string, string> = {
  agriculture: "🌱",
  finance: "💰",
  commerce: "📦",
  technology: "💻",
};

const LEVEL_LABELS: Record<string, AcademiaListCourse["level"]> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m.toString().padStart(2, "0")}min` : `${h}h 00min`;
}

export function toAcademiaListCourse(c: AcademiaCourse): AcademiaListCourse {
  return {
    id: c.id,
    title: c.title,
    category: CATEGORY_LABELS[c.category] ?? c.category,
    duration: formatDuration(c.durationMinutes ?? 0),
    modules: c.moduleCount ?? 0,
    level: LEVEL_LABELS[c.level] ?? "Débutant",
    progress: 0,
    icon: CATEGORY_ICONS[c.category] ?? "📚",
    image: c.thumbnail || undefined,
    description: c.description ?? "",
    isPremium: false,
    previewModules: c.moduleCount ?? 0,
    isFeatured: Boolean(c.isFeatured),
    enrollmentCount: c.enrollmentCount ?? 0,
    instructorName: c.instructor ?? "",
  };
}

function normalizeCourse(raw: Record<string, unknown>): AcademiaCourse {
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    titleEn: raw.titleEn ? String(raw.titleEn) : undefined,
    description: String(raw.description ?? ""),
    category: String(raw.category ?? "agriculture"),
    level: String(raw.level ?? "beginner"),
    durationMinutes: Number(raw.durationMinutes ?? 0),
    moduleCount: Number(raw.moduleCount ?? 0),
    thumbnail: String(raw.thumbnail ?? ""),
    instructor: String(raw.instructor ?? ""),
    isFeatured: Boolean(raw.isFeatured),
    enrollmentCount: Number(raw.enrollmentCount ?? 0),
    status: String(raw.status ?? "published"),
  };
}

function normalizeModule(raw: Record<string, unknown>): AcademiaModule {
  const typeRaw = String(raw.type ?? "video");
  const type: AcademiaModule["type"] =
    typeRaw === "pdf" || typeRaw === "quiz" ? typeRaw : "video";
  return {
    id: String(raw.id ?? ""),
    courseId: String(raw.courseId ?? ""),
    order: Number(raw.order ?? 0),
    title: String(raw.title ?? ""),
    type,
    youtubeVideoId: raw.youtubeVideoId ? String(raw.youtubeVideoId) : undefined,
    pdfUrl: raw.pdfUrl ? String(raw.pdfUrl) : undefined,
    durationMinutes: Number(raw.durationMinutes ?? 0),
    isFree: Boolean(raw.isFree),
    questions: Array.isArray(raw.questions)
      ? (raw.questions as AcademiaModule["questions"])
      : undefined,
  };
}

export function useCourses(category?: string) {
  return useQuery({
    queryKey: ["courses", category],
    queryFn: async (): Promise<AcademiaListCourse[]> => {
      const result = await httpsCallable<
        { category?: string },
        { courses: Record<string, unknown>[] }
      >(
        functions,
        "getCourses",
      )({ category });
      return (result.data.courses ?? [])
        .map(normalizeCourse)
        .filter((c) => c.status === "published" || !c.status)
        .map(toAcademiaListCourse);
    },
    staleTime: 120_000,
  });
}

export function useFeaturedCourses() {
  const { data = [], ...rest } = useCourses();
  return { data: data.filter((c) => c.isFeatured), ...rest };
}

export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: ["course", id],
    enabled: !!id,
    queryFn: async (): Promise<AcademiaListCourse | null> => {
      const result = await httpsCallable<{ id: string }, { course: Record<string, unknown> | null }>(
        functions,
        "getCourse",
      )({ id: id! });
      if (!result.data.course) return null;
      return toAcademiaListCourse(normalizeCourse(result.data.course));
    },
    staleTime: 120_000,
  });
}

export function useCourseModules(courseId: string | undefined) {
  return useQuery({
    queryKey: ["modules", courseId],
    enabled: !!courseId,
    queryFn: async (): Promise<AcademiaModule[]> => {
      const result = await httpsCallable<
        { courseId: string },
        { modules: Record<string, unknown>[] }
      >(
        functions,
        "getCourseModules",
      )({ courseId: courseId! });
      return (result.data.modules ?? [])
        .map(normalizeModule)
        .sort((a, b) => a.order - b.order);
    },
    staleTime: 120_000,
  });
}

export function useMyEnrollment(courseId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["enrollment", user?.uid, courseId],
    enabled: !!courseId && !!user?.uid,
    queryFn: async (): Promise<Enrollment | null> => {
      if (!user?.uid) return null;
      const result = await httpsCallable<
        { courseId: string },
        { enrollment: Enrollment | null }
      >(
        functions,
        "getMyEnrollment",
      )({ courseId: courseId! });
      return result.data.enrollment;
    },
    staleTime: 60_000,
  });
}

export function useEnrollCourse() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const result = await httpsCallable<
        { courseId: string },
        { success: boolean; enrollmentId: string }
      >(
        functions,
        "enrollCourse",
      )({ courseId });
      return result.data;
    },
    onSuccess: (_data, courseId) => {
      void qc.invalidateQueries({ queryKey: ["enrollment", user?.uid, courseId] });
      void qc.invalidateQueries({ queryKey: ["course", courseId] });
      void qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useMarkModuleComplete() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (payload: { courseId: string; moduleId: string }) => {
      const result = await httpsCallable<
        { courseId: string; moduleId: string },
        { progressPct?: number; isCompleted?: boolean; success?: boolean }
      >(
        functions,
        "markModuleComplete",
      )(payload);
      return {
        progressPct: result.data.progressPct ?? 0,
        isCompleted: Boolean(result.data.isCompleted),
      };
    },
    onSuccess: (_data, { courseId }) => {
      void qc.invalidateQueries({ queryKey: ["enrollment", user?.uid, courseId] });
    },
  });
}
