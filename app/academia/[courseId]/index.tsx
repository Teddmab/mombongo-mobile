import { useLocalSearchParams } from "expo-router";
import { CourseDetailScreen } from "@/screens/CourseDetailScreen";

export default function CourseDetailRoute() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  return <CourseDetailScreen courseId={courseId} />;
}
