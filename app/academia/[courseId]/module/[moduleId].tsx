import { useLocalSearchParams } from "expo-router";
import { ModulePlayerScreen } from "@/screens/ModulePlayerScreen";

export default function ModulePlayerRoute() {
  const { courseId, moduleId } = useLocalSearchParams<{
    courseId: string;
    moduleId: string;
  }>();
  return <ModulePlayerScreen courseId={courseId} moduleId={moduleId} />;
}
