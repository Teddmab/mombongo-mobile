import { useLocalSearchParams } from "expo-router";
import { FarmerDetailScreen } from "@/screens/FarmerDetailScreen";

export default function FarmerDetailRoute() {
  const { farmerId } = useLocalSearchParams<{ farmerId: string }>();
  return <FarmerDetailScreen farmerId={farmerId} />;
}
