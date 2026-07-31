import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { MOCK_ACADEMIA_COURSES } from "@/data/mock";
import { functions, isDevMode } from "@/lib/firebase";

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

export function useCourses(category?: string) {
  return useQuery({
    queryKey: ["courses", category],
    queryFn: async (): Promise<AcademiaListCourse[]> => {
      if (isDevMode()) {
        let list = [...MOCK_ACADEMIA_COURSES];
        if (category) list = list.filter((c) => c.category === category);
        return list.map(toAcademiaListCourse);
      }
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
