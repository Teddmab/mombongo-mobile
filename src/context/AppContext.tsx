import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { getStoredLang, getStoredRole, setStoredLang, setStoredRole } from "@/lib/storage";

export type Lang = "fr" | "en" | "ln";
export type Role = "investor" | "farmer" | "merchant" | "agent";

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  role: Role;
  setRole: (r: Role) => void;
  isReady: boolean;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [lang, setLangState] = useState<Lang>("fr");
  const [role, setRoleState] = useState<Role>("investor");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [storedLang, storedRole] = await Promise.all([
        getStoredLang(),
        getStoredRole(),
      ]);
      if (storedLang === "fr" || storedLang === "en" || storedLang === "ln") {
        setLangState(storedLang);
      }
      if (
        storedRole === "investor" ||
        storedRole === "farmer" ||
        storedRole === "merchant" ||
        storedRole === "agent"
      ) {
        setRoleState(storedRole);
      }
      setIsReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    void i18n.changeLanguage(lang);
    void setStoredLang(lang);
  }, [lang, i18n, isReady]);

  useEffect(() => {
    if (!isReady) return;
    void setStoredRole(role);
  }, [role, isReady]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const setRole = useCallback((r: Role) => setRoleState(r), []);

  return (
    <Ctx.Provider value={{ lang, setLang, role, setRole, isReady }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}
