import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/screens/LoadingScreen";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Redirect href="/(tabs)/home" />;
  return <Redirect href="/language" />;
}
