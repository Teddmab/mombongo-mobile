import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { NotoSans_400Regular, NotoSans_500Medium } from "@expo-google-fonts/noto-sans";
import { Providers } from "@/context/Providers";
import { LoadingScreen } from "@/screens/LoadingScreen";
import { useApp } from "@/context/AppContext";

function RootNavigator() {
  const { isReady } = useApp();

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="language" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="financement" />
        <Stack.Screen name="financement/[farmerId]" />
        <Stack.Screen name="report/new" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="portfolio" />
        <Stack.Screen name="market/[productId]" />
        <Stack.Screen name="bourse/[opportunityId]" />
        <Stack.Screen name="academia/[courseId]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    NotoSans_400Regular,
    NotoSans_500Medium,
  });

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <Providers>
        <RootNavigator />
      </Providers>
    </SafeAreaProvider>
  );
}
