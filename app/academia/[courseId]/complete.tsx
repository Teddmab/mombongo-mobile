import { useLocalSearchParams } from "expo-router";
import { CourseCompleteScreen } from "@/screens/CourseCompleteScreen";

export default function CourseCompleteRoute() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  return <CourseCompleteScreen courseId={courseId} />;
}
