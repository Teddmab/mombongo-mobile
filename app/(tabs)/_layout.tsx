import { Redirect, Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/shell/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { useTabContentInsets } from "@/hooks/useSafeInsets";
import { LoadingScreen } from "@/screens/LoadingScreen";
import { TAB_BAR_HEIGHT } from "@/constants/layout";
import { colors } from "@/theme";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OnboardingScreen, ONBOARDING_STORAGE_KEY, addOnboardingResetListener } from "@/screens/OnboardingScreen";

export default function TabsLayout() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const { bottomInset } = useTabContentInsets();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_STORAGE_KEY).then((val) => {
      setShowOnboarding(val === null);
    });
    return addOnboardingResetListener(() => setShowOnboarding(true));
  }, []);

  if (isLoading || showOnboarding === null) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect href="/auth" />;
  if (showOnboarding) return <OnboardingScreen onDone={() => setShowOnboarding(false)} />;

  return (
    <View style={styles.root}>
      <AppHeader />
      <Tabs
        safeAreaInsets={{ bottom: bottomInset, top: 0, left: 0, right: 0 }}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.green[700],
          tabBarInactiveTintColor: colors.gray[400],
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.gray[200],
            paddingTop: 6,
            paddingBottom: bottomInset,
            height: TAB_BAR_HEIGHT + bottomInset,
          },
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: t("nav.home"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="market"
          options={{
            title: t("nav.market"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bag-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bourse"
          options={{
            title: t("nav.bourse"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trending-up-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="academia"
          options={{
            title: t("nav.academia"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="school-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("nav.profile"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBackground },
  tabLabel: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans_700Bold",
    fontWeight: "700",
  },
});
