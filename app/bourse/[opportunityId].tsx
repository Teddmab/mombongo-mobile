import { useLocalSearchParams } from "expo-router";
import { BourseDetailScreen } from "@/screens/BourseDetailScreen";

export default function BourseDetailRoute() {
  const { opportunityId } = useLocalSearchParams<{ opportunityId: string }>();
  return <BourseDetailScreen opportunityId={opportunityId} />;
}
