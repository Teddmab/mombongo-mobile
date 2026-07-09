import { type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import i18n from "@/i18n";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <AppProvider>
        <AuthProvider>{children}</AuthProvider>
      </AppProvider>
    </I18nextProvider>
  );
}
