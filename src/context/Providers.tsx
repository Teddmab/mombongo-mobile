import { type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { PushNotificationsRegistrar } from "@/components/PushNotificationsRegistrar";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProfileRoleSync } from "@/context/ProfileRoleSync";
import i18n from "@/i18n";
import { queryClient } from "@/lib/queryClient";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AppProvider>
          <AuthProvider>
            <ProfileRoleSync />
            <PushNotificationsRegistrar />
            {children}
          </AuthProvider>
        </AppProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
